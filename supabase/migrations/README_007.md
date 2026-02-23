# Migración 007: Componentes de Arreglos Personalizados

## Descripción

Esta migración extiende la tabla `products` para soportar el sistema "Arma tu Arreglo", un constructor interactivo que permite a los clientes personalizar arreglos florales.

## Cambios Realizados

### 1. Nuevos Campos en `products`

- **`component_category`** (TEXT, nullable)
  - Valores permitidos: 'BASE', 'FLORES', 'GLOBOS', 'EXTRAS'
  - Constraint CHECK para validar valores
  - NULL para productos regulares (no componentes)
  
- **`component_order`** (INTEGER, default: 0)
  - Controla el orden de visualización en el selector de componentes
  - Menor número = mayor prioridad de visualización

### 2. Índice de Optimización

- **`idx_products_component_category`**
  - Índice compuesto en `(component_category, active)`
  - Filtrado parcial: solo productos con `category = 'componente-arreglo'` y `active = true`
  - Optimiza las consultas frecuentes del constructor de arreglos

## Uso

### Identificar Componentes

Los componentes del constructor se identifican mediante:
1. `category = 'componente-arreglo'` (categoría especial de producto)
2. `component_category` define el tipo: BASE, FLORES, GLOBOS, EXTRAS
3. `active = true` para componentes disponibles

### Ejemplo de Consulta

```sql
-- Obtener todas las bases activas ordenadas
SELECT id, name, component_order, variants[1].price as price, images[1] as image
FROM products
WHERE category = 'componente-arreglo'
  AND component_category = 'BASE'
  AND active = true
ORDER BY component_order ASC, name ASC;
```

### Ejemplo de Inserción

```sql
-- Insertar una base de arreglo
INSERT INTO products (
  name, 
  description, 
  category, 
  component_category, 
  component_order,
  active
) VALUES (
  'Canasto de Mimbre Grande',
  'Base de canasto de mimbre para arreglos florales',
  'componente-arreglo',
  'BASE',
  1,
  true
);
```

## Compatibilidad

- ✅ Los productos existentes no se ven afectados (campos nullable)
- ✅ El índice solo afecta a componentes de arreglo
- ✅ Totalmente compatible con la estructura actual de productos

## Rollback

Si necesitas revertir esta migración:

```sql
-- Eliminar índice
DROP INDEX IF EXISTS idx_products_component_category;

-- Eliminar campos
ALTER TABLE public.products DROP COLUMN IF EXISTS component_order;
ALTER TABLE public.products DROP COLUMN IF EXISTS component_category;
```

## Relacionado

- Spec: `.kiro/specs/arma-tu-arreglo/`
- Requirements: 1.1, 1.2, 12.1, 12.2, 12.3
- Design: Ver `design.md` para arquitectura completa del sistema

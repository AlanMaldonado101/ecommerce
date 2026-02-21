# Image Upload UUID Error Fix - Bugfix Design

## Overview

Este bugfix aborda un error crítico en la función `updateProduct` que ocurre cuando se intenta actualizar un producto sin variantes actuales. El problema se manifiesta como un error de sintaxis SQL "invalid input syntax for type uuid: ''" que causa un fallo 400 Bad Request, impidiendo que las actualizaciones de productos (incluyendo la carga de imágenes) se completen exitosamente.

La estrategia de corrección consiste en detectar cuando `currentVariantIds` está vacío y manejar este caso especial: si no hay variantes que preservar, se deben eliminar todas las variantes antiguas del producto usando una condición SQL válida o simplemente omitiendo la cláusula `.not()`.

## Glossary

- **Bug_Condition (C)**: La condición que desencadena el bug - cuando `currentVariantIds` es un array vacío y se intenta construir una consulta SQL con `.not('id', 'in', '()')` usando un string vacío
- **Property (P)**: El comportamiento deseado cuando no hay variantes actuales - eliminar todas las variantes antiguas sin generar errores de sintaxis SQL
- **Preservation**: El comportamiento existente de eliminación selectiva de variantes que debe permanecer sin cambios cuando `currentVariantIds` contiene uno o más IDs válidos
- **updateProduct**: La función en `src/actions/product.ts` (línea 462) que actualiza productos y gestiona sus variantes
- **currentVariantIds**: Array que contiene los IDs de las variantes que deben preservarse (combinación de variantes existentes actualizadas y nuevas variantes creadas)
- **Supabase .not() clause**: Cláusula SQL que excluye registros donde una columna está en un conjunto de valores - requiere sintaxis válida `'(value1,value2,...)'`

## Bug Details

### Fault Condition

El bug se manifiesta cuando se actualiza un producto que no tiene variantes actuales para preservar. La función `updateProduct` construye un array `currentVariantIds` combinando variantes existentes y nuevas. Cuando este array está vacío, la expresión `currentVariantIds.join(',')` retorna un string vacío `""`, generando una consulta SQL inválida `.not('id', 'in', '()')` que Supabase rechaza con un error de sintaxis UUID.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type UpdateProductContext
  OUTPUT: boolean
  
  RETURN input.currentVariantIds.length == 0
         AND input.productHasOldVariants == true
         AND deleteVariantsQueryExecuted == true
END FUNCTION
```

### Examples

- **Ejemplo 1**: Producto con 2 variantes antiguas, se actualizan 0 variantes existentes, se crean 0 variantes nuevas
  - `currentVariantIds = []`
  - Query generada: `.not('id', 'in', '()')`
  - Resultado: Error 400 "invalid input syntax for type uuid: ''"
  - Esperado: Eliminar las 2 variantes antiguas sin error

- **Ejemplo 2**: Producto con 3 variantes antiguas, todas se eliminan en la actualización
  - `currentVariantIds = []`
  - Query generada: `.not('id', 'in', '()')`
  - Resultado: Error 400 y la actualización del producto falla
  - Esperado: Eliminar las 3 variantes antiguas y completar la actualización

- **Ejemplo 3**: Producto sin variantes, se intenta actualizar sin agregar variantes
  - `currentVariantIds = []`
  - Query generada: `.not('id', 'in', '()')`
  - Resultado: Error 400 (aunque no hay variantes que eliminar)
  - Esperado: No ejecutar la query de eliminación o usar condición que no falle

- **Edge Case**: Producto con variantes antiguas, se actualiza con 1 variante nueva
  - `currentVariantIds = ['uuid-123']`
  - Query generada: `.not('id', 'in', '(uuid-123)')`
  - Resultado: Funciona correctamente, elimina variantes antiguas excepto 'uuid-123'
  - Esperado: Mantener este comportamiento sin cambios

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Cuando `currentVariantIds` contiene uno o más IDs válidos, el sistema debe continuar eliminando solo las variantes que no están en la lista
- La actualización de campos del producto (nombre, categoría, descripción, etc.) debe continuar funcionando exactamente igual
- El procesamiento de imágenes (subir nuevas, eliminar antiguas, actualizar URLs) debe continuar funcionando sin cambios
- La sincronización de ocasiones (product_occasions) debe continuar funcionando sin cambios
- El manejo de variantes existentes y nuevas variantes debe continuar funcionando sin cambios

**Scope:**
Todas las entradas que NO involucran un array `currentVariantIds` vacío deben ser completamente inalteradas por esta corrección. Esto incluye:
- Actualizaciones de productos con variantes existentes que se preservan
- Actualizaciones de productos donde se agregan nuevas variantes
- Actualizaciones de productos donde se modifican variantes existentes
- Cualquier otra operación de actualización de productos que no active la condición del bug

## Hypothesized Root Cause

Basado en la descripción del bug y el análisis del código, las causas más probables son:

1. **Manejo Inadecuado de Array Vacío**: La expresión `currentVariantIds.join(',')` retorna un string vacío `""` cuando el array está vacío, lo que genera la sintaxis SQL inválida `'()'` en lugar de una condición válida.

2. **Falta de Validación Condicional**: El código no verifica si `currentVariantIds` está vacío antes de construir la consulta `.not()`. Debería haber una condición que detecte este caso y use una estrategia alternativa.

3. **Lógica de Eliminación Incorrecta**: Cuando no hay variantes que preservar (`currentVariantIds` vacío), la intención es eliminar TODAS las variantes antiguas. La consulta `.not('id', 'in', '()')` intenta expresar "eliminar donde id NO está en conjunto vacío", pero Supabase no acepta esta sintaxis.

4. **Fallback Inadecuado**: Aunque hay un fallback `currentVariantIds ? currentVariantIds.join(',') : 0`, el valor `0` no es un UUID válido y tampoco resuelve el problema correctamente.

## Correctness Properties

Property 1: Fault Condition - Empty Variant Array Handling

_For any_ update operation where `currentVariantIds` is an empty array and the product has old variants to delete, the fixed `updateProduct` function SHALL successfully delete all old variants without generating SQL syntax errors, allowing the product update operation to complete successfully.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Non-Empty Variant Array Behavior

_For any_ update operation where `currentVariantIds` contains one or more valid UUIDs, the fixed `updateProduct` function SHALL produce exactly the same behavior as the original function, preserving the selective deletion logic that keeps specified variants and removes only those not in the list.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

Asumiendo que nuestro análisis de causa raíz es correcto:

**File**: `src/actions/product.ts`

**Function**: `updateProduct` (líneas 456-466)

**Specific Changes**:

1. **Add Conditional Check**: Antes de ejecutar la query de eliminación de variantes, verificar si `currentVariantIds` está vacío.

2. **Handle Empty Array Case**: Si `currentVariantIds.length === 0`, usar una de estas estrategias:
   - **Opción A (Recomendada)**: Eliminar todas las variantes sin usar `.not()` - simplemente usar `.delete().eq('product_id', productId)`
   - **Opción B**: Omitir completamente la query de eliminación si no hay variantes que preservar
   - **Opción C**: Usar una condición SQL siempre verdadera como `.not('id', 'is', null)` para eliminar todo

3. **Preserve Existing Logic**: Si `currentVariantIds.length > 0`, mantener la lógica actual con `.not('id', 'in', `(${currentVariantIds.join(',')})`)`

4. **Remove Ineffective Fallback**: Eliminar el fallback `: 0` ya que no resuelve el problema y puede causar confusión

5. **Add Code Comment**: Documentar por qué se necesita el manejo especial del array vacío para futuros mantenedores

**Pseudocódigo de la corrección:**
```typescript
// 5.4 Eliminar las variantes que no están en la lista de IDs
if (currentVariantIds.length > 0) {
  // Caso normal: eliminar variantes que NO están en la lista
  const { error: deleteVariantsError } = await supabase
    .from('variants')
    .delete()
    .eq('product_id', productId)
    .not('id', 'in', `(${currentVariantIds.join(',')})`);
  
  if (deleteVariantsError) throw new Error(deleteVariantsError.message);
} else {
  // Caso especial: no hay variantes que preservar, eliminar todas
  const { error: deleteVariantsError } = await supabase
    .from('variants')
    .delete()
    .eq('product_id', productId);
  
  if (deleteVariantsError) throw new Error(deleteVariantsError.message);
}
```

## Testing Strategy

### Validation Approach

La estrategia de testing sigue un enfoque de dos fases: primero, demostrar el bug en el código sin corregir ejecutando casos de prueba que fallen, luego verificar que la corrección funciona correctamente y preserva el comportamiento existente.

### Exploratory Fault Condition Checking

**Goal**: Demostrar el bug ANTES de implementar la corrección. Confirmar o refutar el análisis de causa raíz. Si refutamos, necesitaremos re-hipotetizar.

**Test Plan**: Escribir tests que simulen actualizaciones de productos con `currentVariantIds` vacío y verificar que la operación falla con el error UUID esperado. Ejecutar estos tests en el código SIN CORREGIR para observar los fallos y confirmar la causa raíz.

**Test Cases**:
1. **Empty Variants Update Test**: Actualizar un producto que tiene 2 variantes antiguas, sin preservar ninguna variante (fallará en código sin corregir con error UUID)
2. **Remove All Variants Test**: Actualizar un producto eliminando todas sus variantes existentes (fallará en código sin corregir con error 400)
3. **No Variants Product Test**: Actualizar un producto que nunca tuvo variantes (puede fallar en código sin corregir si ejecuta la query)
4. **Image Upload with Empty Variants**: Intentar subir imágenes a un producto sin variantes actuales (fallará en código sin corregir, bloqueando la carga de imágenes)

**Expected Counterexamples**:
- Error 400 Bad Request con mensaje "invalid input syntax for type uuid: ''"
- La operación de actualización completa falla y se revierte
- Las imágenes no se cargan debido al fallo en la transacción
- Posibles causas confirmadas: `currentVariantIds.join(',')` retorna `""`, generando sintaxis SQL inválida `'()'`

### Fix Checking

**Goal**: Verificar que para todas las entradas donde la condición del bug se cumple, la función corregida produce el comportamiento esperado.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := updateProduct_fixed(input)
  ASSERT result.success == true
  ASSERT result.oldVariantsDeleted == true
  ASSERT result.noSQLError == true
END FOR
```

**Test Cases**:
1. Verificar que productos con array vacío de variantes se actualizan exitosamente
2. Verificar que todas las variantes antiguas se eliminan cuando `currentVariantIds` está vacío
3. Verificar que las imágenes se cargan correctamente después de la corrección
4. Verificar que no se generan errores de sintaxis SQL en ningún escenario

### Preservation Checking

**Goal**: Verificar que para todas las entradas donde la condición del bug NO se cumple, la función corregida produce exactamente el mismo resultado que la función original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT updateProduct_original(input) = updateProduct_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing es recomendado para preservation checking porque:
- Genera muchos casos de prueba automáticamente a través del dominio de entrada
- Detecta casos edge que los tests unitarios manuales podrían omitir
- Proporciona garantías sólidas de que el comportamiento no cambia para todas las entradas no-buggy

**Test Plan**: Observar el comportamiento en código SIN CORREGIR primero para actualizaciones con variantes existentes, luego escribir property-based tests capturando ese comportamiento.

**Test Cases**:
1. **Single Variant Preservation**: Observar que actualizar un producto preservando 1 variante funciona correctamente en código sin corregir, luego verificar que continúa funcionando después de la corrección
2. **Multiple Variants Preservation**: Observar que actualizar un producto preservando múltiples variantes funciona correctamente en código sin corregir, luego verificar que continúa funcionando después de la corrección
3. **Mixed Operations Preservation**: Observar que actualizar campos del producto, imágenes y ocasiones funciona correctamente en código sin corregir, luego verificar que continúa funcionando después de la corrección
4. **Variant Deletion Logic**: Observar que las variantes NO incluidas en `currentVariantIds` se eliminan correctamente en código sin corregir, luego verificar que continúa funcionando después de la corrección

### Unit Tests

- Test de actualización de producto con `currentVariantIds` vacío (debe pasar después de la corrección)
- Test de actualización de producto con 1 variante en `currentVariantIds` (debe pasar antes y después)
- Test de actualización de producto con múltiples variantes en `currentVariantIds` (debe pasar antes y después)
- Test de edge case: producto sin variantes antiguas y `currentVariantIds` vacío (debe pasar después de la corrección)
- Test de que la query SQL generada es válida en ambos casos (array vacío y no vacío)

### Property-Based Tests

- Generar arrays aleatorios de variant IDs (incluyendo arrays vacíos) y verificar que todas las actualizaciones se completan sin errores SQL
- Generar configuraciones aleatorias de productos (con/sin variantes, con/sin imágenes) y verificar que el comportamiento de preservación se mantiene
- Generar escenarios aleatorios de actualización y verificar que las variantes correctas se eliminan en todos los casos

### Integration Tests

- Test de flujo completo: crear producto con variantes, actualizar eliminando todas las variantes, verificar que la operación se completa
- Test de flujo completo: actualizar producto sin variantes y subir imágenes simultáneamente
- Test de flujo completo: actualizar producto preservando algunas variantes y eliminando otras
- Test de que la UI puede completar operaciones de actualización de productos sin errores 400

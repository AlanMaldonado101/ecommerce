# Bugfix Requirements Document

## Introduction

Este documento describe el bug que ocurre al actualizar productos cuando no hay variantes actuales. El error se manifiesta como "invalid input syntax for type uuid: ''" y causa un fallo 400 Bad Request en la operación de actualización de productos, impidiendo que las imágenes se carguen correctamente.

El problema está en la función `updateProduct` en `src/actions/product.ts` línea 304, donde se construye una consulta SQL para eliminar variantes antiguas. Cuando el array `currentVariantIds` está vacío, la expresión `currentVariantIds.join(',')` retorna un string vacío `""`, generando una consulta SQL inválida `.not('id', 'in', '()')` que Supabase no puede procesar.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN `currentVariantIds` es un array vacío THEN el sistema genera la consulta `.not('id', 'in', '()')` con un string vacío como parámetro

1.2 WHEN la consulta `.not('id', 'in', '()')` se ejecuta con un string vacío THEN Supabase retorna error 400 con mensaje "invalid input syntax for type uuid: ''"

1.3 WHEN el error ocurre durante la actualización del producto THEN la operación completa falla y las imágenes no se cargan

### Expected Behavior (Correct)

2.1 WHEN `currentVariantIds` es un array vacío THEN el sistema SHALL omitir la consulta de eliminación de variantes o usar una condición SQL válida

2.2 WHEN no hay variantes actuales para preservar THEN el sistema SHALL eliminar todas las variantes antiguas del producto sin generar errores de sintaxis SQL

2.3 WHEN la actualización del producto se ejecuta correctamente THEN el sistema SHALL completar la operación y cargar las imágenes sin errores

### Unchanged Behavior (Regression Prevention)

3.1 WHEN `currentVariantIds` contiene uno o más IDs válidos THEN el sistema SHALL CONTINUE TO eliminar solo las variantes que no están en la lista

3.2 WHEN se actualizan productos con variantes existentes THEN el sistema SHALL CONTINUE TO preservar las variantes especificadas en `currentVariantIds`

3.3 WHEN se procesan imágenes durante la actualización THEN el sistema SHALL CONTINUE TO subir, eliminar y actualizar imágenes correctamente

3.4 WHEN se actualizan otros campos del producto (nombre, categoría, descripción, etc.) THEN el sistema SHALL CONTINUE TO actualizar estos campos sin afectar su funcionalidad

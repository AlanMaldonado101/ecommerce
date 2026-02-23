# Requirements Document

## Introduction

Este documento define los requisitos para la funcionalidad "Arma tu Arreglo", un constructor interactivo que permite a los clientes personalizar arreglos florales seleccionando base, flores, globos y extras, con visualización en tiempo real y cálculo automático de precio. Los componentes se gestionan mediante el formulario de productos existente y los arreglos personalizados se agregan al carrito de compras para proceder al checkout.

## Glossary

- **Custom_Arrangement_Builder**: El sistema completo de construcción de arreglos personalizados
- **Base_Component**: Elemento fundamental del arreglo (canasto, maceta, caja)
- **Flower_Component**: Tipo de flor seleccionable para el arreglo
- **Balloon_Component**: Globo opcional que se puede agregar al arreglo
- **Extra_Component**: Elemento adicional opcional (moño, tarjeta, luces LED)
- **Component_Category**: Agrupación de componentes (BASE, FLORES, GLOBOS, EXTRAS)
- **Preview_Canvas**: Área de visualización donde se muestra el arreglo en construcción
- **Configuration**: Conjunto completo de componentes seleccionados por el usuario
- **Price_Calculator**: Módulo que calcula el precio total del arreglo personalizado
- **Component_Selector**: Interfaz para seleccionar componentes de cada categoría
- **Shopping_Cart**: Sistema de carrito de compras existente donde se agregan los arreglos personalizados
- **Arrangement_Group**: Conjunto de items en el carrito que pertenecen al mismo arreglo personalizado
- **Product_Form**: Formulario existente para añadir y editar productos en el dashboard

## Requirements

### Requirement 1: Gestión de Componentes de Arreglo

**User Story:** Como administrador, quiero agregar productos como componentes del constructor usando el formulario de añadir producto existente, para que pueda gestionar componentes con la misma interfaz que uso para productos regulares.

#### Acceptance Criteria

1. THE Custom_Arrangement_Builder SHALL utilizar productos del sistema existente como componentes
2. WHEN un administrador agrega un producto, THE Custom_Arrangement_Builder SHALL permitir marcarlo como componente de arreglo mediante el formulario de añadir producto
3. WHEN un producto es marcado como componente, THE Custom_Arrangement_Builder SHALL requerir asignar una categoría de componente: BASE, FLORES, GLOBOS o EXTRAS
4. THE Custom_Arrangement_Builder SHALL mostrar solo productos activos marcados como componentes en la interfaz de selección
5. THE Custom_Arrangement_Builder SHALL permitir que un producto sea tanto componente como producto regular simultáneamente

### Requirement 2: Selección de Base del Arreglo

**User Story:** Como cliente, quiero seleccionar la base de mi arreglo, para que pueda elegir el contenedor que más me guste.

#### Acceptance Criteria

1. WHEN el cliente accede al Custom_Arrangement_Builder, THE Component_Selector SHALL mostrar todas las bases activas disponibles
2. THE Custom_Arrangement_Builder SHALL requerir exactamente una Base_Component seleccionada
3. WHEN el cliente selecciona una base, THE Preview_Canvas SHALL actualizar la visualización
4. WHEN el cliente selecciona una base diferente, THE Custom_Arrangement_Builder SHALL reemplazar la base anterior
5. THE Price_Calculator SHALL incluir el precio de la Base_Component en el total

### Requirement 3: Selección de Flores

**User Story:** Como cliente, quiero seleccionar uno o más tipos de flores, para que pueda crear la combinación que deseo.

#### Acceptance Criteria

1. WHEN el cliente accede a la categoría FLORES, THE Component_Selector SHALL mostrar todas las flores activas disponibles
2. THE Custom_Arrangement_Builder SHALL permitir seleccionar múltiples Flower_Component simultáneamente
3. WHEN el cliente selecciona una flor, THE Preview_Canvas SHALL agregar la flor a la visualización
4. WHEN el cliente deselecciona una flor, THE Preview_Canvas SHALL remover la flor de la visualización
5. THE Price_Calculator SHALL sumar el precio de cada Flower_Component seleccionada al total

### Requirement 4: Selección de Globos Opcionales

**User Story:** Como cliente, quiero agregar globos opcionales a mi arreglo, para que pueda hacerlo más festivo.

#### Acceptance Criteria

1. WHEN el cliente accede a la categoría GLOBOS, THE Component_Selector SHALL mostrar todos los globos activos disponibles
2. THE Custom_Arrangement_Builder SHALL permitir seleccionar múltiples Balloon_Component simultáneamente
3. WHEN el cliente selecciona un globo, THE Preview_Canvas SHALL agregar el globo a la visualización
4. WHEN el cliente deselecciona un globo, THE Preview_Canvas SHALL remover el globo de la visualización
5. THE Price_Calculator SHALL sumar el precio de cada Balloon_Component seleccionada al total

### Requirement 5: Selección de Extras

**User Story:** Como cliente, quiero agregar extras como moños, tarjetas o luces LED, para que pueda personalizar completamente mi arreglo.

#### Acceptance Criteria

1. WHEN el cliente accede a la categoría EXTRAS, THE Component_Selector SHALL mostrar todos los extras activos disponibles
2. THE Custom_Arrangement_Builder SHALL permitir seleccionar múltiples Extra_Component simultáneamente
3. WHEN el cliente selecciona un extra, THE Preview_Canvas SHALL agregar el extra a la visualización
4. WHEN el cliente deselecciona un extra, THE Preview_Canvas SHALL remover el extra de la visualización
5. THE Price_Calculator SHALL sumar el precio de cada Extra_Component seleccionada al total

### Requirement 6: Visualización en Tiempo Real

**User Story:** Como cliente, quiero ver una representación visual de mi arreglo mientras lo construyo, para que pueda visualizar cómo quedará el resultado final.

#### Acceptance Criteria

1. THE Preview_Canvas SHALL mostrar una composición visual de todos los componentes seleccionados
2. WHEN el cliente selecciona o deselecciona un componente, THE Preview_Canvas SHALL actualizar la visualización inmediatamente
3. WHILE ninguna Base_Component está seleccionada, THE Preview_Canvas SHALL mostrar un mensaje indicando que se debe seleccionar una base
4. THE Preview_Canvas SHALL mostrar las imágenes de los componentes en capas según su categoría
5. THE Preview_Canvas SHALL mantener proporciones visuales coherentes entre componentes

### Requirement 7: Cálculo de Precio Total

**User Story:** Como cliente, quiero ver el precio total de mi arreglo personalizado, para que pueda tomar una decisión de compra informada.

#### Acceptance Criteria

1. THE Price_Calculator SHALL calcular el precio total sumando todos los componentes seleccionados
2. WHEN el cliente selecciona o deselecciona un componente, THE Price_Calculator SHALL recalcular el total inmediatamente
3. THE Custom_Arrangement_Builder SHALL mostrar el precio total de forma visible y destacada
4. THE Price_Calculator SHALL formatear el precio en la moneda configurada del sistema
5. WHILE ninguna Base_Component está seleccionada, THE Price_Calculator SHALL mostrar precio cero o un mensaje indicativo

### Requirement 8: Reinicio de Diseño

**User Story:** Como cliente, quiero poder reiniciar mi diseño desde cero, para que pueda empezar de nuevo si cambio de opinión.

#### Acceptance Criteria

1. THE Custom_Arrangement_Builder SHALL proporcionar un botón "REINICIAR DISEÑO"
2. WHEN el cliente presiona "REINICIAR DISEÑO", THE Custom_Arrangement_Builder SHALL solicitar confirmación
3. WHEN el cliente confirma el reinicio, THE Custom_Arrangement_Builder SHALL deseleccionar todos los componentes
4. WHEN el cliente confirma el reinicio, THE Preview_Canvas SHALL volver al estado inicial
5. WHEN el cliente confirma el reinicio, THE Price_Calculator SHALL mostrar precio cero

### Requirement 9: Agregar Arreglo al Carrito

**User Story:** Como cliente, quiero agregar mi arreglo personalizado al carrito de compras, para que pueda continuar comprando o proceder al checkout.

#### Acceptance Criteria

1. THE Custom_Arrangement_Builder SHALL proporcionar un botón "Agregar al Carrito"
2. WHEN el cliente presiona "Agregar al Carrito" sin Base_Component seleccionada, THE Custom_Arrangement_Builder SHALL mostrar un mensaje de error
3. WHEN el cliente presiona "Agregar al Carrito" con una configuración válida, THE Custom_Arrangement_Builder SHALL agregar cada componente seleccionado como un item separado al carrito
4. WHEN los componentes son agregados al carrito, THE Custom_Arrangement_Builder SHALL mantener la referencia de que pertenecen al mismo arreglo personalizado
5. WHEN el arreglo es agregado exitosamente, THE Custom_Arrangement_Builder SHALL mostrar una confirmación y limpiar la configuración

### Requirement 10: Validación de Configuración

**User Story:** Como sistema, quiero validar que el arreglo personalizado tenga al menos una base, para que los pedidos sean coherentes.

#### Acceptance Criteria

1. THE Custom_Arrangement_Builder SHALL considerar una Configuration válida cuando tiene al menos una Base_Component seleccionada
2. WHEN el cliente intenta agregar al carrito sin Base_Component, THE Custom_Arrangement_Builder SHALL mostrar un mensaje de error descriptivo
3. THE Custom_Arrangement_Builder SHALL permitir configuraciones con solo base y sin flores, globos o extras
4. THE Custom_Arrangement_Builder SHALL deshabilitar visualmente el botón de agregar al carrito mientras la Configuration sea inválida
5. THE Custom_Arrangement_Builder SHALL mostrar indicadores visuales de qué categorías son obligatorias

### Requirement 11: Persistencia de Configuración

**User Story:** Como cliente, quiero que mi configuración se mantenga mientras navego por la página, para que no pierda mi trabajo si cambio de pestaña accidentalmente.

#### Acceptance Criteria

1. WHEN el cliente selecciona componentes, THE Custom_Arrangement_Builder SHALL guardar la Configuration en el almacenamiento local del navegador
2. WHEN el cliente recarga la página, THE Custom_Arrangement_Builder SHALL restaurar la Configuration guardada
3. WHEN el cliente agrega el arreglo al carrito, THE Custom_Arrangement_Builder SHALL limpiar la Configuration guardada
4. WHEN el cliente presiona "REINICIAR DISEÑO", THE Custom_Arrangement_Builder SHALL limpiar la Configuration guardada
5. THE Custom_Arrangement_Builder SHALL mantener la Configuration guardada por un máximo de 24 horas

### Requirement 12: Integración con Sistema de Productos

**User Story:** Como administrador, quiero que los componentes del constructor se gestionen usando el formulario de productos existente, para que pueda aprovechar la infraestructura y flujo de trabajo que ya conozco.

#### Acceptance Criteria

1. THE Custom_Arrangement_Builder SHALL utilizar el formulario de añadir producto existente para crear componentes
2. WHEN un administrador crea o edita un producto, THE Custom_Arrangement_Builder SHALL proporcionar campos adicionales para marcar el producto como componente de arreglo
3. THE Custom_Arrangement_Builder SHALL agregar un campo "is_arrangement_component" para identificar productos que son componentes
4. THE Custom_Arrangement_Builder SHALL agregar un campo "component_category" para especificar BASE, FLORES, GLOBOS o EXTRAS
5. THE Custom_Arrangement_Builder SHALL reutilizar todos los campos existentes del producto: nombre, precio, descripción, imágenes y estado activo

### Requirement 13: Integración con Carrito de Compras

**User Story:** Como sistema, quiero integrar el constructor de arreglos con el carrito de compras existente, para que los arreglos personalizados se gestionen como cualquier otra compra.

#### Acceptance Criteria

1. WHEN el cliente agrega un arreglo al carrito, THE Custom_Arrangement_Builder SHALL agregar cada componente seleccionado como un item individual en el carrito
2. THE Custom_Arrangement_Builder SHALL asignar un identificador único de arreglo a todos los items que pertenecen al mismo arreglo personalizado
3. WHEN los items son agregados al carrito, THE Custom_Arrangement_Builder SHALL incluir metadata indicando que son parte de un arreglo personalizado
4. THE Custom_Arrangement_Builder SHALL utilizar la funcionalidad existente del carrito para gestionar cantidades, precios y checkout
5. WHEN el cliente visualiza el carrito, THE Custom_Arrangement_Builder SHALL agrupar visualmente los componentes que pertenecen al mismo arreglo

### Requirement 14: Responsive Design

**User Story:** Como cliente móvil, quiero usar el constructor de arreglos desde mi teléfono, para que pueda personalizar arreglos desde cualquier dispositivo.

#### Acceptance Criteria

1. THE Custom_Arrangement_Builder SHALL adaptar el layout para pantallas móviles, tablets y desktop
2. WHILE el dispositivo es móvil, THE Component_Selector SHALL mostrarse en pestañas o acordeón colapsable
3. WHILE el dispositivo es móvil, THE Preview_Canvas SHALL ocupar el ancho completo de la pantalla
4. THE Custom_Arrangement_Builder SHALL mantener todos los botones accesibles en dispositivos táctiles
5. THE Custom_Arrangement_Builder SHALL asegurar que las imágenes de componentes sean visibles en pantallas pequeñas

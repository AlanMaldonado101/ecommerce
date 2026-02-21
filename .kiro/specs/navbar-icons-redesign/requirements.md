# Documento de Requisitos

## Introducción

Este documento especifica los requisitos para el rediseño del navbar de la aplicación, con el objetivo de crear una interfaz más limpia y compacta. Los cambios principales incluyen la reorganización de los iconos de acción (búsqueda, cuenta y carrito) en el lado derecho del navbar, la eliminación de etiquetas de texto redundantes, y el reposicionamiento del contador del carrito.

## Glosario

- **Navbar**: Barra de navegación principal ubicada en la parte superior de la aplicación
- **Search_Icon**: Icono de lupa que activa la funcionalidad de búsqueda
- **Account_Icon**: Icono de usuario que representa el acceso a la cuenta del usuario
- **Cart_Icon**: Icono de bolsa de compras que representa el carrito de compras
- **Cart_Counter**: Indicador numérico que muestra la cantidad de artículos en el carrito
- **Action_Icons_Group**: Grupo de iconos de acción (búsqueda, cuenta y carrito) ubicados en el lado derecho del navbar
- **Nav_Links**: Enlaces de navegación principales (Inicio, Navidad, Año nuevo, Globos, Repostería, Novedades, Temporadas, DESTACADO, OFERTAS)
- **Logo**: Logotipo de la aplicación ubicado en el lado izquierdo del navbar

## Requisitos

### Requisito 1: Reposicionar el Icono de Búsqueda

**User Story:** Como usuario, quiero que el icono de búsqueda esté agrupado con los demás iconos de acción en el lado derecho, para tener una interfaz más organizada y predecible.

#### Criterios de Aceptación

1. THE Navbar SHALL posicionar el Search_Icon en el lado derecho junto al Account_Icon y Cart_Icon
2. THE Navbar SHALL mantener el Search_Icon a la izquierda del Account_Icon en el Action_Icons_Group
3. WHEN el usuario hace clic en el Search_Icon, THE Navbar SHALL abrir el panel de búsqueda
4. THE Navbar SHALL mantener la funcionalidad de búsqueda existente sin cambios

### Requisito 2: Eliminar Etiquetas de Texto de los Iconos

**User Story:** Como usuario, quiero ver solo los iconos sin texto adicional, para tener un navbar más limpio y compacto.

#### Criterios de Aceptación

1. THE Navbar SHALL mostrar el Account_Icon sin la etiqueta de texto "Cuenta"
2. THE Navbar SHALL mostrar el Cart_Icon sin la etiqueta de texto "Carrito"
3. THE Navbar SHALL mantener los iconos visualmente reconocibles y del tamaño adecuado
4. WHEN el usuario pasa el cursor sobre el Account_Icon, THE Navbar SHALL mostrar un tooltip con el texto "Cuenta"
5. WHEN el usuario pasa el cursor sobre el Cart_Icon, THE Navbar SHALL mostrar un tooltip con el texto "Carrito"

### Requisito 3: Reposicionar el Contador del Carrito

**User Story:** Como usuario, quiero ver el contador del carrito posicionado arriba del icono, para identificar rápidamente la cantidad de artículos sin que interfiera con el diseño.

#### Criterios de Aceptación

1. THE Navbar SHALL posicionar el Cart_Counter en la esquina superior derecha del Cart_Icon
2. THE Navbar SHALL mostrar el Cart_Counter como un badge circular
3. THE Navbar SHALL mantener el Cart_Counter visible cuando el valor sea mayor a cero
4. WHEN el carrito esté vacío, THE Navbar SHALL ocultar el Cart_Counter
5. THE Navbar SHALL actualizar el Cart_Counter en tiempo real cuando cambie la cantidad de artículos

### Requisito 4: Mantener el Diseño Responsivo

**User Story:** Como usuario móvil, quiero que los cambios del navbar funcionen correctamente en dispositivos móviles, para tener una experiencia consistente en todas las plataformas.

#### Criterios de Aceptación

1. THE Navbar SHALL mantener el Action_Icons_Group visible en dispositivos móviles
2. THE Navbar SHALL ajustar el espaciado entre iconos según el tamaño de pantalla
3. WHEN el viewport sea menor a 768px, THE Navbar SHALL mostrar solo los iconos sin tooltips
4. THE Navbar SHALL mantener el menú hamburguesa funcional en dispositivos móviles
5. THE Navbar SHALL preservar la funcionalidad de todos los iconos en todas las resoluciones

### Requisito 5: Preservar la Estructura Existente

**User Story:** Como desarrollador, quiero que los cambios no afecten otras funcionalidades del navbar, para mantener la estabilidad de la aplicación.

#### Criterios de Aceptación

1. THE Navbar SHALL mantener el Logo en el lado izquierdo
2. THE Navbar SHALL mantener los Nav_Links en su posición central
3. THE Navbar SHALL preservar la funcionalidad de los dropdowns en los Nav_Links
4. THE Navbar SHALL mantener el estilo sticky y el backdrop blur existentes
5. THE Navbar SHALL preservar la integración con el store de Zustand para el carrito y los sheets

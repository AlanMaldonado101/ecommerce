<div align="center">

  <img src="public/logo-jireh.png" alt="Tiendita Jireh" width="120" />

  <h1>🛍️ Tiendita Jireh</h1>

  <p><strong>E-commerce moderno construido con React, TypeScript y Supabase</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  </p>

  <p>
    <a href="#-características">Características</a> •
    <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
    <a href="#-inicio-rápido">Inicio Rápido</a> •
    <a href="#-estructura-del-proyecto">Estructura</a> •
    <a href="#-variables-de-entorno">Configuración</a>
  </p>

</div>

---

## ✨ Características

| Área | Descripción |
|------|-------------|
| 🔐 **Autenticación** | Registro, login, recuperación de contraseña con Supabase Auth |
| 🛒 **Carrito de Compras** | Estado global persistente con Zustand |
| 📦 **Gestión de Productos** | CRUD completo con variantes, colores, imágenes y precios mayorista/minorista |
| 🏷️ **Categorías y Subcategorías** | Organización jerárquica con creación inline desde el formulario |
| 🎉 **Ocasiones / Temáticas** | Tags de ocasión (Cumpleaños, Navidad, etc.) vinculados a productos |
| 📝 **Editor Rich Text** | Descripciones de producto con TipTap |
| 🔍 **SEO** | Meta títulos, descripciones y slugs personalizables |
| 📋 **Pedidos** | Checkout, historial de pedidos y panel de administración |
| 👤 **Mi Cuenta** | Dashboard de usuario, direcciones, favoritos y datos personales |
| 🛡️ **Panel Admin** | Gestión de productos, pedidos y estados con roles de usuario |
| 📱 **Responsive** | Diseño adaptable a móvil, tablet y desktop |

## ⚙️ Tech Stack

```
Frontend          Estado            Backend           Formularios
─────────         ─────────         ─────────         ─────────
React 18          Zustand           Supabase          React Hook Form
TypeScript 5      TanStack Query    PostgreSQL (RLS)  Zod
Tailwind CSS 3    ─                 Supabase Auth     ─
Vite 5            ─                 Supabase Storage  ─
Framer Motion     ─                 ─                 ─
TipTap Editor     ─                 ─                 ─
```

## 🚀 Inicio Rápido

### Prerrequisitos

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- Una cuenta en [Supabase](https://supabase.com/)

### 1. Clonar el repositorio

```bash
git clone https://github.com/AlanMaldonado101/ecommerce.git
cd ecommerce
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Creá un archivo `.env` en la raíz del proyecto:

```env
VITE_PROJECT_URL_SUPABASE=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_API_KEY=tu_anon_public_key
```

> Obtené ambos valores en [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto → **Settings** → **API**

### 4. Configurar Supabase

Ejecutá las migraciones SQL en el **SQL Editor** de Supabase:

```
supabase/migrations/
├── 001_initial_schema.sql
├── 002_...
├── 003_...
└── 004_add_new_fields.sql
```

Luego, configurá las políticas RLS con los archivos `.sql` de la raíz del proyecto.

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173) en tu navegador 🎉

## 📁 Estructura del Proyecto

```
src/
├── actions/          # Funciones que interactúan con Supabase (queries & mutations)
├── components/       # Componentes reutilizables
│   ├── dashboard/    #   └── Panel de administración
│   ├── home/         #   └── Página principal
│   ├── products/     #   └── Catálogo y detalle de producto
│   └── shared/       #   └── Componentes compartidos (Loader, etc.)
├── constants/        # Constantes de la aplicación
├── helpers/          # Utilidades (slug, formateo, etc.)
├── hooks/            # Custom hooks (productos, auth, categorías, órdenes)
├── interfaces/       # Tipos e interfaces TypeScript
├── layouts/          # Layouts de página (público, dashboard, cuenta)
├── lib/              # Validadores Zod
├── pages/            # Páginas de la aplicación
│   ├── account/      #   └── Mi cuenta (direcciones, datos, favoritos)
│   └── dashboard/    #   └── Admin (productos, pedidos)
├── router/           # Configuración de rutas (React Router)
├── store/            # Stores globales (Zustand)
└── supabase/         # Cliente y tipos de Supabase
```

## 🔑 Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_PROJECT_URL_SUPABASE` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_API_KEY` | Clave pública anon de Supabase |

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Lint con ESLint |

## 🗄️ Base de Datos

El proyecto usa **Supabase** (PostgreSQL) con las siguientes tablas principales:

- `products` — Productos con categorías, subcategorías, tags y proveedor
- `variants` — Variantes de producto (color, precio, stock, presentación)
- `categories` — Categorías principales
- `subcategories` — Subcategorías vinculadas a categorías
- `providers` — Proveedores
- `occasions` — Temáticas (Cumpleaños, Navidad, etc.)
- `product_occasions` — Relación muchos-a-muchos entre productos y ocasiones
- `orders` / `order_items` — Pedidos y sus ítems
- `customers` — Datos del cliente
- `andresses` — Direcciones de envío
- `user_roles` — Roles de usuario (admin, customer)

> ⚠️ Row Level Security (RLS) está habilitado. Consultá los archivos `supabase-rls-*.sql` para las políticas de seguridad.

---

<div align="center">
  <p>Hecho con ❤️ por <a href="https://github.com/AlanMaldonado101">Alan Maldonado</a></p>
</div>
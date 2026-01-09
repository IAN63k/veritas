# Veritas - Plataforma de Evaluaciones con Protección Anti-IA

## Arquitectura

Este es un sistema de evaluaciones educativas construido con **Next.js 16** (App Router) y **Supabase**, diseñado con una arquitectura basada en roles (**teacher** y **student**) y protección contra trampas académicas.

### Componentes Principales

- **Autenticación basada en roles**: Los usuarios se registran con metadatos (`role`, `name`, `student_code`) almacenados en `user_metadata` de Supabase Auth
- **Rutas protegidas**: `/teacher/*` y `/student/*` protegidas por middleware que valida autenticación y redirige según el rol
- **Sistema de evaluaciones**: Con niveles de protección (`low`, `medium`, `high`), límites de intentos y seguimiento de eventos sospechosos

## Patrones de Supabase

### Clientes por Contexto

**SIEMPRE** usa el cliente correcto según el contexto:

```typescript
// Server Components y Server Actions
import { createClient } from '@/lib/supabase/server' 
const supabase = await createClient() // Requiere await

// Client Components
import { createClient } from '@/lib/supabase/client'
const supabase = createClient() // Sin await
```

### Tipos de Base de Datos

El archivo [app/types/database.types.ts](app/types/database.types.ts) define todos los tipos de Supabase. Úsalo para tipado:

```typescript
import { Database } from '@/app/types/database.types'
// Los clientes Supabase ya están tipados con Database
```

## Flujos de Autenticación

### Server Actions para Auth

Las acciones de autenticación están en [app/api/auth/actions.ts](app/api/auth/actions.ts):

- `signIn(formData)` - Inicia sesión y redirige según rol (`/teacher/dashboard` o `/student/my-courses`)
- `signUp(formData)` - Crea cuenta con role, name y student_code (si aplica) en user_metadata
- `signOut()` - Cierra sesión y redirige a `/login`

### Hook useAuth

Para Client Components, usa [app/hooks/use-auth.ts](app/hooks/use-auth.ts):

```typescript
const { user, role, loading, signOut } = useAuth()
```

Escucha cambios de autenticación automáticamente vía `onAuthStateChange`.

## Modelo de Datos

### Tablas Principales

- **teachers/students**: Información de usuarios (sincronizadas con Auth)
- **courses**: Cursos creados por profesores
- **enrollments**: Relación estudiante-curso
- **evaluations**: Exámenes con `protection_level`, `max_attempts`, `duration_minutes`
- **questions**: Preguntas de tipo `multiple_choice`, `open`, `code`, `true_false` con contenido JSON
- **evaluation_attempts**: Intentos de estudiantes con estado (`in_progress`, `completed`, `blocked`, `abandoned`)
- **suspicious_events**: Registro de eventos sospechosos durante evaluaciones

### Relaciones Clave

```
teacher → courses → evaluations → questions
student → enrollments → courses
student → evaluation_attempts → evaluations
evaluation_attempts → suspicious_events
```

## Middleware

El [middleware.ts](middleware.ts) delega a [lib/supabase/middleware.ts](lib/supabase/middleware.ts) que:

1. Actualiza la sesión de Supabase
2. Protege `/teacher/*` y `/student/*` (requiere autenticación)
3. Redirige usuarios autenticados desde `/login` y `/register` según su rol

## Estructura de Rutas

```
/(auth)/
  /login       - Página de inicio de sesión
  /register    - Registro con selección de rol

/teacher/      - Área de profesores
  /dashboard   - Panel principal
  /courses     - Gestión de cursos
  /evaluations - Gestión de evaluaciones
  /students    - Gestión de estudiantes

/student/      - Área de estudiantes
  /my-courses  - Cursos inscritos
  /evaluation/[id] - Vista de evaluación individual
```

## UI y Componentes

- **shadcn/ui**: Componentes base en `components/ui/` (Button, Card, RadioGroup, Switch, Sonner)
- **Componentes de dominio**: En `app/components/exam/`, `app/components/layout/`, `app/components/shared/`
- **Estilos**: Tailwind CSS v4 con Inter de Google Fonts

## Scripts de Desarrollo

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificar tipos TypeScript sin compilar
```

## Variables de Entorno

Asegúrate de tener configuradas:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Convenciones de Código

- **Server Actions**: Siempre marcadas con `'use server'` al inicio del archivo
- **Client Components**: Marcar con `'use client'` cuando usen hooks o interactividad
- **Gestión de estado**: Zustand para estado global (instalado pero no usado extensivamente aún)
- **Formularios**: React Hook Form + Zod para validación
- **Notificaciones**: Sonner para toast notifications



# Frontend Styling

## Table of Contents
- [Styling Overview](#styling-overview)
- [Tailwind CSS](#tailwind-css)
- [RTL Support](#rtl-support)
- [Responsive Design](#responsive-design)
- [Component Styling](#component-styling)
- [Theme Configuration](#theme-configuration)

## Styling Overview

The application uses **Tailwind CSS** as the primary styling framework, with custom CSS for specific needs.

### Styling Stack
- **Tailwind CSS 3.4.11**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **Autoprefixer**: Vendor prefixing
- **Custom CSS**: Global styles and overrides

## Tailwind CSS

### Configuration

**Location:** `tailwind.config.ts`

```typescript
export default {
  content: [
    "./index.html",
    "./client/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#1e3a5f',
        'teal': '#14b8a6',
        'orange': '#f97316',
      },
      fontFamily: {
        arabic: ['Cairo', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
```

### Custom Colors

- `dark-blue`: Primary brand color (#1e3a5f)
- `teal`: Accent color (#14b8a6)
- `orange`: Action/CTA color (#f97316)

### Custom Fonts

- **Arabic Font**: Cairo (for Arabic text)
- **Fallback**: Arial, sans-serif

### Usage Examples

```tsx
// Colors
<div className="bg-dark-blue text-white">
<div className="text-teal hover:text-teal/80">
<div className="bg-orange hover:bg-orange/90">

// Typography
<h1 className="text-3xl font-bold font-arabic">
<p className="text-gray-600 text-sm">

// Spacing
<div className="p-4 m-2 space-y-4">
<div className="gap-4 flex items-center">

// Layout
<div className="container mx-auto px-4">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

## RTL Support

### Direction Attribute

Set `dir="rtl"` on root element:

```tsx
<html dir="rtl" lang="ar">
```

### RTL-Aware Classes

Tailwind provides RTL variants:

```tsx
// Padding
<div className="ps-4 pe-2"> // padding-start, padding-end

// Margin
<div className="ms-auto me-4"> // margin-start, margin-end

// Text alignment
<div className="text-start"> // text-align: start (RTL-aware)

// Flexbox
<div className="flex-row-reverse"> // Reverse flex direction
```

### Custom RTL Utilities

```css
/* Global styles for RTL */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="ltr"] {
  direction: ltr;
  text-align: left;
}
```

### Component RTL Patterns

```tsx
// Navigation items
<nav className="flex flex-row-reverse gap-4">
  <Link className="text-start">Home</Link>
</nav>

// Forms
<form className="space-y-4 text-start">
  <label className="block text-start">Name</label>
  <input className="w-full text-start" />
</form>

// Cards
<div className="text-start p-4">
  <h3 className="text-end">Title</h3>
  <p className="text-end">Content</p>
</div>
```

## Responsive Design

### Breakpoints

Tailwind default breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Approach

Start with mobile styles, then add larger breakpoints:

```tsx
// Mobile first
<div className="
  w-full           // Mobile: full width
  md:w-1/2         // Tablet: half width
  lg:w-1/3         // Desktop: third width
">

// Grid
<div className="
  grid grid-cols-1        // Mobile: 1 column
  md:grid-cols-2         // Tablet: 2 columns
  lg:grid-cols-3         // Desktop: 3 columns
  gap-4
">
```

### Responsive Patterns

#### Navigation
```tsx
<nav className="
  flex flex-col          // Mobile: vertical
  md:flex-row            // Tablet+: horizontal
  items-center
  gap-4
">
```

#### Cards
```tsx
<div className="
  p-4                    // Mobile: padding
  md:p-6                 // Tablet+: more padding
  rounded-lg
  shadow-md
">
```

#### Typography
```tsx
<h1 className="
  text-2xl               // Mobile: smaller
  md:text-3xl           // Tablet: medium
  lg:text-4xl           // Desktop: large
  font-bold
">
```

## Component Styling

### Button Styles

```tsx
// Primary button
<button className="
  bg-orange
  hover:bg-orange/90
  text-white
  font-medium
  px-4 py-2
  rounded-lg
  transition-colors
">

// Secondary button
<button className="
  bg-gray-100
  hover:bg-gray-200
  text-gray-700
  px-4 py-2
  rounded-lg
  transition-colors
">

// Outline button
<button className="
  border border-gray-300
  hover:bg-gray-50
  text-gray-700
  px-4 py-2
  rounded-lg
  transition-colors
">
```

### Card Styles

```tsx
<div className="
  bg-white
  rounded-lg
  shadow-md
  hover:shadow-lg
  transition-shadow
  p-6
  border border-gray-200
">
```

### Input Styles

```tsx
<input className="
  w-full
  px-4 py-2
  border border-gray-300
  rounded-lg
  focus:outline-none
  focus:ring-2
  focus:ring-teal
  focus:border-transparent
  text-start
" />
```

### Modal Styles

```tsx
<div className="
  fixed inset-0
  bg-black/50
  flex items-center justify-center
  z-50
">
  <div className="
    bg-white
    rounded-lg
    shadow-xl
    max-w-2xl w-full
    max-h-[90vh]
    overflow-y-auto
    p-6
  ">
    {/* Modal content */}
  </div>
</div>
```

## Theme Configuration

### Color Scheme

```typescript
// tailwind.config.ts
colors: {
  primary: {
    DEFAULT: '#1e3a5f',    // dark-blue
    light: '#2d4a6f',
    dark: '#0f2a4f',
  },
  accent: {
    DEFAULT: '#14b8a6',    // teal
    light: '#2dd4bf',
    dark: '#0d9488',
  },
  action: {
    DEFAULT: '#f97316',    // orange
    light: '#fb923c',
    dark: '#ea580c',
  },
}
```

### Typography Scale

```typescript
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
}
```

### Spacing Scale

Tailwind default spacing (0.25rem increments):
- `0`: 0
- `1`: 0.25rem (4px)
- `2`: 0.5rem (8px)
- `4`: 1rem (16px)
- `8`: 2rem (32px)
- `16`: 4rem (64px)

## Global Styles

### Location: `client/global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
@layer base {
  body {
    @apply font-arabic text-gray-900;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-bold;
  }
}

@layer components {
  .btn-primary {
    @apply bg-orange hover:bg-orange/90 text-white font-medium px-4 py-2 rounded-lg transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200;
  }
}
```

## Best Practices

### 1. **Use Utility Classes**

Prefer Tailwind utilities over custom CSS:

```tsx
// ✅ Good
<div className="flex items-center gap-4 p-4">

// ❌ Avoid
<div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
```

### 2. **Component Variants**

Use conditional classes:

```tsx
<button className={`
  px-4 py-2 rounded-lg
  ${variant === 'primary' ? 'bg-orange text-white' : 'bg-gray-100 text-gray-700'}
`}>
```

### 3. **Responsive Images**

Use responsive image classes:

```tsx
<img 
  className="w-full h-auto object-cover"
  srcSet="image-400.jpg 400w, image-800.jpg 800w"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### 4. **Dark Mode** (Future)

Prepare for dark mode:

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
```

### 5. **Accessibility**

Ensure proper contrast and focus states:

```tsx
<button className="
  focus:outline-none
  focus:ring-2
  focus:ring-teal
  focus:ring-offset-2
">
```

## Next Steps

- [Backend Documentation](../docs/01_BACKEND_OVERVIEW.md)
- [Components Documentation](./03_FRONTEND_COMPONENTS.md)


# Frontend Components

## Table of Contents
- [Component Library Overview](#component-library-overview)
- [UI Components](#ui-components)
- [Feature Components](#feature-components)
- [Layout Components](#layout-components)
- [Dashboard Components](#dashboard-components)
- [Component Patterns](#component-patterns)

## Component Library Overview

The component library is organized into several categories:

```
components/
├── ui/              # Reusable UI primitives (Radix UI)
├── Auth/            # Authentication components
├── Dashboard/       # Dashboard-specific components
└── [Feature Components] # Business logic components
```

## UI Components

Located in `client/components/ui/`, these are reusable UI primitives built on Radix UI.

### Core UI Components

#### Button (`button.tsx`)
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon
- Full TypeScript support

```tsx
<Button variant="default" size="lg">Click me</Button>
```

#### Input (`input.tsx`)
- Text input with validation states
- Supports labels and error messages
- RTL support

```tsx
<Input type="text" placeholder="Search..." />
```

#### Dialog (`dialog.tsx`)
- Modal dialogs
- Accessible (ARIA compliant)
- Keyboard navigation

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>...</DialogContent>
</Dialog>
```

#### Card (`card.tsx`)
- Container component
- Header, content, footer sections

```tsx
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

#### Select (`select.tsx`)
- Dropdown select component
- Searchable option
- Multi-select support

#### Tabs (`tabs.tsx`)
- Tab navigation
- Keyboard accessible

#### Toast (`toast.tsx`, `sonner.tsx`)
- Toast notifications
- Success, error, warning, info variants
- Auto-dismiss

### Other UI Components
- `accordion.tsx` - Collapsible content
- `alert.tsx` - Alert messages
- `badge.tsx` - Status badges
- `breadcrumb.tsx` - Navigation breadcrumbs
- `checkbox.tsx` - Checkbox input
- `dropdown-menu.tsx` - Dropdown menus
- `form.tsx` - Form wrapper with validation
- `label.tsx` - Form labels
- `pagination.tsx` - Pagination controls
- `skeleton.tsx` - Loading skeletons
- `slider.tsx` - Range slider
- `table.tsx` - Data tables
- `textarea.tsx` - Multi-line text input
- `tooltip.tsx` - Tooltips

## Feature Components

### ToolCard (`ToolCard.tsx`)
Displays a product/tool card with:
- Product image (lazy loaded)
- Name, category, price
- Location (city, neighborhood)
- Rating and reviews count
- Quick actions (favorite, compare)
- Link to product detail

**Props:**
```typescript
interface ToolCardProps {
  product: Product;
  onFavorite?: (productId: string) => void;
  onCompare?: (productId: string) => void;
  showActions?: boolean;
}
```

### Navigation (`Navigation.tsx`)
Main navigation bar with:
- Logo and branding
- Search bar
- Category dropdown
- User menu (when authenticated)
- Favorites count
- Mobile responsive

**Props:**
```typescript
interface NavigationProps {
  currentPage?: string;
  showFavoritesCount?: boolean;
  favoritesCount?: number;
}
```

### Footer (`Footer.tsx`)
Site footer with:
- Dynamic category links (from database)
- Important pages links
- Contact information
- Social media links
- Responsive layout

### SearchDropdown (`SearchDropdown.tsx`)
Advanced search dropdown with:
- Category filter
- Location filter
- Price range filter
- Quick search suggestions

### CostCalculator (`CostCalculator.tsx`)
Rental cost calculator:
- Daily price input
- Rental duration (days)
- Delivery cost (optional)
- Total cost calculation
- Price breakdown display

### ToolComparison (`ToolComparison.tsx`)
Side-by-side product comparison:
- Compare multiple products
- Feature comparison table
- Price comparison
- Rating comparison
- Add/remove products

### RatingSystem (`RatingSystem.tsx`)
Star rating component:
- Display ratings
- Interactive rating input
- Average rating calculation
- Review count display

### UnifiedReviewSystem (`UnifiedReviewSystem.tsx`)
Complete review system:
- Display reviews
- Add new reviews
- Edit/delete own reviews
- Rating distribution
- Review filtering and sorting

### FloatingComparisonBar (`FloatingComparisonBar.tsx`)
Floating bar for product comparison:
- Shows compared products count
- Quick access to comparison page
- Sticky positioning

### LazyImage (`LazyImage.tsx`)
Optimized image component:
- Lazy loading
- Placeholder during load
- Error handling
- Responsive images

### SEOHead (`SEOHead.tsx`)
SEO meta tags component:
- Dynamic meta tags
- Open Graph tags
- Twitter Card tags
- Structured data (JSON-LD)
- Canonical URLs
- Hreflang tags

**Usage:**
```tsx
<SEOHead
  title="Page Title"
  description="Page description"
  image="/og-image.jpg"
  url="/current-page"
  type="website"
  schema={schemaObject}
/>
```

### ProtectedRoute (`ProtectedRoute.tsx`)
Route protection component:
- User authentication check
- Admin authorization check
- Loading states
- Automatic redirects

**Usage:**
```tsx
<ProtectedRoute requireAdmin={true}>
  <AdminDashboard />
</ProtectedRoute>
```

## Layout Components

### Navigation (`Navigation.tsx`)
- Main site navigation
- Search functionality
- User menu
- Mobile hamburger menu

### Footer (`Footer.tsx`)
- Site footer
- Category links
- Contact information
- Social links

## Dashboard Components

### AdminDashboard (`Dashboard/AdminDashboard.tsx`)
Comprehensive admin interface with tabs:

1. **Overview Tab**
   - Statistics (users, products, submissions)
   - Recent activity
   - Quick actions

2. **Submissions Tab**
   - List of pending submissions
   - Approve/reject actions
   - Submission details modal
   - Bulk actions

3. **Products Tab**
   - List of all products
   - Edit/delete products
   - Product filters
   - Bulk operations

4. **Users Tab**
   - User list
   - User details
   - Admin privileges management

5. **Categories Tab**
   - Category management
   - Add/edit/delete categories
   - Category image upload (thumbnail & hero)
   - Display order management

**Key Features:**
- Real-time updates
- Optimistic UI updates
- Image upload for categories
- Form validation
- Toast notifications

### UserDashboard (`Dashboard/UserDashboard.tsx`)
User personal dashboard with tabs:

1. **Overview Tab**
   - User statistics
   - Recent submissions
   - Quick actions

2. **Submissions Tab**
   - User's submissions
   - Status tracking
   - Edit/delete submissions

3. **Products Tab**
   - User's approved products
   - Edit products
   - View product stats

**Key Features:**
- Submission tracking
- Product management
- Profile editing

## Component Patterns

### 1. **Container/Presentational Pattern**
- Container components handle logic
- Presentational components handle UI

### 2. **Compound Components**
- Components that work together (e.g., `Card` with `CardHeader`, `CardContent`)

### 3. **Render Props**
- Components that accept render functions (e.g., `VirtualGrid`)

### 4. **Custom Hooks**
- Reusable logic extracted to hooks
- Examples: `useInfiniteScroll`, `use-toast`

### 5. **Error Boundaries**
- Components that catch errors
- Graceful error handling

### 6. **Loading States**
- Skeleton loaders
- Loading spinners
- Progressive loading

## Component Best Practices

### 1. **TypeScript**
- All components fully typed
- Props interfaces defined
- No `any` types

### 2. **Accessibility**
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

### 3. **Performance**
- Memoization where needed
- Lazy loading for images
- Code splitting for heavy components

### 4. **Responsive Design**
- Mobile-first approach
- Breakpoint utilities (Tailwind)
- Touch-friendly interactions

### 5. **RTL Support**
- Arabic RTL layout
- `dir="rtl"` attribute
- RTL-aware CSS classes

## Next Steps

- [Pages Documentation](./04_FRONTEND_PAGES.md)
- [Routing Documentation](./05_FRONTEND_ROUTING.md)
- [State Management Documentation](./06_FRONTEND_STATE_MANAGEMENT.md)


# Ajir - منصة تأجير الأدوات (Tool Rental Marketplace)

A modern, Arabic-first tool rental marketplace platform connecting tool owners with renters in Morocco. Built with React, TypeScript, and Supabase.

## 🌟 Overview

Ajir is a comprehensive digital marketplace for tool rentals in Morocco, focusing on Salé and Rabat regions. The platform serves as a digital intermediary connecting tool owners with renters, featuring a complete submission system, admin review workflow, and user-friendly interface with full RTL (Right-to-Left) support for Arabic.

## 📸 Screenshots

### Homepage Hero Section
![Homepage Hero Section](./public/hero-image.jpg)
*Hero section with construction workers image and call-to-action buttons*

### Value Proposition Banners
![Value Proposition Banners](./public/banner-section-1.png) ![Value Proposition Banners](./public/banner-section-2.png)
*Two prominent banners: Renter-focused (left) and Owner-focused (right) with brand-colored gradients*

### Categories Section
![Categories Section](./public/المولدات والمضخات.png) ![Categories Section](./public/معدات الجرديناج.png) ![Categories Section](./public/معدات البناء الكبيرة.png)
*Favorite categories showcase with tool icons*

### How It Works Section
*Four-step process cards showing the rental workflow from exploration to project completion*

### Footer
*Comprehensive footer with navigation links, contact information, and important disclaimers*

## ✨ Key Features

### For Renters
- 🔍 **Browse Tools**: Search and filter through hundreds of available tools
- 💰 **Cost Calculator**: Calculate rental costs with delivery options
- ⭐ **Reviews & Ratings**: Read and write reviews for tools
- 📱 **Mobile Responsive**: Fully optimized for mobile devices
- 🗺️ **Location-Based**: Find tools near you in Salé and Rabat

### For Tool Owners
- ➕ **Easy Submission**: Submit tools for rental with detailed forms
- 📊 **Dashboard**: Track submissions, views, and earnings
- 🔔 **Real-Time Updates**: Get notified when tools are approved
- 📈 **Analytics**: Monitor your tool's performance

### For Admins
- ✅ **Review System**: Approve, modify, or reject tool submissions
- 📋 **Category Management**: Manage tool categories with images
- 👥 **User Management**: Monitor user activity and submissions
- 🔒 **Secure Access**: Protected admin dashboard with session management

## 🎨 Brand Identity

### Color Scheme
- **Primary Brand Orange**: `#FF6A18` - Used for primary CTAs, buttons, and main actions
- **Secondary Brand Teal**: `#00C39A` - Used for secondary actions, info badges, and accents
- **Dark Blue**: Used for text and headings
- **Semantic Colors**: Red for errors, green for success/WhatsApp, yellow for ratings

### Design System
- **Typography**: Noto Kufi Arabic, Tajawal, Cairo fonts
- **RTL Support**: Full Right-to-Left layout support
- **Responsive**: Mobile-first design approach
- **Modern UI**: Glassmorphism effects, smooth animations, gradient backgrounds

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd mojahid
   ```

2. **Set up Supabase**:
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Get your project URL and anon key

3. **Configure Environment**:
   ```bash
   # Copy env.example to .env
   cp env.example client/.env
   
   # Edit client/.env with your Supabase credentials
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   VITE_ADMIN_EMAIL=your-admin-email@example.com
   ```

4. **Set up Database**:
   - Run `complete_database_schema.sql` in Supabase SQL Editor
   - Run `admin_category_rpc_functions.sql` for admin category operations

5. **Install Dependencies**:
   ```bash
   npm install
   ```

6. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:8081`

## 📱 Pages & Routes

### Public Pages
- **`/`** - Homepage with hero section, categories, featured tools, and value proposition banners
- **`/outils`** - Browse all approved tools with filters
- **`/categorie/[categoryName]`** - Category-specific tool listings
- **`/outil/[id]`** - Individual tool detail page with reviews
- **`/recherche`** - Advanced search with multiple filters
- **`/comparaison`** - Compare multiple tools side-by-side
- **`/a-propos`** - About page
- **`/politique-confidentialite`** - Privacy policy
- **`/conditions-utilisation`** - Terms of service

### User Pages
- **`/connexion`** - User login
- **`/inscription`** - User registration (tool owners)
- **`/ajouter-equipement`** - Submit new tool for review
- **`/mes-soumissions`** - Track your tool submissions
- **`/favoris`** - Saved favorite tools
- **`/profil`** - User profile management
- **`/dashboard`** - User dashboard with statistics

### Admin Pages
- **`/admin`** - Admin login
- **`/admin-dashboard`** - Admin control panel for reviewing submissions

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Framer Motion** - Animation library

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Storage for images
  - Row Level Security (RLS)

### Key Libraries
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **date-fns** - Date utilities
- **Sonner** - Toast notifications

## 🏗️ Project Structure

```
mojahid/
├── client/                 # Frontend application
│   ├── components/        # React components
│   │   ├── Auth/         # Authentication components
│   │   ├── Dashboard/    # Dashboard components
│   │   └── ui/           # Reusable UI components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and API
│   ├── pages/            # Page components
│   └── providers/        # Context providers
├── docs/                 # Documentation
│   ├── BackEnd/         # Backend documentation
│   └── Front-End/       # Frontend documentation
├── public/              # Static assets
└── complete_database_schema.sql  # Database schema
```

## 🎯 Core Functionality

### Tool Submission Workflow
1. User fills out submission form at `/ajouter-equipement`
2. Tool is saved with `status = 'pending'`
3. Admin reviews submission in `/admin-dashboard`
4. Admin can approve, modify, or reject
5. Approved tools appear on `/outils` automatically

### Review System
- Users can rate and review tools
- Reviews include ratings (1-5 stars) and written feedback
- Verified reviews are marked
- Review moderation system

### Search & Filter
- Text search across tool names and descriptions
- Filter by category, city, price range, condition
- Sort by price, date, rating
- Location-based filtering

## 🎨 Design Features

### Value Proposition Banners
- Two prominent banners on homepage
- **Banner 1**: Renter-focused with cost savings messaging
- **Banner 2**: Owner-focused with income generation messaging
- Brand-colored gradients with animated effects

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interactions
- Optimized images with lazy loading

### RTL Support
- Full Right-to-Left layout
- Arabic typography optimized
- RTL-aware components
- Proper text alignment

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

### Frontend Documentation
- [Frontend Architecture](./docs/Front-End/02_FRONTEND_ARCHITECTURE.md) - Architecture patterns, data flow
- [Frontend Components](./docs/Front-End/03_FRONTEND_COMPONENTS.md) - Component library, UI components
- [Frontend Pages](./docs/Front-End/04_FRONTEND_PAGES.md) - All pages and their functionality
- [Frontend Routing](./docs/Front-End/05_FRONTEND_ROUTING.md) - Routing system, protected routes
- [Frontend State Management](./docs/Front-End/06_FRONTEND_STATE_MANAGEMENT.md) - Context, React Query, state patterns
- [Frontend Styling](./docs/Front-End/07_FRONTEND_STYLING.md) - Tailwind CSS, RTL support, responsive design

### Backend Documentation
- [Backend Overview](./docs/BackEnd/01_BACKEND_OVERVIEW.md) - Supabase setup, architecture
- [Backend Database](./docs/BackEnd/02_BACKEND_DATABASE.md) - Database schema, tables, relationships
- [Backend API](./docs/BackEnd/03_BACKEND_API.md) - API functions, data access layer
- [Backend Authentication](./docs/BackEnd/04_BACKEND_AUTHENTICATION.md) - User and admin authentication
- [Backend Security](./docs/BackEnd/05_BACKEND_SECURITY.md) - RLS policies, security best practices
- [Backend RPC Functions](./docs/BackEnd/06_BACKEND_RPC_FUNCTIONS.md) - Stored procedures, admin functions

## 🔒 Security

- **Row Level Security (RLS)**: Database-level access control
- **Authentication**: Secure user and admin authentication via Supabase
- **Input Validation**: Zod schemas for form validation
- **XSS Protection**: React's built-in XSS protection
- **Secure Sessions**: Admin session management with validation

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
Make sure to set these in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAIL`

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type checking
- `npm run format.fix` - Format code with Prettier
- `npm test` - Run tests

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

- Check the [Frontend Documentation](./docs/Front-End/) for setup instructions
- See [Backend Documentation](./docs/BackEnd/) for database setup
- Review the full documentation in the `docs/` directory
- Check `SETUP_GUIDE.md` for detailed setup instructions

## 🎯 Roadmap

- [ ] Payment integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support (French)
- [ ] Push notifications
- [ ] Advanced search with AI recommendations
- [ ] Tool availability calendar
- [ ] Messaging system between users

---

**Built with ❤️ for the Moroccan construction and DIY community**

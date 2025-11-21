# Local Development Setup Guide

This guide will help you set up the Ajir Tool Rental Marketplace project to run locally on your machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (if cloning from a repository)
- A **Supabase account** - [Sign up here](https://supabase.com)

## Step 1: Install Dependencies

Open a terminal in the project root directory and run:

```bash
npm install
```

This will install all the required dependencies listed in `package.json`.

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Choose a project name
   - **Database Password**: Create a strong password (save it securely)
   - **Region**: Choose the closest region to you
4. Click "Create new project" and wait for it to be set up (takes 1-2 minutes)

### 2.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon/public key**: Copy this key (starts with `eyJ...` or `sb_publishable_...`)

### 2.3 Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `complete_database_schema.sql` and paste it into the editor
4. Click "Run" to execute the SQL script
5. Repeat the process for `admin_category_rpc_functions.sql`

**Note**: Make sure both SQL files run successfully without errors.

## Step 3: Configure Environment Variables

1. Create a `.env` file in the project root directory (copy from `env.example`):

```bash
# On Windows (PowerShell)
Copy-Item env.example .env

# On Mac/Linux
cp env.example .env
```

2. Open the `.env` file and update it with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace:
- `your-project-id.supabase.co` with your actual Supabase project URL
- `your_anon_key_here` with your actual anon/public key from Supabase

**Important**: Never commit the `.env` file to version control. It should already be in `.gitignore`.

## Step 4: Start the Development Server

Run the development server:

```bash
npm run dev
```

The application will start on **http://localhost:8081** (as configured in `package.json`).

You should see output like:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8081/
  ➜  Network: use --host to expose
```

## Step 5: Verify the Setup

1. Open your browser and navigate to `http://localhost:8081`
2. You should see the application homepage
3. Try navigating to different pages:
   - `/` - Homepage
   - `/tools` - Browse tools
   - `/add-equipment` - Submit new equipment
   - `/admin` - Admin dashboard (requires admin login)

## Troubleshooting

### Issue: "Missing Supabase environment variables" error

**Solution**: Make sure your `.env` file exists in the root directory and contains valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values.

### Issue: Database connection errors

**Solution**: 
- Verify your Supabase project is active
- Check that you've run the SQL schema files
- Ensure your environment variables are correct

### Issue: Port 8081 is already in use

**Solution**: 
- Change the port in `package.json` script: `"dev": "vite --port 8082"`
- Or kill the process using port 8081

### Issue: npm install fails

**Solution**:
- Make sure you have Node.js 18+ installed: `node --version`
- Try clearing npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Issue: TypeScript errors

**Solution**: 
- Run `npm run typecheck` to see detailed errors
- The project uses TypeScript with relaxed settings, so most errors are warnings

## Available Scripts

- `npm run dev` - Start development server (port 8081)
- `npm run build` - Build for production
- `npm run typecheck` - Check TypeScript types
- `npm run format.fix` - Format code with Prettier
- `npm test` - Run tests (if configured)

## Project Structure

```
mojahid/
├── client/              # Frontend React application
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities and API clients
│   └── main.tsx        # Entry point
├── docs/               # Documentation
├── public/             # Static assets
├── .env               # Environment variables (create this)
├── package.json       # Dependencies and scripts
└── vite.config.ts     # Vite configuration
```

## Next Steps

- Read the [README.md](./README.md) for project overview
- Check the [docs/](./docs/) directory for detailed documentation
- Set up admin authentication if needed (see backend docs)

## Need Help?

- Check the documentation in the `docs/` directory
- Review the [Backend Overview](./docs/BackEnd/01_BACKEND_OVERVIEW.md)
- Review the [Frontend Architecture](./docs/Front-End/02_FRONTEND_ARCHITECTURE.md)




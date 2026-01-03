# Dayflow HRMS - Client

React frontend application for the Dayflow Human Resource Management System.

## 🚀 Tech Stack

- **React 19** - UI Framework
- **Vite** - Build Tool
- **TailwindCSS v4** - Styling
- **React Router v7** - Routing
- **Framer Motion** - Animations
- **Lucide React** - Icons

## 📁 Project Structure

```
client/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components (Button, Card, etc.)
│   │   └── layout/      # Layout components (Header, Sidebar, etc.)
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── employee/    # Employee-specific pages
│   │   └── admin/       # Admin-specific pages
│   ├── hooks/           # Custom React hooks
│   ├── context/         # React context providers
│   ├── services/        # API service layers
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration files
│   └── assets/          # Static assets
├── public/              # Public static files
└── ...config files
```

## 🛠️ Setup & Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Update the `.env.local` file with your backend API URL.

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Environment Variables

See `.env.example` for required environment variables.

- `VITE_API_BASE_URL` - Backend API base URL

## 👥 Team Roles

- **Om** - React Development
- **Nakshi** - Django + PostgreSQL
- **Het** - REST APIs & Middleware
- **Yatrik** - Hooks & Integration

## 🔀 Git Workflow

Branch structure: `feature/xyz-name -> client -> dev -> test -> main`

---

**Dayflow HRMS** - Every workday, perfectly aligned.

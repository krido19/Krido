# Krido Bahtiar - Personal Portfolio & App Management System

A modern, feature-rich personal portfolio and application management system built with React, Vite, and Supabase. This project serves as a central hub for showcasing projects, tracking activities, and distributing Android applications (APKs).

![Project Banner](https://via.placeholder.com/1200x400?text=Porto+App+V1)

## 🚀 Features

### 🌐 Public Facing
*   **Immersive Home Page**: Features a 3D-style background, dynamic hero section, and responsive layout.
*   **Portfolio Showcase**: Display projects with images, descriptions, and skill tags.
*   **Activity Logs**: Timeline view of recent activities and updates.
*   **Dedicated Projects Page**: Full portfolio listing accessible via `/projects`.
*   **Dedicated Activities Page**: Full activity timeline accessible via `/activities`.
*   **App Repository**: Dedicated page for users to download the latest versions of your Android apps.
*   **Localization**: Full support for English (EN) and Indonesian (ID) languages with a global toggle.

### 🔐 Admin Dashboard
*   **Secure Authentication**: Email/Password login powered by Supabase Auth.
*   **Profile Management**: Update personal details, avatar, and resume.
*   **Portfolio Management**: CRUD operations for portfolio items (add, edit, delete, upload images).
*   **Activity Management**: Log and manage daily activities.
*   **App Management**: Upload new APKs, manage app versions, descriptions, and icons.
*   **Theme Toggle**: Switch between "Bright" and "Gloomy" dashboard themes.

## 🛠️ Tech Stack

*   **Frontend Framework**: [React](https://reactjs.org/) (v18)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Internationalization**: [i18next](https://www.i18next.com/) & [react-i18next](https://react.i18next.com/)
*   **Routing**: [React Router DOM](https://reactrouter.com/)
*   **Animations**: CSS Animations & Transitions

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)
*   A [Supabase](https://supabase.com/) account

## 📦 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/project-porto.git
    cd project-porto
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory based on `.env.example`:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup**
    Run the provided SQL scripts in your Supabase SQL Editor to set up the tables and storage policies:
    *   `supabase_schema.sql`: Main schema for profiles, portfolio, activities.
    *   `update_schema_apps.sql`: Schema for app releases and management.
    *   `create_bucket.sql`: Storage bucket configuration.

## 🚀 Running the Application

**Development Server**
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

**Production Build**
```bash
npm run build
```

**Preview Production Build**
```bash
npm run preview
```

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components (Layout, Scene, etc.)
├── pages/          # Application pages (Home, Login, Dashboard, etc.)
├── lib/            # Utility functions and Supabase client
├── i18n.js         # Internationalization configuration
├── App.jsx         # Main application component & routing
└── main.jsx        # Entry point
```

## 🌍 Localization

The app supports **English** and **Indonesian**.
*   Translations are managed in `src/i18n.js`.
*   Use the `useTranslation` hook to add new text.
*   Language toggle is available in the Navbar (Public) and Sidebar (Dashboard).

## 📄 License

This project is licensed under the MIT License.

## 🔄 Recent Updates & Changelog (Version 1.0.1)

### 🎨 Branding & UI/UX
*   **New Logo Implementation**: Replaced the default Vite logo with a custom-generated "Circular Tech" brand logo (`logo.png`), featuring a cyan/pink neon aesthetic with a transparent background.
*   **3D Visual Enhancements**: Added HTML-based label connectors to 3D charts for better readability and data association.
*   **Theme Consistency**: Fixed dark/light mode issues to ensure consistent text visibility across all pages (especially in `Home.jsx` and `ContentEditor.jsx`).

### 🛠️ Functionality & Features
*   **Master Account Login**: Implemented a centralized authentication system. The main application uses a "Master Project" for auth (`VITE_SUPABASE_URL`), allowing seamless management of multiple client projects without re-login.
*   **Password Change & Toggle**: Added a secure "Change Password" page in the settings menu, featuring visibility toggles (eye icon) for better user experience.
*   **Downloads Architecture**: Optimized file serving logic. Switched recommendation context to "Direct Blob" vs "CDN" strategies based on server resource analysis.
*   **Visitor Counter**: Integrated a visitor tracking module in the Admin Dashboard to monitor site traffic.

### 📱 Mobile & Deployment
*   **Android Release Build**: Successfully configured the Gradle build pipeline for Android.
    *   Resolved Java version conflicts (upgraded build environment to JDK 21).
    *   Generated signed release APK: `KridoBahtiar-Release.apk`.
*   **Vercel Deployment**: Fixed custom domain configuration (`emkn1magelang-elektronika.web.id`) by correcting DNS records to match Vercel's requirements.

### 🏗️ Database & Backend
*   **Schema Updates**: Created `app_versions` table for managing APK versioning.
*   **Foreign Key Fixes**: Updated `activities` table constraints (`ON DELETE CASCADE`) to prevent errors when deleting users with associated logs.
*   **Route Conflict Resolution**: Resolved URL path conflict between Admin `/activities` and Public `/activities`. Admin routes now reside safely under `/dashboard/activities`.
*   **Dedicated Pages**: Implemented specific routes (`/projects`, `/activities`) to display complete datasets, keeping the Home page clean with limited items.
*   **SEO & Sitelinks**: Implemented Breadcrumb Schema and Organization Schema to optimize for Google Sitelinks and Logo visibility.

## 📚 Documentation & Guides

Detailed documentation for the recent optimizations and strategies implemented in this project:

*   **[⚡ Performance Guide](README_PERFORMANCE.md)**:
    *   Full explanation of the **7-Point Optimization Strategy** (Asset Caching, DB Tuning, Brotli, WebP, JS Minimization, HTML Structure, LCP Priority).
*   **[🚀 SEO Strategy](README_SEO_STRATEGY.md)**:
    *   Comprehensive guide on Personal Branding keywords, Schema Markup (JSON-LD), and On-Page/Off-Page SEO checklists.
*   **[📈 SEO Setup & Troubleshooting](README_SEO_SETUP.md)**:
    *   Step-by-step guide for registering with Google Search Console and troubleshooting "Couldn't fetch" or "Invalid sitemap address" errors.

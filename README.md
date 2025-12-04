# Krido Bahtiar - Personal Portfolio & App Management System

A modern, feature-rich personal portfolio and application management system built with React, Vite, and Supabase. This project serves as a central hub for showcasing projects, tracking activities, and distributing Android applications (APKs).

![Project Banner](https://via.placeholder.com/1200x400?text=Porto+App+V1)

## 🚀 Features

### 🌐 Public Facing
*   **Immersive Home Page**: Features a 3D-style background, dynamic hero section, and responsive layout.
*   **Portfolio Showcase**: Display projects with images, descriptions, and skill tags.
*   **Activity Logs**: Timeline view of recent activities and updates.
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

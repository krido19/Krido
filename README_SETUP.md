# Project Setup Instructions

## 1. Supabase Setup

1.  **Create a Supabase Project**: Go to [supabase.com](https://supabase.com) and create a new project.
2.  **Database Schema**:
    - Go to the **SQL Editor** in your Supabase dashboard.
    - Copy the contents of `supabase_schema.sql` from this project.
    - Paste it into the SQL Editor and run it.
3.  **Storage Buckets**:
    - Go to **Storage** in your Supabase dashboard.
    - Create three new public buckets named:
        - `avatars`
        - `portfolio`
        - `activities`
4.  **Environment Variables**:
    - Copy `.env.example` to a new file named `.env`.
    - Fill in your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project settings (API section).

## 2. Run the Project

1.  **Install Dependencies** (if not already done):
    ```bash
    npm install
    ```
2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

## 3. Build for Android

1.  **Sync Capacitor**:
    ```bash
    npx cap sync
    ```
2.  **Open Android Studio**:
    ```bash
    npx cap open android
    ```
3.  **Build APK**: Use Android Studio to build the APK (Build > Build Bundle(s) / APK(s) > Build APK).

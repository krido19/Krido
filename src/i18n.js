import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "welcome": "Welcome Back",
            "signin_subtitle": "Sign in to manage your portfolio",
            "email": "Email Address",
            "password": "Password",
            "signin": "Sign in",
            "dashboard": "Dashboard",
            "logout": "Logout",
            "profile": "Profile",
            "profile_desc": "Manage your personal information and bio.",
            "edit_profile": "Edit Profile",
            "portfolio": "Portfolio",
            "portfolio_desc": "Manage your projects and works.",
            "manage_portfolio": "Manage Portfolio",
            "activities": "Activities",
            "activities_desc": "Manage your daily activities and logs.",
            "manage_activities": "Manage Activities",
            "theme_bright": "Bright",
            "theme_gloomy": "Gloomy",
            "manage_apps": "Manage Apps",
            "back_to_home": "Back to Home",
            "app_repository": "App Repository",
            "available_downloads": "Available Downloads",
            "access_latest_builds": "Access the latest builds securely.",
            "no_data_found": "No Data Found",
            "repository_empty": "Repository is empty. Check back later.",
            "downloads_count": "Downloads",
            "get_apk": "Get APK",
            "version": "v",
            "login_title": "Sign In",
            "signup_title": "Sign Up",
            "signup_subtitle": "Create an account to get started",
            "signup_button": "Sign Up",
            "no_account": "Don't have an account?",
            "have_account": "Already have an account?",
            "hero_title": "Building Digital Experiences",
            "hero_subtitle": "I craft beautiful and functional web applications.",
            "view_portfolio": "View Portfolio",
            "contact_me": "Contact Me",
            "loading": "Loading...",
            "error": "Error",
            "success": "Success",
        }
    },
    id: {
        translation: {
            "welcome": "Selamat Datang Kembali",
            "signin_subtitle": "Masuk untuk mengelola portofolio Anda",
            "email": "Alamat Email",
            "password": "Kata Sandi",
            "signin": "Masuk",
            "dashboard": "Dasbor",
            "logout": "Keluar",
            "profile": "Profil",
            "profile_desc": "Kelola informasi pribadi dan bio Anda.",
            "edit_profile": "Edit Profil",
            "portfolio": "Portofolio",
            "portfolio_desc": "Kelola proyek dan karya Anda.",
            "manage_portfolio": "Kelola Portofolio",
            "activities": "Kegiatan",
            "activities_desc": "Kelola kegiatan sehari-hari dan catatan Anda.",
            "manage_activities": "Kelola Kegiatan",
            "theme_bright": "Cerah",
            "theme_gloomy": "Suram",
            "manage_apps": "Kelola Aplikasi",
            "back_to_home": "Kembali ke Beranda",
            "app_repository": "Repositori Aplikasi",
            "available_downloads": "Unduhan Tersedia",
            "access_latest_builds": "Akses versi terbaru secara aman.",
            "no_data_found": "Data Tidak Ditemukan",
            "repository_empty": "Repositori kosong. Silakan cek kembali nanti.",
            "downloads_count": "Unduhan",
            "get_apk": "Unduh APK",
            "version": "v",
            "login_title": "Masuk",
            "signup_title": "Daftar",
            "signup_subtitle": "Buat akun untuk memulai",
            "signup_button": "Daftar",
            "no_account": "Belum punya akun?",
            "have_account": "Sudah punya akun?",
            "hero_title": "Membangun Pengalaman Digital",
            "hero_subtitle": "Saya membuat aplikasi web yang indah dan fungsional.",
            "view_portfolio": "Lihat Portofolio",
            "contact_me": "Hubungi Saya",
            "loading": "Memuat...",
            "error": "Kesalahan",
            "success": "Berhasil",
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "id", // Default language
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;

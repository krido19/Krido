-- Insert dummy services
-- Assumes at least one profile exists. Assigns to the first found profile.

DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get the first user ID from profiles
  SELECT id INTO target_user_id FROM public.profiles LIMIT 1;

  IF target_user_id IS NOT NULL THEN
    -- Service 1: Landing Page
    INSERT INTO public.services (user_id, title_en, title_id, price, time_en, time_id, features_en, features_id, color, popular)
    VALUES (
      target_user_id,
      'Landing Page',
      'Landing Page',
      'Starts from Rp 1.500.000',
      '3-5 Days',
      '3-5 Hari',
      '["Responsive Design", "SEO Friendly", "Fast Loading", "Free Hosting (1 Year)", "Social Media Integration"]'::jsonb,
      '["Desain Responsif", "Ramah SEO", "Loading Cepat", "Hosting Gratis (1 Tahun)", "Integrasi Media Sosial"]'::jsonb,
      'from-cyan-400 to-blue-500',
      false
    );

    -- Service 2: Web Application
    INSERT INTO public.services (user_id, title_en, title_id, price, time_en, time_id, features_en, features_id, color, popular)
    VALUES (
      target_user_id,
      'Web Application',
      'Aplikasi Web',
      'Starts from Rp 3.500.000',
      '2-4 Weeks',
      '2-4 Minggu',
      '["Dynamic Data", "Admin Dashboard", "Database Integration", "User Authentication", "API Integration"]'::jsonb,
      '["Data Dinamis", "Dashboard Admin", "Integrasi Database", "Otentikasi Pengguna", "Integrasi API"]'::jsonb,
      'from-purple-400 to-pink-500',
      true
    );

    -- Service 3: Android App
    INSERT INTO public.services (user_id, title_en, title_id, price, time_en, time_id, features_en, features_id, color, popular)
    VALUES (
      target_user_id,
      'Android App (APK)',
      'Aplikasi Android (APK)',
      'Starts from Rp 4.500.000',
      '3-6 Weeks',
      '3-6 Minggu',
      '["Native Performance", "Play Store Ready", "Offline Capabilities", "Push Notifications", "Device Features Access"]'::jsonb,
      '["Performa Native", "Siap Play Store", "Kapabilitas Offline", "Notifikasi Push", "Akses Fitur Perangkat"]'::jsonb,
      'from-green-400 to-emerald-600',
      false
    );
  ELSE
    RAISE NOTICE 'No profile found to assign services to.';
  END IF;
END $$;

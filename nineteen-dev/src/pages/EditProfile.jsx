import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import Avatar from '../components/Avatar';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Phone, Globe, Link2, AtSign, ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';
import AppJoyride from '../components/AppJoyride';
import { useTour } from '../hooks/useTour';

const Field = ({ label, htmlFor, children, colSpan }) => (
  <div className={colSpan ? 'md:col-span-2' : ''}>
    <label htmlFor={htmlFor} className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const IconInput = ({ id, type = 'text', value, onChange, placeholder, icon: Icon }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <Icon className="w-4 h-4 text-gray-400" />
    </div>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="input-flat pl-9"
    />
  </div>
);

const EditProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar_url, setAvatarUrl] = useState(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeUrl, setResumeUrl] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  const { runTour, handleJoyrideCallback } = useTour('profile', !loading);

  const profileSteps = [
    {
      target: '#tour-profile-avatar',
      title: '📸 Ganti Wajah Bisnismu',
      content: (
        <div className="flex flex-col gap-2">
          <p>Area ini khusus untuk <strong>Foto Profil</strong> Anda.</p>
          <ul className="list-disc pl-4 mt-1 text-gray-600 space-y-1 text-sm">
            <li>Klik tombol <strong>Upload</strong> untuk mengunggah foto baru.</li>
            <li>Gunakan foto profesional atau logo studio agar klien lebih percaya.</li>
          </ul>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '#tour-profile-basic',
      title: '📝 Lengkapi Identitas Dasar',
      content: (
        <div className="flex flex-col gap-2">
          <p>Bagian <strong>Informasi Dasar</strong> adalah apa yang pertama kali dibaca klien.</p>
          <ul className="list-disc pl-4 mt-1 text-gray-600 space-y-1 text-sm">
            <li>Tuliskan <strong>Bio</strong> yang menarik dan menjual keahlian Anda.</li>
            <li>Pastikan nomor <strong>WhatsApp</strong> aktif agar klien mudah menghubungi.</li>
          </ul>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#tour-profile-social',
      title: '🔗 Tautkan Portofolio Eksternal',
      content: (
        <div className="flex flex-col gap-2">
          <p>Punya akun profesional lain? Tautkan di sini!</p>
          <ul className="list-disc pl-4 mt-1 text-gray-600 space-y-1 text-sm">
            <li>Masukkan link <strong>GitHub</strong> untuk programmer.</li>
            <li>Masukkan link <strong>LinkedIn</strong> atau <strong>Instagram</strong> untuk desainer/freelancer.</li>
          </ul>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#tour-profile-cv',
      title: '📄 Senjata Utama: Resume / CV',
      content: (
        <div className="flex flex-col gap-2">
          <p>Jangan lupa mengunggah <strong>CV/Resume</strong> (format PDF).</p>
          <div className="bg-blue-50 text-blue-700 p-2 rounded-md mt-1 border border-blue-100 text-xs">
            Klien korporat biasanya selalu meminta CV sebelum menyewa jasa Anda!
          </div>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
    },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) getProfile(session);
    });
  }, []);

  const getProfile = async (session) => {
    try {
      setLoading(true);
      const { user } = session;

      let { data, error, status } = await supabase
        .from('profiles')
        .select('username, website, avatar_url, full_name, bio, github_url, linkedin_url, instagram_url, phone, resume_url')
        .eq('id', user.id)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        setUsername(data.username || '');
        setWebsite(data.website || '');
        setAvatarUrl(data.avatar_url);
        setFullName(data.full_name || '');
        setBio(data.bio || '');
        setGithubUrl(data.github_url || '');
        setLinkedinUrl(data.linkedin_url || '');
        setInstagramUrl(data.instagram_url || '');
        setPhone(data.phone || '');
        setResumeUrl(data.resume_url);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
      // loading=false akan memicu useEffect di atas — tidak perlu trigger tour di sini
    }
  };

  const uploadResume = async (event) => {
    try {
      setUploadingResume(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Pilih file PDF terlebih dahulu.');
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('resumes').upload(fileName, file);
      if (uploadError) throw uploadError;
      setResumeUrl(fileName);
      alert('Resume berhasil diupload!');
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingResume(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { user } = session;
      const updates = {
        id: user.id,
        username,
        website,
        avatar_url,
        full_name: fullName,
        bio,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        instagram_url: instagramUrl,
        phone,
        resume_url: resumeUrl,
        updated_at: new Date(),
      };
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      alert('Profile berhasil diperbarui!');
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };


  return (
    <div>
      <SEO title="Edit Profile" />

      <AppJoyride
        steps={profileSteps}
        run={runTour}
        callback={(data) => {
          handleJoyrideCallback(data);
          if (['finished', 'skipped'].includes(data.status)) {
            navigate('/dashboard');
          }
        }}
      />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Edit Profile</h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Perbarui informasi profil publik kamu</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="inline-block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <form onSubmit={updateProfile} className="max-w-3xl space-y-6">
          {/* Avatar */}
          <div id="tour-profile-avatar" className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 self-start">Foto Profil</p>
            <Avatar
              url={avatar_url}
              size={120}
              onUpload={(e, url) => setAvatarUrl(url)}
            />
          </div>

          {/* Basic Info */}
          <div id="tour-profile-basic" className="bg-white rounded-lg p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5 pb-2 border-b border-gray-100">
              Informasi Dasar
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Email" htmlFor="email">
                <input
                  id="email"
                  type="text"
                  value={session?.user.email}
                  disabled
                  className="input-flat opacity-50 cursor-not-allowed"
                />
              </Field>

              <Field label="Username" htmlFor="username">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-flat"
                />
              </Field>

              <Field label="Full Name" htmlFor="fullName" colSpan>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-flat"
                />
              </Field>

              <Field label="Bio" htmlFor="bio" colSpan>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="input-flat"
                />
              </Field>

              <Field label="Website" htmlFor="website">
                <IconInput
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://website.com"
                  icon={Globe}
                />
              </Field>

              <Field label="Phone (WhatsApp)" htmlFor="phone">
                <IconInput
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="628123456789"
                  icon={Phone}
                />
              </Field>
            </div>
          </div>

          {/* Social Links */}
          <div id="tour-profile-social" className="bg-white rounded-lg p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5 pb-2 border-b border-gray-100">
              Social Links
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="GitHub URL" htmlFor="github">
                <IconInput
                  id="github"
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  icon={Link2}
                />
              </Field>

              <Field label="LinkedIn URL" htmlFor="linkedin">
                <IconInput
                  id="linkedin"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  icon={ExternalLink}
                />
              </Field>

              <Field label="Instagram URL" htmlFor="instagram">
                <IconInput
                  id="instagram"
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/username"
                  icon={AtSign}
                />
              </Field>
            </div>
          </div>

          {/* Resume */}
          <div id="tour-profile-cv" className="bg-white rounded-lg p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 pb-2 border-b border-gray-100">
              Resume / CV
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              {resumeUrl && (
                <a
                  href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/resumes/${resumeUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold text-secondary hover:text-emerald-600 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Lihat Resume Saat Ini
                </a>
              )}
              <label className="flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-gray-200 text-foreground text-sm font-semibold rounded-md cursor-pointer transition-colors">
                {uploadingResume ? (
                  <>
                    <span className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload PDF
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={uploadResume}
                  disabled={uploadingResume}
                />
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || loading}
              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Menyimpan...' : 'Update Profile'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditProfile;

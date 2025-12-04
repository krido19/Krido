import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Avatar from '../components/Avatar';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Github, Linkedin, Instagram, Phone } from 'lucide-react';

const EditProfile = () => {
    const [loading, setLoading] = useState(true);
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
                .select(`username, website, avatar_url, full_name, bio, github_url, linkedin_url, instagram_url, phone, resume_url`)
                .eq('id', user.id)
                .single();

            if (error && status !== 406) {
                throw error;
            }

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
        }
    };

    const uploadResume = async (event) => {
        try {
            setUploadingResume(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select a PDF to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage.from('resumes').upload(filePath, file);

            if (uploadError) throw uploadError;
            setResumeUrl(filePath);
            alert('Resume uploaded successfully!');
        } catch (error) {
            alert(error.message);
        } finally {
            setUploadingResume(false);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
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

            let { error } = await supabase.from('profiles').upsert(updates);

            if (error) {
                throw error;
            }
            alert('Profile updated!');
            navigate('/dashboard');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center min-h-screen">
            <div className="w-full max-w-3xl p-8 space-y-8 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 tracking-wider">Edit Profile</h1>

                {loading ? (
                    <div className="flex justify-center">
                        <div className="w-12 h-12 border-4 border-t-cyan-500 border-r-pink-500 border-b-purple-500 border-l-yellow-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <form onSubmit={updateProfile} className="space-y-6">
                        <div className="flex justify-center">
                            <Avatar
                                url={avatar_url}
                                size={150}
                                onUpload={(e, url) => {
                                    setAvatarUrl(url);
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-cyan-400 mb-2">Email</label>
                                <input id="email" type="text" value={session?.user.email} disabled className="block w-full bg-black/50 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed" />
                            </div>

                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-cyan-400 mb-2">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-600 transition-all"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="fullName" className="block text-sm font-medium text-cyan-400 mb-2">Full Name</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="block w-full bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-600 transition-all"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="bio" className="block text-sm font-medium text-cyan-400 mb-2">Bio</label>
                                <textarea
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={4}
                                    className="block w-full bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-600 transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="website" className="block text-sm font-medium text-cyan-400 mb-2">Website</label>
                                <input
                                    id="website"
                                    type="url"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="block w-full bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-600 transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-cyan-400 mb-2">Phone (WhatsApp)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Phone className="w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                                    </div>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="628123456789"
                                        className="block w-full pl-10 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-600 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="github" className="block text-sm font-medium text-cyan-400 mb-2">GitHub URL</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Github className="w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                                    </div>
                                    <input
                                        id="github"
                                        type="url"
                                        value={githubUrl}
                                        onChange={(e) => setGithubUrl(e.target.value)}
                                        className="block w-full pl-10 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-600 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="linkedin" className="block text-sm font-medium text-cyan-400 mb-2">LinkedIn URL</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Linkedin className="w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                                    </div>
                                    <input
                                        id="linkedin"
                                        type="url"
                                        value={linkedinUrl}
                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                        className="block w-full pl-10 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-600 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="instagram" className="block text-sm font-medium text-cyan-400 mb-2">Instagram URL</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Instagram className="w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                                    </div>
                                    <input
                                        id="instagram"
                                        type="url"
                                        value={instagramUrl}
                                        onChange={(e) => setInstagramUrl(e.target.value)}
                                        className="block w-full pl-10 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-600 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-cyan-400 mb-2">Resume / CV (PDF)</label>
                                <div className="flex items-center mt-2 space-x-4">
                                    {resumeUrl && (
                                        <a
                                            href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/resumes/${resumeUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-pink-500 hover:text-pink-400 transition-colors"
                                        >
                                            <FileText className="w-4 h-4 mr-1" /> View Current Resume
                                        </a>
                                    )}
                                    <label className="flex items-center px-4 py-2 text-sm font-bold text-black bg-cyan-500 rounded-lg cursor-pointer hover:bg-cyan-400 transition-colors">
                                        {uploadingResume ? 'Uploading...' : <><Upload className="w-4 h-4 mr-2" /> Upload PDF</>}
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
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex justify-center w-full px-4 py-3 text-sm font-bold text-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg hover:from-cyan-400 hover:to-pink-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] clip-path-polygon"
                                style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                                disabled={loading}
                            >
                                {loading ? 'Loading ...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditProfile;

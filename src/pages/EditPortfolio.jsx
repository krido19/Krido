import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, ArrowLeft } from 'lucide-react';

const EditPortfolio = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectUrl, setProjectUrl] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [skills, setSkills] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPortfolioItem(id);
        }
    }, [id]);

    const fetchPortfolioItem = async (itemId) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('portfolio')
                .select('*')
                .eq('id', itemId)
                .single();

            if (error) throw error;
            if (data) {
                setTitle(data.title);
                setDescription(data.description);
                setProjectUrl(data.project_url);
                setImageUrl(data.image_url);
                setSkills(data.skills ? data.skills.join(', ') : '');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (event) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('portfolio')
                .upload(filePath, file);

            if (uploadError) throw uploadError;
            setImageUrl(filePath);
        } catch (error) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '');

            const portfolioData = {
                user_id: user.id,
                title,
                description,
                project_url: projectUrl,
                image_url: imageUrl,
                skills: skillsArray,
            };

            let error;
            if (id) {
                const { error: updateError } = await supabase
                    .from('portfolio')
                    .update(portfolioData)
                    .eq('id', id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('portfolio')
                    .insert([portfolioData]);
                error = insertError;
            }

            if (error) throw error;
            navigate('/portfolio');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center min-h-screen">
            <div className="w-full max-w-2xl p-8 space-y-8 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl shadow-lg">
                <button
                    onClick={() => navigate('/portfolio')}
                    className="flex items-center mb-6 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Portfolio
                </button>

                <h1 className="mb-6 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 tracking-wider">
                    {id ? 'Edit Project' : 'Add New Project'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-cyan-400 mb-2">
                            Project Image
                        </label>
                        <div className="flex items-center mt-2 space-x-4">
                            {imageUrl && (
                                <img
                                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/portfolio/${imageUrl}`}
                                    alt="Preview"
                                    className="object-cover w-32 h-32 rounded-lg border border-gray-700"
                                />
                            )}
                            <label className="flex items-center px-4 py-2 text-sm font-bold text-cyan-400 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 hover:text-white transition-all">
                                {uploading ? 'Uploading...' : <><Upload className="w-4 h-4 mr-2" /> Upload Image</>}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-cyan-400 mb-2">
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="block w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-cyan-400 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="block w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="skills" className="block text-sm font-medium text-cyan-400 mb-2">
                            Skills / Technologies (comma separated)
                        </label>
                        <input
                            id="skills"
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="React, Node.js, Python"
                            className="block w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="projectUrl" className="block text-sm font-medium text-cyan-400 mb-2">
                            Project URL
                        </label>
                        <input
                            id="projectUrl"
                            type="url"
                            value={projectUrl}
                            onChange={(e) => setProjectUrl(e.target.value)}
                            className="block w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 text-black font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg hover:from-cyan-400 hover:to-pink-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] disabled:opacity-50 clip-path-polygon"
                            style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                        >
                            {loading ? 'Saving...' : 'Save Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPortfolio;

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Smartphone } from 'lucide-react';

const EditApp = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        app_name: '',
        version: '',
        description: '',
        apk_url: '',
        image_url: ''
    });

    useEffect(() => {
        if (id) {
            fetchApp();
        }
    }, [id]);

    const fetchApp = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('app_releases')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setFormData(data);
            }
        } catch (error) {
            console.error('Error fetching app:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = async (e) => {
        try {
            setUploadingImage(true);
            const file = e.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `img_${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to 'apks' bucket (or a separate 'images' bucket if preferred, but 'apks' is already public)
            const { error: uploadError } = await supabase.storage
                .from('apks')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            setFormData({ ...formData, image_url: filePath });
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleFileChange = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type (basic check)
            if (!file.name.endsWith('.apk')) {
                alert('Please upload a valid .apk file');
                return;
            }

            // Create a friendly filename
            // Use app name if available, otherwise use original filename without extension
            const baseName = formData.app_name
                ? formData.app_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
                : file.name.replace(/\.apk$/i, '');

            const timestamp = new Date().getTime();
            const fileName = `${baseName}-${timestamp}.apk`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('apks')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            setFormData({ ...formData, apk_url: filePath });
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('No user logged in');

            const appData = {
                ...formData,
                user_id: user.id,
                updated_at: new Date()
            };

            let error;
            if (id) {
                const { error: updateError } = await supabase
                    .from('app_releases')
                    .update(appData)
                    .eq('id', id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('app_releases')
                    .insert([appData]);
                error = insertError;
            }

            if (error) throw error;
            navigate('/dashboard/apps');
        } catch (error) {
            console.error('Error saving app:', error);
            alert('Error saving app');
        } finally {
            setLoading(false);
        }
    };

    if (loading && id) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-pink-500 border-b-purple-500 border-l-yellow-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <button
                onClick={() => navigate('/dashboard/apps')}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Apps
            </button>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-lg">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-6 flex items-center tracking-wider">
                    <Smartphone className="mr-3 text-cyan-600 dark:text-cyan-400" />
                    {id ? 'Edit Application' : 'Add New Application'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-2">
                            App Name
                        </label>
                        <input
                            type="text"
                            name="app_name"
                            value={formData.app_name}
                            onChange={handleChange}
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-2">
                            Version
                        </label>
                        <input
                            type="text"
                            name="version"
                            value={formData.version}
                            onChange={handleChange}
                            placeholder="e.g. 1.0.0"
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-2">
                            App Icon / Screenshot
                        </label>
                        <div className="flex items-center space-x-4">
                            {formData.image_url && (
                                <img
                                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/apks/${formData.image_url}`}
                                    alt="Preview"
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-300 dark:border-gray-700"
                                />
                            )}
                            <label className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-cyan-600 dark:text-cyan-400 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition-all">
                                <Upload className="w-5 h-5 mr-2" />
                                {uploadingImage ? 'Uploading...' : 'Upload Image'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    disabled={uploadingImage}
                                />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-2">
                            APK File
                        </label>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-cyan-600 dark:text-cyan-400 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition-all">
                                <Upload className="w-5 h-5 mr-2" />
                                {uploading ? 'Uploading...' : 'Upload APK'}
                                <input
                                    type="file"
                                    accept=".apk"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                            {formData.apk_url && (
                                <span className="text-sm text-green-600 dark:text-green-400 font-bold">
                                    APK Uploaded
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Only .apk files are allowed.
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading || uploading || uploadingImage || !formData.apk_url}
                            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-bold uppercase tracking-wider rounded-lg hover:from-cyan-400 hover:to-pink-400 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed clip-path-polygon"
                            style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {loading ? 'Saving...' : 'Save Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditApp;

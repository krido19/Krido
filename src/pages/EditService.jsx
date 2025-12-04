import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const EditService = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title_en: '',
        title_id: '',
        price: '',
        time_en: '',
        time_id: '',
        features_en: [''],
        features_id: [''],
        color: 'from-cyan-400 to-blue-500',
        popular: false
    });

    useEffect(() => {
        if (id) {
            fetchService();
        }
    }, [id]);

    const fetchService = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    ...data,
                    features_en: Array.isArray(data.features_en) ? data.features_en : JSON.parse(data.features_en),
                    features_id: Array.isArray(data.features_id) ? data.features_id : JSON.parse(data.features_id)
                });
            }
        } catch (error) {
            console.error('Error fetching service:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFeatureChange = (index, lang, value) => {
        const key = lang === 'en' ? 'features_en' : 'features_id';
        const newFeatures = [...formData[key]];
        newFeatures[index] = value;
        setFormData(prev => ({ ...prev, [key]: newFeatures }));
    };

    const addFeature = (lang) => {
        const key = lang === 'en' ? 'features_en' : 'features_id';
        setFormData(prev => ({ ...prev, [key]: [...prev[key], ''] }));
    };

    const removeFeature = (index, lang) => {
        const key = lang === 'en' ? 'features_en' : 'features_id';
        const newFeatures = formData[key].filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, [key]: newFeatures }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user logged in');

            const payload = {
                ...formData,
                user_id: user.id,
                features_en: JSON.stringify(formData.features_en.filter(f => f.trim() !== '')),
                features_id: JSON.stringify(formData.features_id.filter(f => f.trim() !== ''))
            };

            if (id) {
                const { error } = await supabase
                    .from('services')
                    .update(payload)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('services')
                    .insert([payload]);
                if (error) throw error;
            }

            navigate('/dashboard/services');
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Error saving service');
        } finally {
            setLoading(false);
        }
    };

    const gradientOptions = [
        { label: 'Cyan to Blue', value: 'from-cyan-400 to-blue-500' },
        { label: 'Purple to Pink', value: 'from-purple-400 to-pink-500' },
        { label: 'Green to Emerald', value: 'from-green-400 to-emerald-600' },
        { label: 'Yellow to Orange', value: 'from-yellow-400 to-orange-500' },
        { label: 'Red to Pink', value: 'from-red-500 to-pink-500' },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/dashboard/services')}
                className="flex items-center text-gray-500 hover:text-cyan-500 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Services
            </button>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    {id ? 'Edit Service' : 'Create New Service'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">English Details</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (EN)</label>
                                <input
                                    type="text"
                                    name="title_en"
                                    value={formData.title_en}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Estimate (EN)</label>
                                <input
                                    type="text"
                                    name="time_en"
                                    value={formData.time_en}
                                    onChange={handleChange}
                                    placeholder="e.g. 3-5 Days"
                                    className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Features (EN)</label>
                                <div className="space-y-2">
                                    {formData.features_en.map((feature, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => handleFeatureChange(index, 'en', e.target.value)}
                                                className="flex-1 px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index, 'en')}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addFeature('en')}
                                        className="flex items-center text-sm text-cyan-600 hover:text-cyan-500"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add Feature
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">Indonesian Details</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (ID)</label>
                                <input
                                    type="text"
                                    name="title_id"
                                    value={formData.title_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Estimate (ID)</label>
                                <input
                                    type="text"
                                    name="time_id"
                                    value={formData.time_id}
                                    onChange={handleChange}
                                    placeholder="e.g. 3-5 Hari"
                                    className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Features (ID)</label>
                                <div className="space-y-2">
                                    {formData.features_id.map((feature, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => handleFeatureChange(index, 'id', e.target.value)}
                                                className="flex-1 px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index, 'id')}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addFeature('id')}
                                        className="flex items-center text-sm text-cyan-600 hover:text-cyan-500"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add Feature
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Common Details */}
                    <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Common Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                                <input
                                    type="text"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="e.g. Starts from Rp 1.500.000"
                                    className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color Theme</label>
                                <select
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                >
                                    {gradientOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="popular"
                                id="popular"
                                checked={formData.popular}
                                onChange={handleChange}
                                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                            />
                            <label htmlFor="popular" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Mark as Popular</label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-8 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {loading ? 'Saving...' : 'Save Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditService;

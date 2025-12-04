import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Smartphone, Download } from 'lucide-react';

const ManageApps = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('app_releases')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('is_pinned', { ascending: false })
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setApps(data);
            }
        } catch (error) {
            console.error('Error fetching apps:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePin = async (app) => {
        try {
            const { error } = await supabase
                .from('app_releases')
                .update({ is_pinned: !app.is_pinned })
                .eq('id', app.id);

            if (error) throw error;

            // Update local state
            setApps(apps.map(a => a.id === app.id ? { ...a, is_pinned: !a.is_pinned } : a).sort((a, b) => {
                // Sort by pinned (desc) then created_at (desc)
                if (a.is_pinned === b.is_pinned) {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                return a.is_pinned ? -1 : 1;
            }));
        } catch (error) {
            console.error('Error toggling pin:', error);
            alert('Error updating pin status');
        }
    };

    const handleDelete = async (id, apkUrl) => {
        if (window.confirm('Are you sure you want to delete this app release?')) {
            try {
                // Delete APK file from storage
                if (apkUrl) {
                    const { error: storageError } = await supabase.storage
                        .from('apks')
                        .remove([apkUrl]);

                    if (storageError) console.error('Error deleting APK file:', storageError);
                }

                // Delete record from database
                const { error } = await supabase
                    .from('app_releases')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setApps(apps.filter(app => app.id !== id));
            } catch (error) {
                console.error('Error deleting app:', error);
                alert('Error deleting app');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-pink-500 border-b-purple-500 border-l-yellow-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 flex items-center tracking-wider">
                    <Smartphone className="mr-3 text-cyan-400" />
                    Manage Applications
                </h1>
                <Link
                    to="/dashboard/apps/new"
                    className="flex items-center px-6 py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] clip-path-polygon"
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New App
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apps.map((app) => (
                    <div key={app.id} className={`group bg-gray-900/80 backdrop-blur-sm border ${app.is_pinned ? 'border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-gray-800'} rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]`}>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-700 group-hover:border-cyan-500/50 transition-colors">
                                            {app.image_url ? (
                                                <img
                                                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/apks/${app.image_url}`}
                                                    alt={app.app_name}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <Smartphone className="w-8 h-8 text-cyan-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{app.app_name}</h3>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="inline-block px-2 py-1 text-xs font-mono bg-gray-800 text-cyan-400 rounded border border-gray-700">
                                                    v{app.version}
                                                </span>
                                                {app.is_pinned && (
                                                    <span className="inline-block px-2 py-1 text-xs font-bold bg-yellow-400 text-black rounded">
                                                        PINNED
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => togglePin(app)}
                                        className={`p-2 rounded transition-colors ${app.is_pinned ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-400/10' : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50'}`}
                                        title={app.is_pinned ? "Unpin App" : "Pin App"}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={app.is_pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pin"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                                    </button>
                                    <Link
                                        to={`/dashboard/apps/edit/${app.id}`}
                                        className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 rounded transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(app.id, app.apk_url)}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800/50 rounded transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm mb-4 line-clamp-3 h-16">
                                {app.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-800">
                                <span className="flex items-center group-hover:text-cyan-400 transition-colors">
                                    <Download className="w-4 h-4 mr-1" />
                                    {app.download_count} downloads
                                </span>
                                <span className="font-mono text-xs">
                                    {new Date(app.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {apps.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-900/30 backdrop-blur-sm rounded-xl border-2 border-dashed border-gray-800 hover:border-cyan-500/30 transition-colors">
                        <Smartphone className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400 mb-4">No applications uploaded yet.</p>
                        <Link
                            to="/dashboard/apps/new"
                            className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
                        >
                            Upload your first app
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageApps;

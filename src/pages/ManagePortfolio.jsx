import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';

const ManagePortfolio = () => {
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('portfolio')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPortfolio(data);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const { error } = await supabase.from('portfolio').delete().eq('id', id);
                if (error) throw error;
                fetchPortfolio();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 tracking-wider">Manage Projects</h1>
                <Link
                    to="/portfolio/new"
                    className="flex items-center px-6 py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] clip-path-polygon"
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                >
                    <Plus className="w-4 h-4 mr-2" /> Add New
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <div className="w-12 h-12 border-4 border-t-cyan-500 border-r-pink-500 border-b-purple-500 border-l-yellow-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {portfolio.map((item) => (
                        <div key={item.id} className="group bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                            {item.image_url && (
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/portfolio/${item.image_url}`}
                                        alt={item.title}
                                        className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                                </div>
                            )}
                            <div className="p-6">
                                <h2 className="mb-2 text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{item.title}</h2>
                                <p className="mb-4 text-gray-400 text-sm line-clamp-3">{item.description}</p>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                                    {item.project_url && (
                                        <a
                                            href={item.project_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-cyan-400 hover:text-pink-500 transition-colors text-sm font-bold"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-1" /> View Project
                                        </a>
                                    )}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => navigate(`/portfolio/edit/${item.id}`)}
                                            className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 rounded transition-colors"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800/50 rounded transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManagePortfolio;

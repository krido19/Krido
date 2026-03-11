import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import Modal from '../components/Modal';

const ManagePortfolio = () => {
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 9;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async (isLoadMore = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
                setPage(0);
            }

            const from = isLoadMore ? (page + 1) * ITEMS_PER_PAGE : 0;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, error } = await supabase
                .from('portfolio')
                .select('*')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            if (data.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            if (isLoadMore) {
                setPortfolio(prev => [...prev, ...data]);
                setPage(prev => prev + 1);
            } else {
                setPortfolio(data);
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            const { error } = await supabase.from('portfolio').delete().eq('id', itemToDelete);
            if (error) throw error;
            fetchPortfolio();
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            alert(error.message);
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
                                            onClick={() => {
                                                setItemToDelete(item.id);
                                                setIsDeleteModalOpen(true);
                                            }}
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

            {/* Load More Button */}
            {!loading && hasMore && (
                <div className="flex justify-center mt-8 pb-8">
                    <button
                        onClick={() => fetchPortfolio(true)}
                        disabled={loadingMore}
                        className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-cyan-400 border border-cyan-500/30 font-bold text-sm tracking-wider rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loadingMore ? (
                            <>
                                <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                LOADING...
                            </>
                        ) : (
                            'LOAD MORE'
                        )}
                    </button>
                </div>
            )}

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
                onConfirm={handleDelete}
                title="DELETE_PROJECT"
                message="Are you sure you want to permanently delete this project? This action cannot be undone."
                confirmText="DELETE_PROJECT"
                type="pink"
            />
        </div>
    );
};

export default ManagePortfolio;

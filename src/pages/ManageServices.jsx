import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Zap, DollarSign } from 'lucide-react';

const ManageServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setServices(data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                const { error } = await supabase
                    .from('services')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setServices(services.filter(service => service.id !== id));
            } catch (error) {
                console.error('Error deleting service:', error);
                alert('Error deleting service');
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
                    <Zap className="mr-3 text-cyan-600 dark:text-cyan-400" />
                    Manage Services
                </h1>
                <Link
                    to="/dashboard/services/new"
                    className="flex items-center px-6 py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] clip-path-polygon"
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Service
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <div key={service.id} className={`group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border ${service.popular ? 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'border-gray-200 dark:border-gray-800'} rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 shadow-lg dark:shadow-lg hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]`}>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${service.color} mb-2`}>{service.title_id}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">EN: {service.title_en}</p>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <span className="inline-block px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 text-cyan-600 dark:text-cyan-400 rounded border border-gray-200 dark:border-gray-700">
                                            {service.price}
                                        </span>
                                        {service.popular && (
                                            <span className="inline-block px-2 py-1 text-xs font-bold bg-pink-500 text-white rounded">
                                                POPULAR
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Link
                                        to={`/dashboard/services/edit/${service.id}`}
                                        className="p-2 text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(service.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {services.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-800 hover:border-cyan-500/30 transition-colors">
                        <Zap className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-4">No services created yet.</p>
                        <Link
                            to="/dashboard/services/new"
                            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-bold hover:underline"
                        >
                            Create your first service
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageServices;

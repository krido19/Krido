import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ContactFab = () => {
    const [phone, setPhone] = useState('');

    useEffect(() => {
        fetchPhone();
    }, []);

    const fetchPhone = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('phone')
                    .eq('id', user.id)
                    .single();

                if (data) setPhone(data.phone);
            }
        } catch (error) {
            console.error('Error fetching phone:', error);
        }
    };

    if (!phone) return null;

    const handleClick = () => {
        const message = "Hello, I'm interested in your portfolio!";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className="fixed p-4 text-black transition-all duration-300 bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)] bottom-6 right-6 hover:bg-pink-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] hover:scale-110 focus:outline-none z-50 animate-pulse"
            aria-label="Contact on WhatsApp"
        >
            <MessageCircle className="w-6 h-6" />
        </button>
    );
};

export default ContactFab;

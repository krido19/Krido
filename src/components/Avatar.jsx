import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Upload } from 'lucide-react';

const Avatar = ({ url, size, onUpload }) => {
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (url) downloadImage(url);
    }, [url]);

    const downloadImage = async (path) => {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);
            if (error) {
                throw error;
            }
            const url = URL.createObjectURL(data);
            setAvatarUrl(url);
        } catch (error) {
            console.log('Error downloading image: ', error.message);
        }
    };

    const uploadAvatar = async (event) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            onUpload(event, filePath);
        } catch (error) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {avatarUrl ? (
                <div className="relative rounded-full p-1 bg-gradient-to-r from-cyan-400 to-pink-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                    <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="object-cover rounded-full border-4 border-black"
                        style={{ height: size, width: size }}
                    />
                </div>
            ) : (
                <div
                    className="flex items-center justify-center bg-gray-800 rounded-full border-2 border-dashed border-gray-600"
                    style={{ height: size, width: size }}
                >
                    <span className="text-gray-500">No Image</span>
                </div>
            )}
            <div style={{ width: size }}>
                <label
                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-bold text-black transition-all duration-300 bg-cyan-500 rounded cursor-pointer hover:bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] clip-path-polygon"
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                    htmlFor="single"
                >
                    {uploading ? 'Uploading ...' : <><Upload className="w-4 h-4 mr-2" /> Upload</>}
                </label>
                <input
                    style={{
                        visibility: 'hidden',
                        position: 'absolute',
                    }}
                    type="file"
                    id="single"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                />
            </div>
        </div>
    );
};

export default Avatar;

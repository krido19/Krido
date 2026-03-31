import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Upload } from 'lucide-react';
import { optimizeImage } from '../utils/imageOptimizer';

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

            const originalFile = event.target.files[0];
            // Intercept and compress image (avatars only need 800px max)
            const file = await optimizeImage(originalFile, 800, 0.8);

            const fileExt = file.name.split('.').pop() || 'webp';
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
                <div className="relative rounded-full p-1 bg-white border-4 border-muted">
                    <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="object-cover rounded-full"
                        style={{ height: size, width: size }}
                    />
                </div>
            ) : (
                <div
                    className="flex items-center justify-center bg-muted rounded-full border-2 border-dashed border-gray-300"
                    style={{ height: size, width: size }}
                >
                    <span className="text-gray-500 font-medium text-sm">No Image</span>
                </div>
            )}
            <div style={{ width: size }}>
                <label
                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-bold text-white transition-all duration-200 bg-primary hover:bg-blue-600 rounded-md cursor-pointer hover:scale-105"
                    htmlFor="single"
                >
                    {uploading ? 'Uploading...' : <><Upload className="w-4 h-4 mr-2" /> Upload</>}
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

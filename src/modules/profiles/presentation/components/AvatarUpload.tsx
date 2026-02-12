'use client';

import React, { useState, useRef } from 'react';
import { User, Camera, Loader2 } from 'lucide-react';
import { ImageCropperModal } from './ImageCropperModal';
import { useTranslation } from '@/core/i18n/TranslationContext';
import { updateAvatarAction } from '@/app/_actions/auth';

interface AvatarUploadProps {
    currentAvatarUrl?: string;
    onSuccess?: (newUrl: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentAvatarUrl, onSuccess }) => {
    const { t } = useTranslation();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setSelectedImage(reader.result as string);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onCropComplete = async (croppedImage: Blob) => {
        setSelectedImage(null);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('avatar', croppedImage, 'avatar.webp');

            const result = await updateAvatarAction(formData);

            if (result.success && result.avatarUrl) {
                onSuccess?.(result.avatarUrl);
            } else if (result.error) {
                console.error('Error uploading avatar:', result.error);
                alert(result.error);
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Error al subir la imagen');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="relative group">
            <div
                onClick={!isUploading ? triggerFileInput : undefined}
                className={`h-24 w-24 rounded-full overflow-hidden border-4 border-background shadow-lg relative cursor-pointer transition-all hover:ring-4 hover:ring-brand-primary/20 ${isUploading ? 'opacity-50' : ''}`}
            >
                {currentAvatarUrl ? (
                    <img
                        src={currentAvatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-brand-primary/10 flex items-center justify-center">
                        <User className="h-10 w-10 text-brand-primary" />
                    </div>
                )}

                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white h-8 w-8" />
                </div>

                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {selectedImage && (
                <ImageCropperModal
                    image={selectedImage}
                    onCropComplete={onCropComplete}
                    onCancel={() => setSelectedImage(null)}
                />
            )}

            {isUploading && (
                <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-brand-primary animate-pulse whitespace-nowrap">
                    Subiendo...
                </p>
            )}
        </div>
    );
};

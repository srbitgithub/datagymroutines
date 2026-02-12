'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/core/utils/imageUtils';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperModalProps {
    image: string;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
    image,
    onCropComplete,
    onCancel,
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onCropCompleteInternal = useCallback(
        (_croppedArea: any, croppedAreaPixels: any) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const handleSave = async () => {
        try {
            if (!croppedAreaPixels) return;
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            if (croppedImage) {
                onCropComplete(croppedImage);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-card rounded-2xl overflow-hidden shadow-2xl border flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Recortar Foto</h3>
                    <button
                        onClick={onCancel}
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="relative flex-1 min-h-[300px] bg-muted/20">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="p-6 space-y-6 bg-card">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <ZoomOut className="h-4 w-4" />
                                <span>Zoom</span>
                            </div>
                            <span>{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => onZoomChange(Number(e.target.value))}
                            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-brand-primary"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors font-medium"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

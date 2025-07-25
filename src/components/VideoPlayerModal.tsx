// src/components/VideoPlayerModal.tsx
import React from 'react';

// Define the props for VideoPlayerModal component
interface VideoPlayerModalProps {
    youtubeUrl: string;
    onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ youtubeUrl, onClose }) => {
    if (!youtubeUrl) return null; // Don't render modal if no URL

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-4xl h-auto aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white hover:text-gray-300 text-4xl font-bold z-10"
                    aria-label="Close video player"
                >
                    &times;
                </button>
                <iframe
                    className="w-full h-full"
                    src={youtubeUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};

export default VideoPlayerModal;

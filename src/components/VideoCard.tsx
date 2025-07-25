// src/components/VideoCard.tsx
import React from 'react';

// Define the type for a video object
interface Video {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    youtubeUrl: string;
    category: string;
    isFeatured: boolean;
}

// Define the props for VideoCard component
interface VideoCardProps {
    video: Video;
    onPlay: (youtubeUrl: string) => void;
    isCategoryURL: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onPlay, isCategoryURL }) => {
    return (
        <div className="relative flex-shrink-0 w-48 md:w-64 bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 group" style={isCategoryURL ? { width: "-webkit-fill-available" } : {}} >
            <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-32 md:h-40 object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/320x180/2d3748/e2e8f0?text=No+Image'; }}
            />  
            <div className="p-3">
                <h4 className="text-md md:text-lg font-semibold truncate">{video.title}</h4>
                <p className="text-gray-400 text-sm truncate">{video.description}</p>
                <div className="mt-3 flex justify-between items-center">
                    <button
                        onClick={() => onPlay(video.youtubeUrl)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center space-x-1"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        <span>Play</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;

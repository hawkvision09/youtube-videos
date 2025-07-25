// src/components/VideoRow.tsx
import React, { useRef, useState, useEffect } from 'react';
import VideoCard from './VideoCard'; // Using relative import

// Define the type for a video object
interface Video {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    youtubeUrl: string;
    category: string; // This will be the ORIGINAL YouTube Playlist title
    isFeatured: boolean;
}

// Define the props for VideoRow component
interface VideoRowProps {
    category: string; // This prop will be the ORIGINAL display name (e.g., "Fluorescent Vol.2")
    videos: Video[]; // This array contains videos with ORIGINAL categories (e.g., "Fluorescent Vol.2")
    onPlayVideo: (youtubeUrl: string) => void;
}

// Removed createSlug helper function from here

const VideoRow: React.FC<VideoRowProps> = ({ category, videos, onPlayVideo }) => {
    // Filter videos directly using the category prop (original name)
    const filteredVideos = videos.filter(video =>
        video && typeof video.category === 'string' && video.category === category
    );

    if (filteredVideos.length === 0) {
        console.log(`VideoRow: Not rendering for category "${category}" because filteredVideos is empty.`);
        return null;
    }

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showArrows, setShowArrows] = useState(false); // State to control arrow visibility

    // Function to calculate if arrows should be shown
    const checkScrollability = () => {
        if (scrollContainerRef.current) {
            setShowArrows(scrollContainerRef.current.scrollWidth > scrollContainerRef.current.clientWidth);
        }
    };

    // Effect to check scrollability on mount and on window resize
    useEffect(() => {
        checkScrollability(); // Initial check

        window.addEventListener('resize', checkScrollability);

        return () => {
            window.removeEventListener('resize', checkScrollability);
        };
    }, [filteredVideos.length]);

    // Function to scroll the container left
    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -250,
                behavior: 'smooth',
            });
        }
    };

    // Function to scroll the container right
    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 250,
                behavior: 'smooth',
            });
        }
    };

    console.log(`VideoRow: Rendering for category "${category}" with ${filteredVideos.length} videos.`, filteredVideos);

    return (
        <section className="mb-8 relative group">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 capitalize">{category}</h3>
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4"
            >
                {filteredVideos.map(video => (
                    <VideoCard
                        key={video.id}
                        video={video}
                        onPlay={onPlayVideo}
                    />
                ))}
            </div>

            {/* Left Arrow Button - Conditionally rendered based on showArrows state */}
            {showArrows && (
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 p-2 rounded-r-lg text-white text-2xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block"
                    aria-label="Scroll left"
                >
                    &#10094;
                </button>
            )}

            {/* Right Arrow Button - Conditionally rendered based on showArrows state */}
            {showArrows && (
                <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 p-2 rounded-l-lg text-white text-2xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block"
                    aria-label="Scroll right"
                >
                    &#10095;
                </button>
            )}
        </section>
    );
};

export default VideoRow;

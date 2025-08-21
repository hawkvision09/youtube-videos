import React, { useRef, useState, useEffect } from 'react';
import VideoCard from './VideoCardc'; // Relative import

// Video Row Component
const VideoRow = ({ category, videos, onPlayVideo }) => {
    // --- HOOKS MUST BE CALLED AT THE TOP LEVEL, UNCONDITIONALLY ---
    const scrollContainerRef = useRef(null);
    const [showArrows, setShowArrows] = useState(false);

    // --- Declare and initialize filteredVideos BEFORE any conditional returns ---
    const filteredVideos = videos.filter(video => 
        video && Array.isArray(video.categories) && video.categories.includes(category)
    );

    useEffect(() => {
        checkScrollability();
        window.addEventListener('resize', checkScrollability);
        return () => {
            window.removeEventListener('resize', checkScrollability);
        };
    }, [filteredVideos.length]); // Dependency is fine  

    if (filteredVideos.length === 0) {
        console.log(`VideoRow: Not rendering for category "${category}" because filteredVideos is empty.`);
        return null; // It's okay to return null/JSX conditionally AFTER hooks are called
    }

    const checkScrollability = () => {
        if (scrollContainerRef.current) {
            setShowArrows(scrollContainerRef.current.scrollWidth > scrollContainerRef.current.clientWidth);
        }
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -250,
                behavior: 'smooth',
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 250,
                behavior: 'smooth',
            });
        }
    };

    // console.log(`VideoRow: Rendering for category "${category}" with ${filteredVideos.length} videos.`, filteredVideos);

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

            {showArrows && (
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 p-2 rounded-r-lg text-white text-2xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-label="Scroll left"
                >
                    &#10094;
                </button>
            )}

            {showArrows && (
                <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 p-2 rounded-l-lg text-white text-2xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-label="Scroll right"
                >
                    &#10095;
                </button>
            )}
        </section>
    );
};

export default VideoRow;

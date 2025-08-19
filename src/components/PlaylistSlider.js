import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSlug } from '../utils/slug';

// PlaylistCard Component
const PlaylistCard = ({ playlist, onClick }) => {
    const thumbnailUrl = playlist.snippet.thumbnails.high?.url ||
        playlist.snippet.thumbnails.medium?.url ||
        'https://placehold.co/320x180/2d3748/e2e8f0?text=Playlist';

    return (
        <div
            onClick={onClick}
            className="relative flex-shrink-0 w-32 md:w-40 bg-gray-800 rounded-lg shadow-lg transition-transform duration-300 ease-in-out overflow-hidden hover:scale-105 group cursor-pointer"
        >
            <img
                src={thumbnailUrl}
                alt={playlist.snippet.title}
                className="w-full h-20 md:h-20 object-cover"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/320x180/2d3748/e2e8f0?text=No+Image'; }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-75 group-hover:bg-opacity-70 transition-all duration-300"></div>
            <div className="absolute bottom-0 left-0 p-3">
                <h4 className="text-md md:text-md text-wrap:inherit font-semibold truncate text-white drop-shadow-md">{playlist.snippet.title}</h4>
            </div>
        </div>

    );
};

// PlaylistSlider Component
const PlaylistSlider = ({ playlists }) => {
    const scrollContainerRef = useRef(null);
    const [showArrows, setShowArrows] = useState(false);
    const navigate = useNavigate();

    const checkScrollability = () => {
        if (scrollContainerRef.current) {
            setShowArrows(scrollContainerRef.current.scrollWidth > scrollContainerRef.current.clientWidth);
        }
    };

    useEffect(() => {
        checkScrollability();
        window.addEventListener('resize', checkScrollability);
        return () => {
            window.removeEventListener('resize', checkScrollability);
        };
    }, [playlists.length]);

    // Filter out 'Uploads' and 'Liked videos' playlists which are handled differently
    const filteredPlaylists = playlists.filter(p => p.snippet.title !== 'Uploads' && p.snippet.title !== 'Liked videos');

    if (!filteredPlaylists || filteredPlaylists.length === 0) {
        return null;
    }

    const handlePlaylistClick = (playlist) => {
        const slug = createSlug(playlist.snippet.title);
        navigate(`/playlist/${slug}`);
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    return (
        <section className="mb-8 relative group">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Playlists</h3>
            <div ref={scrollContainerRef} className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4">
                {filteredPlaylists.map(playlist => (
                    <PlaylistCard key={playlist.id} playlist={playlist} onClick={() => handlePlaylistClick(playlist)} />
                ))}
            </div>

            {showArrows && (
                <>
                    <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 p-2 rounded-r-lg text-white text-2xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-label="Scroll left">&#10094;</button>
                    <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 p-2 rounded-l-lg text-white text-2xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-label="Scroll right">&#10095;</button>
                </>
            )}
        </section>
    );
};

export default PlaylistSlider;

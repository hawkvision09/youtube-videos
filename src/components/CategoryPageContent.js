import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import VideoCard from './VideoCardc';

// Helper function (duplicated for self-containment in this component's file)
const createSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

// CategoryPageContent Component
const CategoryPageContent = ({
    allChannelVideos,
    allPlaylists,
    onPlayVideo,
    onGoToChannel // New prop for channel redirection
}) => {
    const { slug: categorySlug } = useParams(); // Get slug directly from URL
    const categoryNameForDisplay = categorySlug ? decodeURIComponent(categorySlug).replace(/\b\w/g, char => char.toUpperCase()) : 'Unknown';

    const [videos, setVideos] = useState([]);
    const [currentPlaylistThumbnail, setCurrentPlaylistThumbnail] = useState(null);
    const [currentPlaylistDescription, setCurrentPlaylistDescription] = useState(null);
    const [currentPlaylistYouTubeId, setCurrentPlaylistYouTubeId] = useState(null);

    // Effect to filter videos and find playlist thumbnail/description/ID
    useEffect(() => {
        // This component now relies on allChannelVideos and allPlaylists being passed from App.js
        // It does not need to re-fetch API data itself.

        console.log("Filtering videos for CategoryPageContent...");
        console.log("categorySlug from URL (useParams):", categorySlug);
        console.log("allChannelVideos (before filter):", allChannelVideos);
        console.log("allPlaylists (before thumbnail/description/ID search):", allPlaylists);

        if (allChannelVideos.length > 0) {
            const filtered = allChannelVideos.filter(video => {
                const videoCategory = video && typeof video.category === 'string' ? video.category : '';
                const videoCategorySlug = createSlug(videoCategory);
                console.log(`--- Filtering Comparison (CategoryPageContent) ---`);
                console.log(`Received Slug: "${categorySlug}"`);
                console.log(`Video Title: "${video.title}"`);
                console.log(`Video Category (Original): "${videoCategory}"`);
                console.log(`Video Category (Slugified): "${videoCategorySlug}"`);
                const isMatch = videoCategorySlug === categorySlug;
                console.log(`Match: ${isMatch}`);
                return isMatch;
            });
            console.log("Filtered videos (after filter - CategoryPageContent):", filtered);
            setVideos(filtered);
        } else {
            console.log("allChannelVideos is empty in CategoryPageContent, cannot filter yet.");
        }

        if (allPlaylists.length > 0) {
            const matchingPlaylist = allPlaylists.find(p => createSlug(p.snippet.title) === categorySlug);
            if (matchingPlaylist) {
                setCurrentPlaylistThumbnail(
                    matchingPlaylist.snippet.thumbnails.maxres?.url ||
                    matchingPlaylist.snippet.thumbnails.standard?.url ||
                    matchingPlaylist.snippet.thumbnails.high?.url ||
                    matchingPlaylist.snippet.thumbnails.medium?.url ||
                    matchingPlaylist.snippet.thumbnails.default?.url ||
                    null
                );
                setCurrentPlaylistDescription(matchingPlaylist.snippet.description || null);
                setCurrentPlaylistYouTubeId(matchingPlaylist.id);
            } else {
                setCurrentPlaylistThumbnail(null);
                setCurrentPlaylistDescription(null);
                setCurrentPlaylistYouTubeId(null);
            }
        }

    }, [allChannelVideos, categorySlug, allPlaylists]);

    return (
        <div className="min-h-screen bg-gray-900 text-white font-inter pt-20 px-6">
            <div className="flex max-w-4xl flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 py-20">
                {currentPlaylistThumbnail && (
                    <img
                        src={currentPlaylistThumbnail}
                        alt={`${categoryNameForDisplay} Playlist Cover`}
                        className="w-48 h-48 md:w-64 md:h-64 rounded-lg shadow-lg object-cover flex-shrink-0"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/256x256/2d3748/e2e8f0?text=Playlist+Cover'; }}
                    />
                )}
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-2 capitalize">{categoryNameForDisplay} Playlists</h2>
                    {currentPlaylistDescription && (
                        <p className="text-gray-300 text-lg line-clamp-3 mb-4">{currentPlaylistDescription}</p>
                    )}
                    <div className="flex space-x-4"> {/* Flex container for buttons */}
                        {currentPlaylistYouTubeId && (
                            <a
                                href={`https://www.youtube.com/playlist?list=${currentPlaylistYouTubeId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors duration-200 ease-in-out"
                            >
                                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm6.267 15.228c-.147.534-.67.925-1.29.988-.95.06-3.14.06-5.977.06-2.837 0-5.028 0-5.977-.06-.62-.063-1.144-.454-1.29-.988-.146-.534-.146-2.03-.146-4.228s0-3.694.146-4.228c.147-.534.67-.925 1.29-.988.95-.06 3.14-.06 5.977-.06 2.837 0 5.028 0 5.977.06.62.063 1.144.454 1.29.988.146.534.146 2.03.146 4.228s0 3.694-.146 4.228zM10.157 8.016l4.228 2.385-4.228 2.385V8.016z" />
                                </svg>
                                <span>View on YouTube</span>
                            </a>
                        )}
                        {/* New "Like and Subscribe Now" button */}
                        <button
                            onClick={onGoToChannel}
                            className="inline-flex items-center bg-gray-700 bg-opacity-70 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-300 ease-in-out"
                        >
                            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm6.267 15.228c-.147.534-.67.925-1.29.988-.95.06-3.14.06-5.977.06-2.837 0-5.028 0-5.977-.06-.62-.063-1.144-.454-1.29-.988-.146-.534-.146-2.03-.146-4.228s0-3.694.146-4.228c.147-.534.67-.925 1.29-.988.95-.06 3.14-.06 5.977-.06 2.837 0 5.028 0 5.977.06.62.063 1.144.454 1.29.988.146.534.146 2.03.146 4.228s0 3.694-.146 4.228zM10.157 8.016l4.228 2.385-4.228 2.385V8.016z" />
                            </svg>
                            <span>Subscribe</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {videos.length > 0 ? (
                    videos.map(video => (
                        <VideoCard
                            key={video.id}
                            video={video}
                            onPlay={onPlayVideo}
                            isCategoryGrid={true}
                        />
                    ))
                ) : (
                    <p className="text-gray-400 text-lg col-span-full text-center py-10">No videos found for this playlist.</p>
                )}
            </div>
        </div>
    );
};

export default CategoryPageContent;

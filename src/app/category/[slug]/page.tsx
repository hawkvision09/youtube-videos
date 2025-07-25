// src/app/category/[slug]/page.tsx
"use client"; // This directive marks the component as a Client Component

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Hook to get dynamic route parameters
import Header from '../../../components/Header'; // Corrected relative path
import VideoCard from '../../../components/VideoCard'; // Corrected relative path
import VideoPlayerModal from '../../../components/VideoPlayerModal'; // Corrected relative path
import CategoryModal from '../../../components/CategoryModal'; // Corrected relative path
// Removed VideoRow import as it will not be used here

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

// Define the type for a YouTube Playlist snippet (simplified)
interface YouTubePlaylistSnippet {
    title: string;
    description: string;
    thumbnails: {
        default?: { url: string; width: number; height: number; };
        medium?: { url: string; width: number; height: number; };
        high?: { url: string; width: number; height: number; };
        standard?: { url: string; width: number; height: number; };
        maxres?: { url: string; width: number; height: number; };
    };
}

// Define the type for a YouTube Playlist item
interface YouTubePlaylistItem {
    id: string;
    snippet: YouTubePlaylistSnippet;
}

// --- IMPORTANT: REPLACE WITH YOUR ACTUAL API KEY AND CHANNEL ID ---
// These should ideally be in environment variables or a shared constants file.
// For now, duplicating for clarity and self-containment of this file's logic.
const YOUTUBE_API_KEY = "AIzaSyBcyMe7wleCP2hPW5bCfiwY7kgCA2ORUzY"; // Replace with your actual API Key
const YOUR_CHANNEL_ID = "UCo90rv_0Uo-8yRWZyGgaNMg"; // Replace with your actual Channel ID

// Helper function to create a URL-friendly slug (consistent with CategoryModal)
const createSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars, keep spaces and hyphens
        .replace(/\s+/g, '-')       // Replace spaces with single hyphen
        .replace(/-+/g, '-')        // Replace multiple hyphens with single hyphen
        .trim();                    // Trim leading/trailing whitespace/hyphens
};

const CategoryPage: React.FC = () => {
    const params = useParams();
    const categorySlug = params.slug as string; // Get the category slug from the URL
    // Decode the URL slug back to its original display name for filtering and display
    const categoryNameForDisplay = decodeURIComponent(categorySlug).replace(/\b\w/g, char => char.toUpperCase());

    const [allChannelVideos, setAllChannelVideos] = useState<Video[]>([]); // Store all videos from the channel
    const [allPlaylists, setAllPlaylists] = useState<YouTubePlaylistItem[]>([]); // New state to store all fetched playlists
    const [currentPlaylistThumbnail, setCurrentPlaylistThumbnail] = useState<string | null>(null); // New state for playlist thumbnail
    const [currentPlaylistDescription, setCurrentPlaylistDescription] = useState<string | null>(null); // New state for playlist description
    const [currentPlaylistYouTubeId, setCurrentPlaylistYouTubeId] = useState<string | null>(null); // New state for playlist YouTube ID

    const [videos, setVideos] = useState<Video[]>([]); // State for videos filtered by this category
    const [loading, setLoading] = useState<boolean>(true); // New loading state
    const [error, setError] = useState<string | null>(null); // New error state

    const [showVideoPlayer, setShowVideoPlayer] = useState<boolean>(false);
    const [playingVideoUrl, setPlayingVideoUrl] = useState<string>('');
    const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);

    // Effect to fetch all videos from YouTube API (playlists and their items)
    useEffect(() => {
        const fetchYouTubeData = async () => {
            setLoading(true);
            setError(null);
            try {
                // This check ensures the fetch only proceeds if you've replaced the placeholders.
                if (YOUTUBE_API_KEY !== 'AIzaSyBcyMe7wleCP2hPW5bCfiwY7kgCA2ORUzY' || YOUR_CHANNEL_ID !== 'UCo90rv_0Uo-8yRWZyGgaNMg') {
                    setError("Please set your YOUTUBE_API_KEY and YOUR_CHANNEL_ID in src/app/category/[slug]/page.tsx");
                    setLoading(false);
                    return;
                }

                // 1. Fetch Playlists for the Channel
                const playlistsResponse = await fetch(
                    `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${YOUR_CHANNEL_ID}&maxResults=50&key=${YOUTUBE_API_KEY}`
                );

                if (!playlistsResponse.ok) {
                    throw new Error(`Failed to fetch playlists! status: ${playlistsResponse.status}`);
                }
                const playlistsData = await playlistsResponse.json();
                console.log("Category Page - YouTube Playlists Response:", playlistsData);
                setAllPlaylists(playlistsData.items); // Store all playlist data


                const allFetchedVideos: Video[] = [];

                // Add a default "All Videos" category if desired, using the uploads playlist
                const uploadsPlaylistId = `UU${YOUR_CHANNEL_ID.substring(2)}`;
                const allVideosResponse = await fetch(
                    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
                );
                if (allVideosResponse.ok) {
                    const allVideosData = await allVideosResponse.json();
                    allVideosData.items.forEach((item: any) => {
                        allFetchedVideos.push({
                            id: item.snippet.resourceId.videoId,
                            title: item.snippet.title,
                            description: item.snippet.description,
                            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || 'https://placehold.co/320x180/1a202c/e2e8f0?text=No+Image',
                            youtubeUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
                            category: 'All Videos', // Store ORIGINAL category name
                            isFeatured: false,
                        });
                    });
                }

                // 2. For each Playlist, Fetch its Videos (Playlist Items)
                for (const playlist of playlistsData.items) {
                    const playlistId = playlist.id;
                    const playlistTitle = playlist.snippet.title;

                    // Skip "Uploads" and "Liked videos" if they are returned as separate playlists
                    if (playlistTitle === 'Uploads' || playlistTitle === 'Liked videos') {
                        continue;
                    }

                    const playlistItemsResponse = await fetch(
                        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
                    );

                    if (!playlistItemsResponse.ok) {
                        console.warn(`Category Page - Failed to fetch items for playlist "${playlistTitle}". Status: ${playlistItemsResponse.status}`);
                        continue;
                    }
                    const playlistItemsData = await playlistItemsResponse.json();

                    playlistItemsData.items.forEach((item: any) => {
                        allFetchedVideos.push({
                            id: item.snippet.resourceId.videoId,
                            title: item.snippet.title,
                            description: item.snippet.description,
                            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || 'https://placehold.co/320x180/1a202c/e2e8f0?text=No+Image',
                            youtubeUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
                            category: playlistTitle, // Assign the ORIGINAL playlist title as the category
                            isFeatured: false,
                        });
                    });
                }

                // Remove duplicate videos (a video might be in multiple playlists)
                const uniqueVideos = Array.from(new Map(allFetchedVideos.map(video => [video.id, video])).values());
                setAllChannelVideos(uniqueVideos); // Store all unique videos

            } catch (e: any) {
                console.error("Error fetching YouTube data for category page:", e);
                setError(`Failed to load videos: ${e.message}. Please check API key and channel ID in src/app/category/[slug]/page.tsx, and ensure YouTube Data API v3 is enabled.`);
            } finally {
                setLoading(false);
            }
        };

        fetchYouTubeData();
    }, []); // Runs once on component mount

    // Effect to filter videos and find playlist thumbnail/description/ID when allChannelVideos or categorySlug changes
    useEffect(() => {
        console.log("Filtering videos...");
        console.log("categorySlug from URL:", categorySlug);
        console.log("categoryNameForDisplay (from URL slug):", categoryNameForDisplay);
        console.log("allChannelVideos (before filter):", allChannelVideos);
        console.log("allPlaylists (before thumbnail/description/ID search):", allPlaylists);


        if (allChannelVideos.length > 0) {
            const filtered = allChannelVideos.filter((video: Video) => {
                const videoCategory = video && typeof video.category === 'string' ? video.category : '';
                const videoCategorySlug = createSlug(videoCategory); // SLUGIFY video's category for comparison
                console.log(`--- Filtering Comparison ---`);
                console.log(`URL Slug: "${categorySlug}"`);
                console.log(`Video Title: "${video.title}"`);
                console.log(`Video Category (Original): "${videoCategory}"`);
                console.log(`Video Category (Slugified): "${videoCategorySlug}"`);
                const isMatch = videoCategorySlug === categorySlug;
                console.log(`Match: ${isMatch}`);
                return isMatch;
            });
            console.log("Filtered videos (after filter):", filtered);
            setVideos(filtered);
        } else {
            console.log("allChannelVideos is empty, cannot filter yet.");
        }

        // Find the playlist thumbnail, description, and YouTube ID
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
                setCurrentPlaylistYouTubeId(matchingPlaylist.id); // Store the playlist's YouTube ID
            } else {
                setCurrentPlaylistThumbnail(null);
                setCurrentPlaylistDescription(null);
                setCurrentPlaylistYouTubeId(null);
            }
        }

    }, [allChannelVideos, categorySlug, categoryNameForDisplay, allPlaylists]); // Added allPlaylists to dependencies

    // Function to play a video in a modal
    const playVideo = (youtubeUrl: string) => {
        setPlayingVideoUrl(youtubeUrl);
        setShowVideoPlayer(true);
    };

    // Function to close the video player modal
    const closeVideoPlayer = () => {
        setPlayingVideoUrl('');
        setShowVideoPlayer(false);
    };

    // Get all unique categories (playlist titles) for the modal from the fetched videos
    const allCategories = [...new Set(allChannelVideos.map(video => video.category).filter(Boolean))];

    return (
        <div className="min-h-screen bg-gray-900 text-white font-inter pt-20 px-6">
            <Header onOpenCategories={() => setShowCategoryModal(true)} />

            {loading && (
                <div className="min-h-screen flex items-center justify-center text-xl text-gray-400">
                    Loading playlist data...
                </div>
            )}
            {error && (
                <div className="min-h-screen flex flex-col items-center justify-center text-xl text-red-500 p-4 text-center">
                    Error: {error}
                    <p className="text-sm text-gray-400 mt-2">Check API Key/Channel ID in src/app/category/[slug]/page.tsx.</p>
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 py-20 max-w-4xl">
                        {currentPlaylistThumbnail && (
                            <img
                                src={currentPlaylistThumbnail}
                                alt={`${categoryNameForDisplay} Playlist Cover`}
                                className="w-48 h-48 md:w-64 md:h-64 rounded-lg shadow-lg object-cover flex-shrink-0"
                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/256x256/2d3748/e2e8f0?text=Playlist+Cover'; }}
                            />
                        )}
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2 capitalize">{categoryNameForDisplay} Playlists</h2>
                            {currentPlaylistDescription && (
                                <p className="text-gray-300 text-lg line-clamp-3 mb-4">{currentPlaylistDescription}</p>
                            )}
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
                                    View on YouTube
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {videos.length > 0 ? (
                            videos.map(video => (
                                <VideoCard
                                    key={video.id}
                                    video={video}
                                    onPlay={playVideo}
                                    isCategoryURL={true}
                                />
                            ))
                        ) : (
                            <p className="text-gray-400 text-lg col-span-full text-center py-10">No videos found for this playlist.</p>
                        )}
                    </div>
                </>
            )}

            <VideoPlayerModal
                youtubeUrl={playingVideoUrl}
                onClose={closeVideoPlayer}
            />

            {showCategoryModal && (
                <CategoryModal
                    categories={allCategories}
                    onClose={() => setShowCategoryModal(false)}
                />
            )}
        </div>
    );
};

export default CategoryPage;

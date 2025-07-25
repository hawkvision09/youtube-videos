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

// --- IMPORTANT: REPLACE WITH YOUR ACTUAL API KEY AND CHANNEL ID ---
// These should ideally be in environment variables or a shared constants file.
// For now, duplicating for clarity and self-containment of this file's logic.
const YOUTUBE_API_KEY = "AIzaSyBcyMe7wleCP2hPW5bCfiwY7kgCA2ORUzY"; // Replace with your actual API Key
const YOUR_CHANNEL_ID = "UCo90rv_0Uo-8yRWZyGgaNMg"; // Replace with your actual Channel ID

// Helper function to create a URL-friendly slug (consistent with CategoryModal)
// This is needed here to decode the URL slug for comparison with original category names
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
    // This is for display purposes in the H2 tag and for passing to CategoryModal
    const categoryNameForDisplay = decodeURIComponent(categorySlug).replace(/\b\w/g, char => char.toUpperCase());

    const [allChannelVideos, setAllChannelVideos] = useState<Video[]>([]); // Store all videos from the channel
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

    // Effect to filter videos when allChannelVideos or categorySlug changes
    useEffect(() => {
        console.log("Filtering videos...");
        console.log("categorySlug from URL:", categorySlug);
        console.log("categoryNameForDisplay (from URL slug):", categoryNameForDisplay); // Log display name
        console.log("allChannelVideos (before filter):", allChannelVideos);

        if (allChannelVideos.length > 0) {
            const filtered = allChannelVideos.filter((video: Video) => {
                const videoCategory = video && typeof video.category === 'string' ? video.category : '';
                const videoCategorySlug = createSlug(videoCategory); // SLUGIFY video's category for comparison
                console.log(`Comparing: "${videoCategorySlug}" === "${categorySlug}" for video: ${video.title}`);
                return videoCategorySlug === categorySlug; // Compare slugified category with URL slug
            });
            console.log("Filtered videos (after filter):", filtered);
            setVideos(filtered);
        } else {
            console.log("allChannelVideos is empty, cannot filter yet.");
        }
    }, [allChannelVideos, categorySlug, categoryNameForDisplay]); // Added categoryNameForDisplay to dependencies for clarity

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
    // Note: These are original names, which CategoryModal expects
    const allCategories = [...new Set(allChannelVideos.map(video => video.category).filter(Boolean))];

    return (
        <div className="min-h-screen bg-gray-900 text-white font-inter pt-20 px-6">
            <Header onOpenCategories={() => setShowCategoryModal(true)} />

            {loading && (
                <div className="min-h-screen flex items-center justify-center text-xl text-gray-400">
                    Loading playlist videos...
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
                    {/* Display the category name (from URL slug) */}
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 capitalize mt-16">{categoryNameForDisplay} Playlists</h2>

                    {/* Render VideoCards directly in a grid layout */}
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

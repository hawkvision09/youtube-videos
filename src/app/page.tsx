// src/app/page.tsx
"use client"; // This directive marks the component as a Client Component

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import VideoRow from '../components/VideoRow';
import VideoPlayerModal from '../components/VideoPlayerModal';
import CategoryModal from '../components/CategoryModal';

// Define the type for a video object
interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  youtubeUrl: string;
  category: string; // This will now be the ORIGINAL YouTube Playlist title
  isFeatured: boolean;
}

// --- IMPORTANT: REPLACE WITH YOUR ACTUAL API KEY AND CHANNEL ID ---
const YOUTUBE_API_KEY = "AIzaSyBcyMe7wleCP2hPW5bCfiwY7kgCA2ORUzY"; // Replace with your actual API Key
const YOUR_CHANNEL_ID = "UCo90rv_0Uo-8yRWZyGgaNMg"; // Replace with your actual Channel ID

// Define the keyword to mark videos as featured in their description
const FEATURED_KEYWORD = '[FEATURED]'; // You can change this keyword if you prefer

// Removed createSlug helper function from here

const HomePage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showVideoPlayer, setShowVideoPlayer] = useState<boolean>(false);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string>('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);

  // Effect to fetch playlists and their videos from YouTube API
  useEffect(() => {
    const fetchYouTubeData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (YOUTUBE_API_KEY !== 'AIzaSyBcyMe7wleCP2hPW5bCfiwY7kgCA2ORUzY' || YOUR_CHANNEL_ID !== 'UCo90rv_0Uo-8yRWZyGgaNMg') {
          setError("Please set your YOUTUBE_API_KEY and YOUR_CHANNEL_ID in src/app/page.tsx");
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
        console.log("YouTube Playlists Response:", playlistsData);

        const allFetchedVideos: Video[] = [];

        // Add a default "All Videos" category using the uploads playlist
        const uploadsPlaylistId = `UU${YOUR_CHANNEL_ID.substring(2)}`;
        const allVideosResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
        );
        if (allVideosResponse.ok) {
          const allVideosData = await allVideosResponse.json();
          allVideosData.items.forEach((item: any) => {
            const isFeaturedByKeyword = item.snippet.description?.toLowerCase().includes(FEATURED_KEYWORD.toLowerCase()) || false;
            allFetchedVideos.push({
              id: item.snippet.resourceId.videoId,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || 'https://placehold.co/320x180/1a202c/e2e8f0?text=No+Image',
              youtubeUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
              category: 'All Videos', // Store ORIGINAL category name
              isFeatured: isFeaturedByKeyword,
            });
          });
        }


        // 2. For each Playlist, Fetch its Videos (Playlist Items)
        for (const playlist of playlistsData.items) {
          const playlistId = playlist.id;
          const playlistTitle = playlist.snippet.title;
          // Removed slugification here

          // Skip "Uploads" and "Liked videos"
          if (playlistTitle === 'Uploads' || playlistTitle === 'Liked videos') {
            continue;
          }

          const playlistItemsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
          );

          if (!playlistItemsResponse.ok) {
            console.warn(`Failed to fetch items for playlist "${playlistTitle}". Status: ${playlistItemsResponse.status}`);
            continue;
          }
          const playlistItemsData = await playlistItemsResponse.json();

          playlistItemsData.items.forEach((item: any) => {
            const isFeaturedByKeyword = item.snippet.description?.toLowerCase().includes(FEATURED_KEYWORD.toLowerCase()) || false;
            allFetchedVideos.push({
              id: item.snippet.resourceId.videoId,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || 'https://placehold.co/320x180/1a202c/e2e8f0?text=No+Image',
              youtubeUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
              category: playlistTitle, // Assign the ORIGINAL playlist title as the category
              isFeatured: isFeaturedByKeyword,
            });
          });
        }

        // Remove duplicate videos (a video might be in multiple playlists)
        // If a video is featured in one place, ensure it remains featured
        const uniqueVideosMap = new Map<string, Video>();
        allFetchedVideos.forEach(video => {
          if (uniqueVideosMap.has(video.id)) {
            const existingVideo = uniqueVideosMap.get(video.id)!;
            uniqueVideosMap.set(video.id, {
              ...existingVideo,
              isFeatured: existingVideo.isFeatured || video.isFeatured
            });
          } else {
            uniqueVideosMap.set(video.id, video);
          }
        });
        const uniqueVideos = Array.from(uniqueVideosMap.values());

        setVideos(uniqueVideos);

      } catch (e: any) {
        console.error("Error fetching YouTube data:", e);
        setError(`Failed to load videos: ${e.message}. Please check your API key and channel ID, and ensure YouTube Data API v3 is enabled.`);
      } finally {
        setLoading(false);
      }
    };

    fetchYouTubeData();
  }, []);

  // Auto-slide logic for featured videos
  const featuredVideos = videos.filter(video => video.isFeatured);
  useEffect(() => {
    if (featuredVideos.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlideIndex(prevIndex =>
          (prevIndex + 1) % featuredVideos.length
        );
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [featuredVideos.length]);

  // Play video function
  const playVideo = (youtubeUrl: string) => {
    setPlayingVideoUrl(youtubeUrl);
    setShowVideoPlayer(true);
  };

  // Close video player function
  const closeVideoPlayer = () => {
    setPlayingVideoUrl('');
    setShowVideoPlayer(false);
  };

  // Navigate slides manually
  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  // Get unique categories for rendering rows (these are now original titles)
  const categories = [...new Set(videos.map(video => video.category).filter(Boolean))];


  return (
    <>
      <Header onOpenCategories={() => setShowCategoryModal(true)} />

      {loading && (
        <div className="min-h-screen flex items-center justify-center text-xl text-gray-400">
          Loading videos from YouTube channel...
        </div>
      )}
      {error && (
        <div className="min-h-screen flex flex-col items-center justify-center text-xl text-red-500 p-4 text-center">
          Error: {error}
          <p className="text-sm text-gray-400 mt-2">Ensure API Key and Channel ID are correct in src/app/page.tsx.</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <HeroSection
            featuredVideos={featuredVideos}
            currentSlideIndex={currentSlideIndex}
            onPlayVideo={playVideo}
            onGoToSlide={goToSlide}
          />

          <main className="relative z-20 -mt-20 md:-mt-32 px-6 pb-10">
            {/*
              For the home page, we want to display the original playlist titles
              in the row headers, and pass the original title to VideoRow.
            */}
            {categories.map(category => ( // category is now the original title
              <VideoRow
                key={category}
                category={category} // Pass original category name
                videos={videos} // Pass all videos, VideoRow will filter by original category
                onPlayVideo={playVideo}
              />
            ))}
          </main>
        </>
      )}

      <VideoPlayerModal
        youtubeUrl={playingVideoUrl}
        onClose={closeVideoPlayer}
      />

      {showCategoryModal && (
        <CategoryModal
          categories={categories} // Pass original display names to modal
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </>
  );
};

export default HomePage;

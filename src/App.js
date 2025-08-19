import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Import all sub-components
import Header from './components/Header';
import VideoPlayerModal from './components/VideoPlayerModal';
import CategoryModal from './components/CategoryModal';
import HomePageContent from './components/HomePageContent';
import CategoryPageContent from './components/CategoryPageContent';
import LoadingAnimation from './components/LoadingAnimation'; // Import the new component
import { createSlug } from './utils/slug';

// --- GLOBAL CONSTANTS (Replace with your actual API Key and Channel ID) ---
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || "YOUR_YOUTUBE_API_KEY"; // REPLACE WITH YOUR ACTUAL API KEY
const YOUR_CHANNEL_ID = process.env.REACT_APP_YOUTUBE_CHANNEL_ID || "YOUR_YOUTUBE_CHANNEL_ID"; // REPLACE WITH YOUR ACTUAL CHANNEL ID
const FEATURED_KEYWORD = '[FEATURED]'; // Keyword to mark videos as featured

// Construct the base URL for the YouTube channel
const YOUTUBE_CHANNEL_BASE_URL = `https://www.youtube.com/channel/${YOUR_CHANNEL_ID}`;

// --- MAIN APP COMPONENT ---
const App = () => {
  // Global states
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allPlaylists, setAllPlaylists] = useState([]);

  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [playingVideoUrl, setPlayingVideoUrl] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [minimumLoadingTimePassed, setMinimumLoadingTimePassed] = useState(false);

  const navigate = useNavigate();

  // Fetch all YouTube data (playlists and videos)
  const fetchYouTubeData = useCallback(async (startTime) => {
    console.log("Fetching YouTube data...");
    setLoading(true);
    setError(null);
    setMinimumLoadingTimePassed(false);

    const minLoadTimer = setTimeout(() => {
      setMinimumLoadingTimePassed(true);
    }, 3000);

    try {
      if (!YOUTUBE_API_KEY || !YOUR_CHANNEL_ID || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY' || YOUR_CHANNEL_ID === 'YOUR_YOUTUBE_CHANNEL_ID') {
        setError("API Key or Channel ID environment variables are not set correctly in App.js global constants.");
        setLoading(false);
        clearTimeout(minLoadTimer);
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
      setAllPlaylists(playlistsData.items);

      const allFetchedVideos = [];

      // Add a default "All Videos" category using the uploads playlist
      const uploadsPlaylistId = `UU${YOUR_CHANNEL_ID.substring(2)}`;
      const allVideosResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
      );
      if (allVideosResponse.ok) {
          const allVideosData = await allVideosResponse.json();
          allVideosData.items.forEach((item) => {
              const isFeaturedByKeyword = item.snippet.description?.toLowerCase().includes(FEATURED_KEYWORD.toLowerCase()) || false;
              allFetchedVideos.push({
                  id: item.snippet.resourceId.videoId,
                  title: item.snippet.title,
                  description: item.snippet.description,
                  thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || 'https://placehold.co/320x180/1a202c/e2e8f0?text=No+Image',
                  youtubeUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
                  categories: ['All Videos'],
                  isFeatured: isFeaturedByKeyword,
              });
          });
      }

      // 2. For each Playlist, Fetch its Videos (Playlist Items)
      for (const playlist of playlistsData.items) {
        const playlistId = playlist.id;
        const playlistTitle = playlist.snippet.title;

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

        playlistItemsData.items.forEach((item) => {
          const isFeaturedByKeyword = item.snippet.description?.toLowerCase().includes(FEATURED_KEYWORD.toLowerCase()) || false;
          allFetchedVideos.push({
            id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || 'https://placehold.co/320x180/1a202c/e2e8f0?text=No+Image',
            youtubeUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
            categories: [playlistTitle],
            isFeatured: isFeaturedByKeyword,
          });
        });
      }

      const uniqueVideosMap = new Map();
      allFetchedVideos.forEach(video => {
          if (uniqueVideosMap.has(video.id)) {
              const existingVideo = uniqueVideosMap.get(video.id);
              const newCategories = [...new Set([...existingVideo.categories, ...video.categories])];
              uniqueVideosMap.set(video.id, {
                  ...existingVideo,
                  categories: newCategories,
                  isFeatured: existingVideo.isFeatured || video.isFeatured
              });
          } else {
              uniqueVideosMap.set(video.id, video);
          }
      });
      const uniqueVideos = Array.from(uniqueVideosMap.values());
      setVideos(uniqueVideos);

    } catch (e) {
      console.error("Error fetching YouTube data:", e);
      setError(`Failed to load videos: ${e.message}. Please check your API key and channel ID in your .env.local file or deployment environment variables.`);
    } finally {
      clearTimeout(minLoadTimer);
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 3000) {
        setTimeout(() => setLoading(false), 3000 - elapsedTime);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    fetchYouTubeData(startTime);
  }, [fetchYouTubeData]);

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

  const playVideo = (youtubeUrl) => {
    setPlayingVideoUrl(youtubeUrl);
    setShowVideoPlayer(true);
  };

  const closeVideoPlayer = () => {
    setPlayingVideoUrl('');
    setShowVideoPlayer(false);
  };

  const allCategories = [...new Set(videos.flatMap(video => video.categories).filter(Boolean))];

  const handleSelectCategory = (category) => {
    const slug = createSlug(category);
    navigate(`/playlist/${slug}`);
    setShowCategoryModal(false);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Determine if the full content should be displayed or the loading animation
  const showLoadingAnimation = loading || !minimumLoadingTimePassed;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-inter antialiased">
      <Header onOpenPlaylists={() => setShowCategoryModal(true)} onGoHome={handleGoHome} />

      {showLoadingAnimation && <LoadingAnimation />}

      {error && !showLoadingAnimation && (
        <div className="min-h-screen flex flex-col items-center justify-center text-xl text-red-500 p-4 text-center">
          Error: {error}
          <p className="text-sm text-gray-400 mt-2">Ensure API Key and Channel ID are correct.</p>
        </div>
      )}

      {!showLoadingAnimation && !error && (
        <Routes>
          <Route path="/" element={
            <HomePageContent
              videos={videos}
              allPlaylists={allPlaylists}
              allCategories={allCategories}
              onPlayVideo={playVideo}
              currentSlideIndex={currentSlideIndex}
              onGoToSlide={(index) => setCurrentSlideIndex(index)}
              onGoToChannel={() => window.open(YOUTUBE_CHANNEL_BASE_URL, '_blank')}
            />
          } />
          <Route path="/playlist/:slug" element={
            <CategoryPageContent
              allChannelVideos={videos}
              allPlaylists={allPlaylists}
              onPlayVideo={playVideo}
              onGoToChannel={() => window.open(YOUTUBE_CHANNEL_BASE_URL, '_blank')}
            />
          } />
        </Routes>
      )}

      <VideoPlayerModal
        youtubeUrl={playingVideoUrl}
        onClose={closeVideoPlayer}
      />

      {showCategoryModal && (
        <CategoryModal
          categories={allCategories}
          onClose={() => setShowCategoryModal(false)}
          onSelectCategory={handleSelectCategory}
        />
      )}
    </div>
  );
};

export default App;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Import all sub-components
import Header from './components/Header';
import VideoPlayerModal from './components/VideoPlayerModal';
import CategoryModal from './components/CategoryModal';
import HomePageContent from './components/HomePageContent';
import CategoryPageContent from './components/CategoryPageContent';

// --- GLOBAL CONSTANTS (Replace with your actual API Key and Channel ID) ---
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || "YOUR_YOUTUBE_API_KEY"; // REPLACE WITH YOUR ACTUAL API KEY
const YOUR_CHANNEL_ID = process.env.REACT_APP_YOUTUBE_CHANNEL_ID || "YOUR_YOUTUBE_CHANNEL_ID"; // REPLACE WITH YOUR ACTUAL CHANNEL ID
const FEATURED_KEYWORD = '[FEATURED]';

// Construct the base URL for the YouTube channel
const YOUTUBE_CHANNEL_BASE_URL = `https://www.youtube.com/channel/${YOUR_CHANNEL_ID}`;

// --- HELPER FUNCTIONS ---
const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// --- MAIN APP COMPONENT ---
const App = () => { // This is the App component that will be rendered by index.js
  // Global states
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allPlaylists, setAllPlaylists] = useState([]);

  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [playingVideoUrl, setPlayingVideoUrl] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [minimumLoadingTimePassed, setMinimumLoadingTimePassed] = useState(false); // New state for min loading time

  const navigate = useNavigate();
  const startTime = Date.now(); // Capture start time of fetch

  // Fetch all YouTube data (playlists and videos)
  const fetchYouTubeData = useCallback(async () => {
    console.log("Fetching YouTube data...");
    setLoading(true);
    setError(null);
    setMinimumLoadingTimePassed(false); // Reset on new fetch

    // Start minimum loading timer
    const minLoadTimer = setTimeout(() => {
      setMinimumLoadingTimePassed(true);
    }, 3000); // 3 seconds minimum display time

    try {
      if (!YOUTUBE_API_KEY || !YOUR_CHANNEL_ID || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY' || YOUR_CHANNEL_ID === 'YOUR_YOUTUBE_CHANNEL_ID') {
        setError("API Key or Channel ID environment variables are not set correctly in App.js global constants.");
        setLoading(false);
        clearTimeout(minLoadTimer); // Clear timer if error occurs immediately
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
            category: 'All Videos',
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
            category: playlistTitle,
            isFeatured: isFeaturedByKeyword,
          });
        });
      }

      const uniqueVideosMap = new Map();
      allFetchedVideos.forEach(video => {
        if (uniqueVideosMap.has(video.id)) {
          const existingVideo = uniqueVideosMap.get(video.id);
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

    } catch (e) {
      console.error("Error fetching YouTube data:", e);
      setError(`Failed to load videos: ${e.message}. Please check your API key and channel ID in your .env.local file or deployment environment variables.`);
    } finally {
      // Only set loading to false after both data is fetched AND min time passed
      // This ensures the animation is shown for at least 3 seconds
      clearTimeout(minLoadTimer); // Clear the initial timer
      if (!minimumLoadingTimePassed) {
        // If data loaded before 3 seconds, wait for the timer to pass
        setTimeout(() => setLoading(false), 3000 - (Date.now() - startTime)); // Adjust delay if needed
      } else {
        // If 3 seconds already passed, set loading to false immediately
        setLoading(false);
      }
    }
  }, []);

  // Use a separate useEffect for the initial fetch to correctly manage dependencies
  useEffect(() => {
    fetchYouTubeData(startTime); // Pass start time to useCallback
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

  const allCategories = [...new Set(videos.map(video => video.category).filter(Boolean))];

  const handleSelectCategory = (slug) => {
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

      {showLoadingAnimation && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 z-50">
          <img src="https://placehold.co/200x200/ff0000/ffffff?text=Loading..." alt="Loading Animation" className="w-48 h-48 animate-pulse" />
          <p className="text-xl text-gray-400 mt-4">Loading your music experience...</p>
        </div>
      )}

      {error && !showLoadingAnimation && ( // Only show error if not loading animation
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

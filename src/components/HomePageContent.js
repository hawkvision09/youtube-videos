import { Helmet } from 'react-helmet-async';
import HeroSection from './HeroSection';
import VideoRow from './VideoRow';
import PlaylistSlider from './PlaylistSlider';

// HomePageContent Component
const HomePageContent = ({ videos, allPlaylists, allCategories, onPlayVideo, currentSlideIndex, onGoToSlide, onGoToChannel }) => {
    const featuredVideos = videos.filter(video => video.isFeatured);

    return (
        <>
            <Helmet>
                <title>Home - My YouTube Channel</title>
                <meta name="description" content="Welcome to my awesome YouTube channel. Browse through my featured videos and playlists." />
                <meta property="og:title" content="Home - My YouTube Channel" />
                <meta property="og:description" content="Welcome to my awesome YouTube channel. Browse through my featured videos and playlists." />
                <meta property="og:type" content="website" />
            </Helmet>
            <HeroSection
                featuredVideos={featuredVideos}
                currentSlideIndex={currentSlideIndex}
                onPlayVideo={onPlayVideo}
                onGoToSlide={onGoToSlide}
                onGoToChannel={onGoToChannel} // Pass onGoToChannel to HeroSection
            />
            <main className="relative z-20 -mt-20 md:-mt-32 px-6 pb-10 py-20 md:py-0">
                <PlaylistSlider playlists={allPlaylists} />
                {allCategories.map(category => (
                    <VideoRow
                        key={category}
                        category={category}
                        videos={videos}
                        onPlayVideo={onPlayVideo}
                    />
                ))}
            </main>
        </>
    );
};

export default HomePageContent;

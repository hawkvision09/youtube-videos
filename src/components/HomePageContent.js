import HeroSection from './HeroSection';
import VideoRow from './VideoRow';

// HomePageContent Component
const HomePageContent = ({ videos, allCategories, onPlayVideo, currentSlideIndex, onGoToSlide, onGoToChannel }) => {
    const featuredVideos = videos.filter(video => video.isFeatured);

    return (
        <>
            <HeroSection
                featuredVideos={featuredVideos}
                currentSlideIndex={currentSlideIndex}
                onPlayVideo={onPlayVideo}
                onGoToSlide={onGoToSlide}
                onGoToChannel={onGoToChannel} // Pass onGoToChannel to HeroSection
            />
            <main className="relative z-20 -mt-20 md:-mt-32 px-6 pb-10 py-20 md:py-0">
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

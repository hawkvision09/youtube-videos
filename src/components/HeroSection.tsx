// src/components/HeroSection.tsx
import React from 'react';

// Define the type for a video object
interface Video {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    youtubeUrl: string;
    category: string;
    isFeatured: boolean;
}

// Define the props for HeroSection component
interface HeroSectionProps {
    featuredVideos: Video[]; // Now an array of featured videos
    currentSlideIndex: number;
    onPlayVideo: (youtubeUrl: string) => void;
    onGoToSlide: (index: number) => void; // For dot navigation
}

const HeroSection: React.FC<HeroSectionProps> = ({ featuredVideos, currentSlideIndex, onPlayVideo, onGoToSlide }) => {
    if (featuredVideos.length === 0) return null; // Don't render if no featured videos

    const currentVideo = featuredVideos[currentSlideIndex];

    // Function to navigate to the previous slide
    const goToPrevSlide = () => {
        onGoToSlide((currentSlideIndex - 1 + featuredVideos.length) % featuredVideos.length);
    };

    // Function to navigate to the next slide
    const goToNextSlide = () => {
        onGoToSlide((currentSlideIndex + 1) % featuredVideos.length);
    };

    return (
        <div className="relative h-[60vh] md:h-[80vh] overflow-hidden flex items-center justify-center">
            {/* Background Image (Blurred and Darkened) */}
            <img
                src={currentVideo.thumbnail}
                alt={currentVideo.title}
                className="absolute inset-0 w-full h-full object-cover filter blur-lg brightness-50 transition-opacity duration-1000 ease-in-out"
                key={`bg-${currentVideo.id}`} // Key to force re-render and trigger transition on image change
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/1920x1080/1a202c/e2e8f0?text=Vivid+Background'; }}
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-70"></div>

            {/* Content Area - Split Layout */}
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start h-full max-w-6xl mx-auto px-6 py-40 space-y-6 md:space-y-0 md:space-x-12">
                {/* Video Frame (Left Side) */}
                <div className="flex-shrink-0 w-full md:w-1/2 lg:w-2/5 aspect-video rounded-xl overflow-hidden shadow-2xl transform transition-transform duration-500 ease-out hover:scale-105">
                    <img
                        src={currentVideo.thumbnail}
                        alt={currentVideo.title}
                        className="w-full h-full object-cover"
                        key={`thumb-${currentVideo.id}`} // Key to force re-render
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/640x360/2d3748/e2e8f0?text=Video+Frame'; }}
                    />
                </div>

                {/* Title, Description, Play Button (Right Side) */}
                <div className="flex-1 text-center md:text-left space-y-4 md:space-y-6">
                    <h2 className="text-1xl md:text-2xl lg:text-4xl font-extrabold leading-tight drop-shadow-lg transition-transform duration-500 ease-out transform translate-y-0 opacity-100">
                        {currentVideo.title}
                    </h2>
                    {/* <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto md:mx-0 drop-shadow-md transition-transform duration-500 ease-out delay-100 transform translate-y-0 opacity-100 line-clamp-3">
                        {currentVideo.description}
                    </p> */}
                    <button
                        onClick={() => onPlayVideo(currentVideo.youtubeUrl)}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-xl flex items-center justify-center space-x-3 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-75 mx-auto md:mx-0"
                    >
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        <span>Play Now</span>
                    </button>
                </div>
            </div>

            {/* Navigation Arrows */}
            {featuredVideos.length > 1 && (
                <>
                    <button
                        onClick={goToPrevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-3 rounded-full text-white text-2xl z-20 hover:bg-opacity-75 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 hidden md:block"
                        aria-label="Previous slide"
                    >
                        &#10094; {/* Left arrow */}
                    </button>
                    <button
                        onClick={goToNextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-3 rounded-full text-white text-2xl z-20 hover:bg-opacity-75 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 hidden md:block"
                        aria-label="Next slide"
                    >
                        &#10095; {/* Right arrow */}
                    </button>

                    {/* Dot Navigation */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                        {featuredVideos.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => onGoToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-colors duration-300 ${index === currentSlideIndex ? 'bg-white' : 'bg-gray-500 hover:bg-gray-300'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            ></button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default HeroSection;

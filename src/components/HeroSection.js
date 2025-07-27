// Hero Section Component
const HeroSection = ({ featuredVideos, currentSlideIndex, onPlayVideo, onGoToSlide, onGoToChannel }) => {
    if (featuredVideos.length === 0) return null;

    const currentVideo = featuredVideos[currentSlideIndex];

    const goToPrevSlide = () => {
        onGoToSlide((currentSlideIndex - 1 + featuredVideos.length) % featuredVideos.length);
    };

    const goToNextSlide = () => {
        onGoToSlide((currentSlideIndex + 1) % featuredVideos.length);
    };

    return (
        <div className="relative h-[60vh] md:h-[80vh] overflow-hidden flex items-center justify-center">
            <img
                src={currentVideo.thumbnail}
                // alt={currentVideo.title}
                className="absolute inset-0 w-full h-full object-cover filter blur-lg brightness-50 transition-opacity duration-1000 ease-in-out"
                key={`bg-${currentVideo.id}`}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/1920x1080/1a202c/e2e8f0?text=Vivid+Background'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-70"></div>

            <div className="relative py-60 z-10 flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start h-full max-w-6xl mx-auto p-6 space-y-6 md:space-y-0 md:space-x-12">
                <div className="flex-shrink-0 w-full md:w-1/2 lg:w-2/5 aspect-video rounded-xl overflow-hidden shadow-2xl transform transition-transform duration-500 ease-out hover:scale-105">
                    <img
                        src={currentVideo.thumbnail}
                        // alt={currentVideo.title}
                        className="w-full h-full object-cover"
                        key={`thumb-${currentVideo.id}`}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/640x360/2d3748/e2e8f0?text=Video+Frame'; }}
                    />
                </div>

                <div className="flex-1 text-center md:text-left space-y-4 md:space-y-6">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight drop-shadow-lg transition-transform duration-500 ease-out transform translate-y-0 opacity-100">
                        {currentVideo.title}
                    </h2>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto md:mx-0 drop-shadow-md transition-transform duration-500 ease-out delay-100 transform translate-y-0 opacity-100 line-clamp-3">
                        {/* {currentVideo.description} */}
                    </p>
                    <div className="flex justify-center md:justify-start space-x-4"> {/* Flex container for buttons */}
                        <button
                            onClick={() => onPlayVideo(currentVideo.youtubeUrl)}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-xl flex items-center justify-center space-x-3 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-75"
                        >
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            <span>Play Now</span>
                        </button>
                        {/* New "Like and Subscribe Now" button */}
                        <button
                            onClick={onGoToChannel}
                            className="bg-gray-700 bg-opacity-70 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-bold text-xl flex items-center justify-center space-x-3 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-75"
                        >
                            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm6.267 15.228c-.147.534-.67.925-1.29.988-.95.06-3.14.06-5.977.06-2.837 0-5.028 0-5.977-.06-.62-.063-1.144-.454-1.29-.988-.146-.534-.146-2.03-.146-4.228s0-3.694.146-4.228c.147-.534.67-.925 1.29-.988.95-.06 3.14-.06 5.977-.06 2.837 0 5.028 0 5.977.06.62.063 1.144.454 1.29.988.146.534.146 2.03.146 4.228s0 3.694-.146 4.228zM10.157 8.016l4.228 2.385-4.228 2.385V8.016z" />
                            </svg>
                            <span>Subscribe</span>
                        </button>
                    </div>
                </div>
            </div>

            {featuredVideos.length > 1 && (
                <>
                    <button
                        onClick={goToPrevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-3 rounded-full text-white text-2xl z-20 hover:bg-opacity-75 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 hidden md:block"
                        aria-label="Previous slide"
                    >
                        &#10094;
                    </button>
                    <button
                        onClick={goToNextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-3 rounded-full text-white text-2xl z-20 hover:bg-opacity-75 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 hidden md:block"
                        aria-label="Next slide"
                    >
                        &#10095;
                    </button>

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

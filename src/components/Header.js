import logo from '../assets/logo-header.svg';
import search from '../assets/search-2.svg';

// Header Component
const Header = ({ onOpenPlaylists, onGoHome }) => {

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-900 to-transparent p-4 flex justify-between items-center">
            {/* Logo button - direct child of header, will be pushed to the left */}
            <button onClick={onGoHome} className="flex justify-start items-center space-x-2 text-3xl font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer focus:outline-none">
                <img src={logo} alt="YouTube Music Logo" className="h-16 w-auto" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/32x32/ff0000/ffffff?text=YT'; }} />
            </button>

            {/* Navigation - direct child of header, will be pushed to the right */}
            <nav className="flex space-x-4 text-lg">
                <img src={search} alt="Search Icon" className="h-6 w-6" />
                <button onClick={onOpenPlaylists} className="hover:text-gray-300 hidden sm:block transition-colors focus:outline-none">Search Your Favorite Playlists</button>
            </nav>
        </header>
    );
};

export default Header;
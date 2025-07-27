import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logo.svg';

// Header Component
const Header = ({ onOpenPlaylists, onGoHome }) => {
    const navigate = useNavigate();


    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-900 to-transparent p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-3xl font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer focus:outline-none">
                    {/* Use %PUBLIC_URL% for assets from the public folder */}
                    <img src={logo} alt="YouTube Music Logo" className="h-8 w-auto" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/32x32/ff0000/ffffff?text=YT'; }} />
                    <span>YouTube Music</span>
                </button>
                <nav className="flex space-x-4 text-lg">
                    <button onClick={onOpenPlaylists} className="hover:text-gray-300 transition-colors focus:outline-none">Playlists</button>
                </nav>
            </div>
        </header>
    );
};

export default Header;

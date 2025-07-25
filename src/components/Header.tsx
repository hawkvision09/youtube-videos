// src/components/Header.tsx
import React from 'react';
import Link from 'next/link'; // Import Link for client-side navigation
// Removed: import Logo from '../../public/logo.svg'; - not needed for static assets from public

interface HeaderProps {
    onOpenCategories: () => void; // Prop to open the category modal
}

const Header: React.FC<HeaderProps> = ({ onOpenCategories }) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-900 to-transparent p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
                {/* Make the logo clickable and redirect to home */}
                <Link href="/" passHref className="flex items-center space-x-2 text-3xl font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer">
                    {/* Correct way to use an image from the public directory */}
                    <img src="/logo.svg" alt="YouTube Music Logo" className="h-16 w-auto" />
                </Link>
                {/* Removed hidden md:flex to make navigation visible on all screen sizes */}
                <nav className="flex space-x-4 text-lg">
                    <button onClick={onOpenCategories} className="hover:text-gray-300 transition-colors focus:outline-none">Playlists</button>
                </nav>
            </div>
        </header>
    );
};

export default Header;

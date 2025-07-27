import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Helper function (duplicated for self-containment in this component's file)
const createSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

// Category Modal Component
const CategoryModal = ({ categories, onClose, onSelectCategory }) => {
    const navigate = useNavigate(); // Initialize navigate hook

    const handleCategoryClick = (category) => {
        const slug = createSlug(category);
        navigate(`/playlist/${slug}`); // Use navigate to change URL
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl relative max-h-[80vh] overflow-y-auto scrollbar-hide">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold"
                    aria-label="Close playlists"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-6 text-white text-center">Browse Playlists</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.length > 0 ? (
                        categories.map(category => (
                            <button
                                key={category}
                                onClick={() => handleCategoryClick(category)}
                                className="bg-gray-700 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 ease-in-out shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 capitalize"
                            >
                                {category}
                            </button>
                        ))
                    ) : (
                        <p className="text-gray-400 col-span-full text-center">No playlists found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;

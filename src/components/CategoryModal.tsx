// src/components/CategoryModal.tsx
import React from 'react';
import { useRouter } from 'next/navigation'; // For navigation in client components

interface CategoryModalProps {
    categories: string[];
    onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ categories, onClose }) => {
    const router = useRouter();

    const handleCategoryClick = (category: string) => {
        // Create a URL-friendly slug from the category name
        // 1. Convert to lowercase
        // 2. Replace non-alphanumeric characters (except spaces and hyphens) with nothing
        // 3. Replace spaces and multiple hyphens with a single hyphen
        // 4. Trim leading/trailing hyphens
        const slug = category
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars, keep spaces and hyphens
            .replace(/\s+/g, '-')       // Replace spaces with single hyphen
            .replace(/-+/g, '-')        // Replace multiple hyphens with single hyphen
            .trim();                    // Trim leading/trailing whitespace/hyphens

        router.push(`/category/${encodeURIComponent(slug)}`); // Encode the slug for URL safety
        onClose(); // Close the modal after navigation
    };

    return (
        // Removed bg-black bg-opacity-80 from this div to remove the dark overlay
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl shadow-xl relative max-h-[80vh] overflow-y-auto scrollbar-hide">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold"
                    aria-label="Close playlists"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-6 text-white text-center">Browse Playlists</h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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

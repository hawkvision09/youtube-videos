import React, { useState, useEffect } from 'react';
import logo from '../assets/logo-2.png'; // Music note icon
import logoName from '../assets/logo-1.png'; // AOR text logo

// Generate a random number of dots with random positions and sizes
const generateRandomDots = (count) => {
    const dots = [];
    for (let i = 0; i < count; i++) {
        dots.push({
            id: i,
            size: Math.random() * (16 - 8) + 8, // Random size between 8px and 16px
            top: Math.random() * 100, // Random top position (0-100%)
            left: Math.random() * 100, // Random left position (0-100%)
            delay: Math.random() * 2, // Random animation delay (0-2s)
            duration: Math.random() * (2 - 1) + 1, // Random animation duration (1-2s)
        });
    }
    return dots;
};

// LoadingAnimation Component
const LoadingAnimation = () => {
    const [dots, setDots] = useState([]);

    useEffect(() => {
        // Generate dots only once when the component mounts
        setDots(generateRandomDots(30)); // Generate 30 random dots
    }, []);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 z-50 overflow-hidden">
            {/* Background dots */}
            {dots.map(dot => (
                <span
                    key={dot.id}
                    className="absolute bg-white rounded-full animate-ping"
                    style={{
                        width: `${dot.size}px`,
                        height: `${dot.size}px`,
                        top: `${dot.top}%`,
                        left: `${dot.left}%`,
                        animationDelay: `${dot.delay}s`,
                        animationDuration: `${dot.duration}s`,
                        // Ensure the dot's center is at the random position
                        transform: 'translate(-50%, -50%)',
                    }}
                ></span>
            ))}

            {/* Main loading content (logos) - placed on top of dots */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Music note icon with custom animation */}
                <img
                    src={logo}
                    alt="YouTube Music Logo Icon"
                    className="w-36 h-36 mb-4 animate-bounce-and-fade" // Apply custom animation
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/144x144/ff0000/ffffff?text=Icon'; }}
                />
                {/* Text logo with custom animation */}
                <img
                    src={logoName}
                    alt="YouTube Music Logo Name"
                    className="animate-fade-in-scale" // Apply custom animation
                    style={{ animationDelay: '0.5s' }} // Delay text animation slightly
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/150x50/ff0000/ffffff?text=Name'; }}
                />
            </div>

            {/* Custom CSS for animations */}
            <style>
                {`
        @keyframes bounce-and-fade {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          25% {
            transform: translateY(-10px) scale(1.05);
            opacity: 0.8;
          }
          50% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          75% {
            transform: translateY(-5px) scale(0.95);
            opacity: 0.8;
          }
        }

        .animate-bounce-and-fade {
          animation: bounce-and-fade 2s infinite ease-in-out;
        }

        @keyframes fade-in-scale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-scale {
          animation: fade-in-scale 1s forwards ease-out;
        }
        `}
            </style>
        </div>
    );
};

export default LoadingAnimation;
// src/app/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Recommended way to import Google Fonts
import './globals.css'; // Import global CSS

// Configure the Inter font using next/font
// This loads the font files and makes them available via CSS variables.
const inter = Inter({
  subsets: ['latin'],
  // We'll use a CSS variable name that matches the one we'll define in globals.css
  variable: '--font-inter-css-var'
});

export const metadata: Metadata = {
  title: 'YouTube Music Showcase',
  description: 'Showcasing music content from a YouTube channel with a Netflix-like UI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      {/* Apply the CSS variable for the font directly to the html element. */}
      {/* The actual font-family will be set in globals.css using this variable. */}
      <body className={`min-h-screen bg-gray-900 text-white antialiased ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}

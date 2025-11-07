import React from 'react';
import './globals.css';

export const metadata = {
    title: 'Code Analyzer',
    description: 'Review your code changes before MR',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
import React from 'react';
import Header from './Header';
import MCPChat from '../MCPChat';
import AnimatedPage from './AnimatedPage';

const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen font-sans text-slate-900 transition-colors duration-300 relative">
            <Header />
            <main className="max-w-[1600px] mx-auto py-8 relative z-10 w-full h-full">
                <AnimatedPage className="px-4 sm:px-6 lg:px-8">
                    {children}
                </AnimatedPage>
            </main>
            <MCPChat />
        </div>
    );
};

export default DashboardLayout;

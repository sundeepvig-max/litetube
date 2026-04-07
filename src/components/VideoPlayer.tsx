import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

export const VideoPlayer: React.FC = () => {
    const { activeVideo, isMinimized, toggleMinimize, clearPlayer } = usePlayer();
    const [isTheaterMode, setIsTheaterMode] = useState(false);

    if (!activeVideo) return null;

    // Render the floating Mini-Player PWA State
    if (isMinimized) {
        return (
            <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-80 bg-white dark:bg-zinc-900 shadow-2xl sm:rounded-lg overflow-hidden z-50 flex sm:flex-col border border-gray-200 dark:border-gray-800">
                <div className="w-32 sm:w-full aspect-video relative bg-black shrink-0">
                    <iframe 
                        className="w-full h-full pointer-events-none" 
                        src={`https://www.youtube-nocookie.com/embed/${activeVideo}?autoplay=1&controls=0&mute=0`}
                        allow="autoplay; encrypted-media" 
                    ></iframe>
                </div>
                <div className="flex-1 flex items-center justify-between p-3">
                    <div className="flex flex-col truncate">
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">Playing Video</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">LiteTube Mini-player</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 ml-2">
                        <button onClick={toggleMinimize} className="hover:text-black dark:hover:text-white">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h4v-2H5V8h14v10h-4v2h4c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-7 9H8v5h4v-5z"/></svg>
                        </button>
                        <button onClick={clearPlayer} className="hover:text-black dark:hover:text-white text-xl font-light">×</button>
                    </div>
                </div>
            </div>
        );
    }

    // Render the Primary Playback Layout matching YouTube
    return (
        <div className={`w-full min-h-screen bg-[#0f0f0f] pt-16 ${isTheaterMode ? 'px-0' : 'px-4 lg:px-24 xl:px-32 flex flex-col lg:flex-row gap-6'}`}>
            
            {/* Primary Left/Top Container */}
            <div className={`flex flex-col ${isTheaterMode ? 'w-full' : 'flex-1 min-w-0'}`}>
                {/* HTML5 Custom Styled Interceptor - 16/9 Video Container */}
                <div className={`relative w-full aspect-video bg-black group ${isTheaterMode ? '' : 'rounded-xl overflow-hidden'}`}>
                    <iframe 
                        className="w-full h-full" 
                        // Using nocookie domain to abstract away immediate trackers
                        src={`https://www.youtube-nocookie.com/embed/${activeVideo}?autoplay=1&enablejsapi=1`} 
                        title="LiteTube Player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                    
                    {/* Simulated Player Skin Overlay (Requires Custom JS to map strictly to iframe API if native) */}
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black/80 to-transparent flex items-center px-4 gap-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
                        <div className="text-white text-xs font-bold">1:23 / 18:45</div>
                        <div className="flex-1"></div>
                        
                        {/* Settings Gear */}
                        <svg className="w-5 h-5 fill-white drop-shadow-md" viewBox="0 0 24 24"><path d="M19.4 13c.0-.3.1-.6.1-.9s0-.6-.1-.9l2.1-1.7c.2-.2.2-.4.1-.6l-2-3.5C19.5 5.1 19.3 5 19 5.1l-2.5 1c-.5-.4-1.1-.7-1.7-1l-.4-2.7c0-.2-.2-.4-.5-.4h-4c-.3 0-.5.2-.5.4l-.4 2.7c-.6.3-1.2.6-1.7 1l-2.5-1c-.3-.1-.5 0-.6.1l-2 3.5c-.1.2-.1.5.1.6l2.1 1.7c-.1.3-.1.6-.1.9s0 .6.1.9l-2.1 1.7c-.2.2-.2.4-.1.6l2 3.5c.1.2.3.3.6.2l2.5-1c.5.4 1.1.7 1.7 1l.4 2.7c0 .2.2.4.5.4h4c.3 0 .5-.2.5-.4l.4-2.7c.6-.3 1.2-.6 1.7-1l2.5 1c.2.1.5 0 .6-.1l2-3.5c.1-.2.1-.5-.1-.6l-2.1-1.7zM12 15.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/></svg>
                        {/* Theater Toggle */}
                        <button className="pointer-events-auto" onClick={() => setIsTheaterMode(!isTheaterMode)}>
                            <svg className="w-6 h-6 fill-white drop-shadow-md" viewBox="0 0 24 24"><path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"/></svg>
                        </button>
                    </div>
                </div>

                {/* Video Info Data Below Player */}
                <div className={`mt-4 mb-6 ${isTheaterMode ? 'px-4 lg:px-24 xl:px-32' : ''}`}>
                    <h1 className="text-xl font-bold text-white mb-2 line-clamp-2">LiteTube Ad-Free Secured Stream</h1>
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex items-center gap-3 cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-slate-700"></div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-sm">Channel Name</span>
                                <span className="text-gray-400 text-xs">1.2M subscribers</span>
                            </div>
                            <button className="ml-4 bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-200">Subscribe</button>
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center transition border border-white/10">
                                <span>👍 150K</span><div className="w-[1px] h-4 bg-white/20 mx-3"></div><span>👎</span>
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-bold text-sm transition hidden sm:block border border-white/10">Share</button>
                            <button onClick={toggleMinimize} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-full font-bold text-sm transition">Minimize Player (PIP)</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Suggestions Column */}
            <div className={`hidden lg:flex flex-col w-[350px] xl:w-[400px] shrink-0 gap-3 ${isTheaterMode ? 'px-4 lg:px-24 xl:px-32' : ''}`}>
                <h3 className="text-white font-bold text-lg mb-2">Simulated Up Next</h3>
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="flex gap-2 cursor-pointer group">
                        <div className="w-40 aspect-video rounded-lg bg-zinc-800 relative shrink-0 overflow-hidden">
                            <div className="absolute bottom-1 right-1 bg-black/80 text-white font-bold px-1 rounded text-[10px]">10:24</div>
                        </div>
                        <div className="flex flex-col py-1">
                            <span className="text-sm font-semibold text-white line-clamp-2 leading-tight group-hover:text-blue-400">Related Video Watch Path Simulation {i}</span>
                            <span className="text-xs text-gray-400 mt-1">Creator</span>
                            <span className="text-xs text-gray-400">12K views • 2 days ago</span>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

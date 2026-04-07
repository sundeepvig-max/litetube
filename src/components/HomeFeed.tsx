import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { mockYouTubeData } from '../data/mockData';

export const HomeFeed: React.FC = () => {
  const { setActiveVideo, watchedTags } = usePlayer();
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

  // Simple sort mimicking a recommendation engine weighing previously viewed tags
  const feedItems = [...mockYouTubeData.items].sort((a, b) => {
    if (watchedTags.length === 0) return 0;
    const aMatch = a.contentDetails.tags.some(t => watchedTags.includes(t)) ? 1 : 0;
    const bMatch = b.contentDetails.tags.some(t => watchedTags.includes(t)) ? 1 : 0;
    return bMatch - aMatch;
  });

  const getRelativeTime = (dateStr: string) => {
    const published = new Date(dateStr);
    const now = new Date();
    const diffMonths = (now.getFullYear() - published.getFullYear()) * 12 + now.getMonth() - published.getMonth();
    if (diffMonths > 12) return `${Math.floor(diffMonths / 12)} years ago`;
    if (diffMonths > 0) return `${diffMonths} months ago`;
    return 'Recently';
  };

  return (
    <div className="w-full bg-white dark:bg-[#0f0f0f] min-h-screen px-4 sm:px-6 pt-20 pb-20">
      
      {/* Category Pills Header */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6 shrink-0">
        <button className="bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap">All</button>
        {watchedTags.length > 0 && watchedTags.map(tag => (
          <button key={tag} className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 rounded-lg text-sm transition font-medium capitalize whitespace-nowrap">{tag}</button>
        ))}
        <button className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 rounded-lg text-sm transition font-medium whitespace-nowrap">Live</button>
      </div>

      {/* Responsive Video Grid (1 col mobile -> 12-col nested config mimicking Modern YT) */}
      {/* 1 col on mobile, 2 col sm, 3 col md, 4 col lg 2K screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
        {feedItems.map((video) => {
            const isHovered = hoveredVideo === video.id.videoId;
            
            return (
              <div 
                key={video.id.videoId}
                className="flex flex-col cursor-pointer group w-full"
                onMouseEnter={() => setHoveredVideo(video.id.videoId)}
                onMouseLeave={() => setHoveredVideo(null)}
                onClick={() => setActiveVideo(video.id.videoId, video.contentDetails.tags)}
              >
                {/* Thumbnail Layer - 16/9 Aspect Ratio forced */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-zinc-800 transition-all duration-300">
                    <img 
                        src={video.snippet.thumbnails.high.url} 
                        alt={video.snippet.title}
                        className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}
                    />
                    
                    {/* Hover Mute Preview UI simulation */}
                    {isHovered && (
                        <div className="absolute top-2 right-2 bg-black/80 rounded px-1.5 py-0.5 text-white">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                        </div>
                    )}

                    {/* Metadata Overlay Bottom Right */}
                    <div className={`absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-bold px-1.5 py-0.5 rounded transition-opacity ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                        {video.contentDetails.duration}
                    </div>

                    {/* Red Progress Bar stub simulating "Watching" state */}
                    {watchedTags.some(t => video.contentDetails.tags.includes(t)) && (
                        <div className="absolute bottom-0 left-0 h-1 bg-red-600 w-1/3"></div>
                    )}
                </div>

                {/* Metadata Row */}
                <div className="flex mt-3 gap-3 pr-4">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 shrink-0 text-white font-bold flex flex-col justify-center items-center text-sm shadow">
                        {video.snippet.channelTitle.charAt(0)}
                    </div>
                    {/* Text block */}
                    <div className="flex flex-col">
                        <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {video.snippet.title}
                        </h3>
                        <p className="text-[13px] text-gray-600 dark:text-[#aaaaaa] mt-1 font-medium hover:text-gray-900 dark:hover:text-gray-200">
                            {video.snippet.channelTitle}
                        </p>
                        <p className="text-[13px] text-gray-600 dark:text-[#aaaaaa]">
                            {video.contentDetails.viewCount} views • {getRelativeTime(video.snippet.publishedAt)}
                        </p>
                    </div>
                </div>

              </div>
            );
        })}
      </div>
    </div>
  );
};

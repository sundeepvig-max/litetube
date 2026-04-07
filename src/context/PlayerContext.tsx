import React, { createContext, useContext, useState, useEffect } from 'react';

// Shared Global Player State
interface PlayerState {
  isPlaying: boolean;
  activeVideo: string | null;
  isMinimized: boolean;
  watchedTags: string[];
  setActiveVideo: (videoId: string, tags?: string[]) => void;
  toggleMinimize: () => void;
  clearPlayer: () => void;
}

const PlayerContext = createContext<PlayerState | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVideo, setActiveVideoState] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [watchedTags, setWatchedTags] = useState<string[]>([]);

  // Load and save personalized watched tags to mimic local recommendation engine
  useEffect(() => {
    const savedTags = localStorage.getItem('litetube_watched_tags');
    if (savedTags) setWatchedTags(JSON.parse(savedTags));
  }, []);

  const setActiveVideo = (videoId: string, tags: string[] = []) => {
    setActiveVideoState(videoId);
    setIsPlaying(true);
    setIsMinimized(false);
    
    if (tags.length > 0) {
      const mergedTags = Array.from(new Set([...watchedTags, ...tags]));
      setWatchedTags(mergedTags);
      localStorage.setItem('litetube_watched_tags', JSON.stringify(mergedTags));
    }
  };

  const toggleMinimize = () => setIsMinimized(prev => !prev);
  const clearPlayer = () => {
    setActiveVideoState(null);
    setIsPlaying(false);
    setIsMinimized(false);
  };

  return (
    <PlayerContext.Provider value={{
      isPlaying, activeVideo, isMinimized, watchedTags, 
      setActiveVideo, toggleMinimize, clearPlayer 
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

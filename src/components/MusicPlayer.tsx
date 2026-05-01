import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Music, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
}

const DUMMY_TRACKS: Track[] = [
  { id: 1, title: 'CYBER_PULSE_01', artist: 'NEON_GHOST', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'VOID_RUNNER', artist: 'NULL_POINTER', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'GLITCH_OVERRIDE', artist: 'SYNTH_STORM', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio(DUMMY_TRACKS[0].url));

  useEffect(() => {
    audio.src = DUMMY_TRACKS[currentTrackIndex].url;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const skipTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % DUMMY_TRACKS.length);

  const track = DUMMY_TRACKS[currentTrackIndex];

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-panel p-6 border-[#FF00FF]/20 flex flex-col gap-6 min-w-[320px] relative overflow-hidden" 
      id="music-player-container"
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF00FF] to-transparent opacity-30" />
      
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-16 h-16 bg-[#050505] neon-border border-[#FF00FF] flex items-center justify-center relative z-10">
            <Music className={`text-[#FF00FF] ${isPlaying ? 'animate-bounce' : ''}`} size={24} />
          </div>
          <div className="absolute inset-0 bg-[#FF00FF]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <motion.span 
            key={track.artist}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] font-mono tracking-widest text-[#00FFFF] uppercase mb-1"
          >
            {track.artist}
          </motion.span>
          <motion.span 
            key={track.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg font-bold tracking-tighter uppercase truncate text-white"
          >
            {track.title}
          </motion.span>
        </div>
      </div>

      {/* Visualizer Simulation */}
      <div className="h-8 flex items-end gap-[2px] px-2 opacity-50">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={isPlaying ? {
              height: [8, Math.random() * 24 + 4, 8],
            } : { height: 4 }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.05,
            }}
            className="flex-1 bg-gradient-to-t from-[#FF00FF] to-[#00FFFF]"
          />
        ))}
      </div>

      <div className="space-y-4">
        {/* Progress Bar Simulation */}
        <div className="relative h-[2px] bg-white/10 w-full">
           <motion.div 
            className="absolute top-0 left-0 h-full bg-[#00FFFF] shadow-[0_0_8px_#00FFFF]" 
            animate={isPlaying ? { width: ['0%', '100%'] } : {}}
            transition={isPlaying ? { duration: 180, repeat: Infinity, ease: "linear" } : { duration: 0 }}
           />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button 
              onClick={togglePlay}
              className="p-3 neon-border border-[#FF00FF]/30 hover:bg-[#FF00FF]/10 text-[#FF00FF] transition-all"
              id="play-pause-btn"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            <button 
              onClick={skipTrack}
              className="p-3 hover:text-[#00FFFF] transition-colors text-white/50"
              id="skip-btn"
            >
              <SkipForward size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Volume2 size={14} className="text-[#00FFFF]/50" />
            <div className="w-12 h-[2px] bg-white/10 relative">
              <div className="absolute inset-0 bg-[#00FFFF] w-[60%] shadow-[0_0_5px_#00FFFF]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-[8px] font-mono text-white/20 uppercase tracking-widest mt-2 border-t border-white/5 pt-2">
        <span>AUDIO_STREAMS: OK</span>
        <span>BUFFER: 99%</span>
      </div>
    </motion.div>
  );
}

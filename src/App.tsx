/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import MusicPlayer from './components/MusicPlayer';
import { motion, AnimatePresence } from 'motion/react';

 export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#050505] p-4 lg:p-8">
      {/* Background Starfield */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="star-field">
          <div className="absolute inset-0 animate-stars-slow opacity-10">
            {[...Array(50)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-1 h-1 bg-white rounded-full bg-blend-screen" 
                style={{
                  top: `${Math.random() * 200}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random()
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 animate-stars-fast opacity-20">
            {[...Array(30)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-[2px] h-[2px] bg-[#00FFFF] rounded-full" 
                style={{
                  top: `${Math.random() * 200}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random()
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 noise opacity-20 pointer-events-none" />
      <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00FFFF]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FF00FF]/10 blur-[150px] rounded-full pointer-events-none" />

      <header className="mb-12 text-center z-10">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 
            className="text-7xl md:text-9xl font-bold glitch-text tracking-tighter leading-none mb-3" 
            data-text="NEON_VOID"
          >
            NEON_VOID
          </h1>
          <div className="flex items-center justify-center gap-6">
            <span className="h-[1px] w-20 bg-gradient-to-r from-transparent to-[#00FFFF]" />
            <span className="text-[10px] font-mono text-[#00FFFF] tracking-[0.6em] uppercase">SENTINEL_PROTOCOL_V4.2</span>
            <span className="h-[1px] w-20 bg-gradient-to-l from-transparent to-[#00FFFF]" />
          </div>
        </motion.div>
      </header>

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="start-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="z-20 text-center"
          >
            <div className="p-16 glass-panel border-[#00FFFF]/20 relative group max-w-lg">
              <div className="absolute -top-10 -right-10 text-[8px] font-mono text-white/20 uppercase text-right leading-relaxed">
                HARDWARE_ACCELERATION: ENABLED<br />
                NEURAL_LINK: SYNCHRONIZED<br />
                VOID_COORDINATES: ACCESSED
              </div>

              <div className="mb-8 p-4 bg-[#FF00FF]/5 border border-[#FF00FF]/20 text-[10px] font-mono text-[#FF00FF] uppercase tracking-widest">
                WARNING: HIGH_THREAT_DETECTION // ENGAGE_AT_WILL
              </div>

              <button
                onClick={() => setStarted(true)}
                className="w-full text-4xl font-bold text-[#00FFFF] border border-[#00FFFF] px-12 py-8 hover:bg-[#00FFFF] hover:text-[#050505] transition-all duration-500 tracking-[0.3em] relative z-10 group overflow-hidden"
                id="start-game-btn"
              >
                <span className="relative z-10">INITIALIZE</span>
                <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 opacity-20 transform -skew-x-12" />
              </button>

              <div className="mt-12 grid grid-cols-2 gap-8 text-[9px] font-mono text-white/30 uppercase text-left">
                <div className="flex flex-col gap-1">
                  <span className="text-white/50 border-b border-white/10 pb-1">PILOT_ID</span>
                  <span className="text-[#00FFFF]">GUEST_SENTINEL_01</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-white/50 border-b border-white/10 pb-1">SECTOR</span>
                  <span className="text-[#FF00FF]">VOID_RING_ALPHA</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-20 w-fit flex flex-col xl:flex-row gap-8 items-start justify-center"
          >
            <div className="relative order-2 xl:order-1">
              <GameCanvas />
              <div className="screen-tear" />
              
              <div className="absolute -left-12 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-[#00FFFF]/20 to-transparent" />
              <div className="absolute -right-12 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-[#00FFFF]/20 to-transparent" />
            </div>

            <div className="flex flex-col gap-8 order-1 xl:order-2 w-full xl:w-auto">
               <MusicPlayer />
               
               <div className="glass-panel p-6 border-[#00FFFF]/20">
                  <h4 className="text-[10px] font-mono text-[#00FFFF] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00FFFF] animate-ping rounded-full" />
                    LIVE_MISSION_LOG
                  </h4>
                  <div className="space-y-3 font-mono text-[9px] uppercase leading-tight">
                    <p className="text-white/40"><span className="text-[#FF00FF]">04:16:01:</span> SENTINEL_UPLINK_ESTABLISHED</p>
                    <p className="text-white/40"><span className="text-[#FF00FF]">04:16:05:</span> SCANNING_THREAT_HORIZON</p>
                    <p className="text-white/40"><span className="text-[#FF00FF]">04:16:08:</span> ENERGY_CORE_AT_100%</p>
                    <p className="text-[#00FFFF] animate-pulse">WAITING_FOR_ENGAGEMENT...</p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-6 left-6 z-10 flex items-center gap-4 opacity-30 hover:opacity-100 transition-opacity">
        <div className="w-10 h-[1px] bg-white/20" />
        <div className="text-[9px] font-mono text-white/50 uppercase tracking-widest">
          TERMINAL_0.4.2 // SYS_RECON
        </div>
      </footer>
    </main>
  );
}

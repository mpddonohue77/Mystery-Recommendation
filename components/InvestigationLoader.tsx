
import React, { useState, useEffect } from 'react';
import { LOADER_DATA, LoaderEntry } from '../loaderData';

const InvestigationLoader: React.FC = () => {
  const [entry, setEntry] = useState<LoaderEntry>(LOADER_DATA[0]);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Initial fade in after a short delay to avoid abruptness
    const startTimeout = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * LOADER_DATA.length);
      setEntry(LOADER_DATA[randomIndex]);
      setFade(true);
    }, 100);

    // Cycle every 8 seconds (stay visible for ~7.4s, 0.6s transition)
    const interval = setInterval(() => {
      setFade(false); // Fade out
      setTimeout(() => {
        const nextIndex = Math.floor(Math.random() * LOADER_DATA.length);
        setEntry(LOADER_DATA[nextIndex]);
        setFade(true); // Fade back in
      }, 600); // Wait for fade out to complete
    }, 8000);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="col-span-full py-24 px-6 text-center bg-zinc-950/40 rounded-3xl border border-zinc-900 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden transition-opacity duration-1000 opacity-100">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-900 to-transparent animate-[shimmer_4s_infinite]"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent animate-[shimmer_5s_infinite_reverse]"></div>
      </div>

      <div className={`transition-all duration-1000 transform flex flex-col items-center ${fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'} max-w-2xl px-4`}>
        {/* Loading Indicator */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-red-900/30 border-t-red-600 rounded-full animate-spin"></div>
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-red-900/80 animate-pulse">Scanning Shelves</span>
        </div>

        <div className="space-y-6">
          <h5 className="serif text-3xl md:text-4xl text-zinc-100 italic font-medium leading-relaxed drop-shadow-sm">
            "{entry.line}"
          </h5>
          <div className="pt-4">
            <p className="text-red-900/50 text-[12px] font-bold uppercase tracking-[0.3em]">— {entry.source}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestigationLoader;

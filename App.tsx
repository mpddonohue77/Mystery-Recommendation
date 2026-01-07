
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getRecommendations } from './services/gemini';
import { Book, UserBook, BookStatus, QuickPick, SearchMode } from './types';
import { QUICK_PICKS } from './constants';
import BookCard from './components/BookCard';
import InvestigationLoader from './components/InvestigationLoader';
import SavedListDrawer from './components/SavedListDrawer';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<SearchMode>('standard');
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [history, setHistory] = useState<UserBook[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [displayedPicks, setDisplayedPicks] = useState<QuickPick[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Detect if embedded via URL parameter
  const isEmbedded = useMemo(() => {
    return new URLSearchParams(window.location.search).get('embed') === 'true';
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('theTBRHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
    
    const shuffled = [...QUICK_PICKS].sort(() => 0.5 - Math.random());
    setDisplayedPicks(shuffled.slice(0, 6));
  }, []);

  useEffect(() => {
    localStorage.setItem('theTBRHistory', JSON.stringify(history));
  }, [history]);

  const savedBooks = history.filter(h => h.status === 'saved');

  const handleSearch = useCallback(async (searchQuery: string, searchMode: SearchMode = mode) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setRecommendations([]); 
    
    try {
      const excluded = history.map(h => h.title);
      const results = await getRecommendations(searchQuery, excluded, searchMode);
      
      if (results.length === 0) {
        setError("The trail went cold. I couldn't find any relevant mysteries. Try a different author or theme.");
      } else {
        setRecommendations(results);
      }
    } catch (err) {
      setError("The investigation hit a dead end. Please check your connection and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [history, mode]);

  const updateBookStatus = (id: string, status: BookStatus) => {
    const bookInHistory = history.find(h => h.id === id);
    
    if (status === 'recommended') {
      setHistory(prev => prev.filter(h => h.id !== id));
      return;
    }

    const bookData = recommendations.find(r => r.id === id) || (bookInHistory as Book);
    if (!bookData) return;

    const userBook: UserBook = {
      ...bookData,
      status,
      timestamp: Date.now()
    };

    setHistory(prev => {
      const filtered = prev.filter(h => h.id !== id);
      return [userBook, ...filtered];
    });
    
    if (status === 'saved') {
      setIsDrawerOpen(true);
    }
  };

  const removeSavedBook = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleExport = () => {
    const dateStr = new Date().toLocaleDateString();
    const savedList = history
      .filter(h => h.status === 'saved')
      .map(h => `- ${h.title} by ${h.author} (ISBN: ${h.isbn})`)
      .join('\n');

    const content = `The TBR List - ${dateStr}\n\n${savedList || 'No books selected.'}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `the-tbr-list-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const savedCount = savedBooks.length;
    const shareText = `Check out my mystery thriller TBR list! I've filed ${savedCount} new leads on theTBR. Join the investigation:`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My theTBR Investigation',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      alert("Investigation summary copied to clipboard!");
    }
  };

  return (
    <div className={`min-h-screen bg-black flex flex-col items-center text-zinc-100 ${isEmbedded ? 'p-0' : 'p-4 md:p-8'}`}>
      {loading && (
        <div className="fixed top-0 left-0 w-full z-[100] h-1 flex justify-center">
          <div className="w-full h-full bg-red-900/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-600 w-1/3 animate-[shimmer_1.5s_infinite] shadow-[0_0_10px_#dc2626]"></div>
          </div>
        </div>
      )}

      {savedBooks.length > 0 && !isDrawerOpen && (
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-8 right-8 z-[140] bg-red-900 hover:bg-red-800 text-white w-16 h-16 rounded-full shadow-2xl shadow-red-900/40 flex items-center justify-center transition-all group animate-bounce-slow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          <span className="absolute -top-1 -right-1 bg-white text-red-900 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-red-900">
            {savedBooks.length}
          </span>
        </button>
      )}

      <SavedListDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        savedBooks={savedBooks}
        onRemove={removeSavedBook}
        onExport={handleExport}
        onClear={() => {
          if (confirm("Burn all saved leads in this folder?")) {
            setHistory(prev => prev.filter(h => h.status !== 'saved'));
          }
        }}
      />

      {!isEmbedded && (
        <header className="w-full max-w-6xl mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="serif text-6xl tracking-tighter italic flex items-baseline justify-center md:justify-start">
              <span className="logo-mark text-zinc-500 lowercase">the</span>
              <span className="logo-tbr gradient-text uppercase">TBR</span>
            </h1>
            <p className="text-zinc-500 font-medium tracking-widest text-xs uppercase mt-2">One Book Is All It Takes</p>
          </div>
        </header>
      )}

      <main className={`w-full max-w-6xl space-y-12 ${isEmbedded ? 'mt-4' : ''}`}>
        <section className={`bg-zinc-900/40 rounded-2xl border border-zinc-800/60 backdrop-blur-sm ${isEmbedded ? 'p-6' : 'p-8'}`}>
          <div className="max-w-3xl mx-auto text-center">
            {!isEmbedded && <h2 className="serif text-3xl text-zinc-100 mb-8 font-semibold tracking-tight">Find your next great mystery</h2>}
            
            <div className="flex justify-center mb-8">
              <div className="bg-black/40 p-1 rounded-xl border border-zinc-800 flex">
                <button 
                  onClick={() => setMode('standard')}
                  className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'standard' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                  The Essentials
                </button>
                <button 
                  onClick={() => setMode('deep-cuts')}
                  className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'deep-cuts' ? 'bg-red-900 text-white shadow-lg shadow-red-900/20' : 'text-zinc-600 hover:text-red-900/60'}`}
                >
                  Deep Cuts
                </button>
              </div>
            </div>

            <div className="relative mb-8">
              <input 
                type="text"
                placeholder={mode === 'deep-cuts' ? "Seeking the obscure..." : "Search author, book, or sub-genre..."}
                className={`w-full bg-zinc-950 border-2 rounded-xl px-6 py-4 text-zinc-100 focus:outline-none transition-all shadow-inner placeholder:text-zinc-700 text-lg ${mode === 'deep-cuts' ? 'border-red-900/30 focus:border-red-600' : 'border-zinc-800 focus:border-red-900'}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              />
              <button 
                onClick={() => handleSearch(query)}
                disabled={loading}
                className="absolute right-3 top-3 bottom-3 bg-red-900 hover:bg-red-800 disabled:bg-zinc-800 text-white px-8 rounded-lg font-bold transition-all flex items-center gap-2 uppercase tracking-widest text-[11px]"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>Search</>
                )}
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {displayedPicks.map((pick) => (
                <button
                  key={pick.label}
                  onClick={() => {
                    setQuery(pick.query);
                    handleSearch(pick.query);
                  }}
                  className="px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-red-900 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
                >
                  {pick.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div className="bg-red-900/10 border border-red-900/30 text-red-500 p-6 rounded-xl text-center font-medium italic animate-pulse">
            {error}
          </div>
        )}

        <section className={isEmbedded ? 'px-2' : ''}>
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <h3 className="serif text-3xl text-white font-bold text-center md:text-left">
                Have you read...
              </h3>
              {mode === 'deep-cuts' && (
                <span className="bg-red-950/40 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] px-3 py-1 rounded-full border border-red-900/30">
                  Discovery Protocol Active
                </span>
              )}
            </div>
            
            {recommendations.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-end items-center gap-3">
                <button 
                  onClick={handleShare}
                  className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-zinc-800 px-4 py-2 rounded-lg bg-zinc-950"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                  Share
                </button>
                <button 
                  onClick={() => handleSearch(query)}
                  className="text-red-900 hover:text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-2 border border-red-900/20 px-4 py-2 rounded-lg bg-red-900/5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                  Get more
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {recommendations.map((book) => {
              const h = history.find(item => item.id === book.id);
              return (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  status={h ? h.status : "recommended"} 
                  onUpdateStatus={updateBookStatus} 
                />
              );
            })}
            
            {!loading && recommendations.length === 0 && !error && (
               <div className="col-span-full py-32 text-center border border-zinc-900/50 rounded-3xl bg-zinc-950/30">
                  <div className="inline-block p-10 rounded-full bg-black border border-zinc-800 mb-8 shadow-2xl relative">
                    <svg className={`w-16 h-16 ${mode === 'deep-cuts' ? 'text-red-900/40' : 'text-zinc-800'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <h4 className="text-zinc-600 font-bold uppercase tracking-[0.3em] text-xs">
                    {mode === 'deep-cuts' ? "Digging into the Archives" : "Search for a Lead"}
                  </h4>
                  <p className="text-zinc-800 text-xs mt-4 italic max-w-sm mx-auto leading-relaxed">
                    {mode === 'deep-cuts' ? "We're filtering out the bestsellers to find the true rarities." : "Specify a title, author, or sub-genre above to reveal your next case."}
                  </p>
               </div>
            )}

            {loading && recommendations.length === 0 && (
              <InvestigationLoader />
            )}
          </div>
        </section>

      </main>

      {!isEmbedded && (
        <footer className="w-full max-w-6xl mt-32 py-16 border-t border-zinc-900 text-center space-y-4">
          <p className="text-zinc-800 text-[11px] uppercase tracking-[0.5em] font-black">
            theTBR Intelligence &bull; AI Generated &bull; {new Date().getFullYear()}
          </p>
          <p className="text-zinc-700 text-[10px] italic max-w-lg mx-auto leading-relaxed">
            As an Amazon Associate, some links here earn me a small commission at no extra cost to you.
          </p>
        </footer>
      )}

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
};

export default App;

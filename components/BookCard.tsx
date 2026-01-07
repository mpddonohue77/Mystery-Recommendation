
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Book, BookStatus } from '../types';

interface BookCardProps {
  book: Book;
  onUpdateStatus: (id: string, status: BookStatus) => void;
  status: BookStatus;
}

const BookCard: React.FC<BookCardProps> = ({ book, onUpdateStatus, status }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const [titleFontSize, setTitleFontSize] = useState<string>('1.5rem');
  
  const reasonRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isSaved = status === 'saved';
  const isRead = status === 'read';
  
  const searchQuery = encodeURIComponent(`${book.title} ${book.author}`);

  useLayoutEffect(() => {
    if (titleRef.current) {
      const el = titleRef.current;
      let size = 1.5; 
      el.style.fontSize = `${size}rem`;
      el.style.whiteSpace = 'nowrap';
      
      while (el.scrollWidth > el.clientWidth && size > 0.9) {
        size -= 0.05;
        el.style.fontSize = `${size}rem`;
      }
      
      setTitleFontSize(`${size}rem`);
    }
  }, [book.title]);

  useEffect(() => {
    const checkOverflow = () => {
      if (reasonRef.current) {
        const element = reasonRef.current;
        setNeedsExpansion(element.scrollHeight > element.clientHeight);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [book.reason]);

  return (
    <div className={`bg-zinc-900 border rounded-lg overflow-hidden flex flex-col transition-all duration-500 group h-full relative
      ${isRead ? 'grayscale opacity-40 border-zinc-800' : isSaved ? 'shadow-[0_0_30px_rgba(153,27,27,0.4)] border-red-900/60' : 'border-zinc-800 hover:border-red-900/40 hover:shadow-2xl hover:shadow-red-900/10'}
    `}>
      {/* Absolute Badges: Year & Status (Added/Removed) */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-30 pointer-events-none">
        {isRead && (
          <span className="text-green-500 text-[7px] font-black uppercase tracking-widest bg-zinc-950/90 px-1.5 py-0.5 rounded border border-green-900/40 backdrop-blur-sm">
            REMOVED
          </span>
        )}
        {isSaved && (
          <span className="text-red-500 text-[7px] font-black uppercase tracking-widest bg-zinc-950/90 px-1.5 py-0.5 rounded border border-red-900/40 backdrop-blur-sm">
            ADDED
          </span>
        )}
        <span className="text-zinc-600 text-[7px] font-black uppercase tracking-widest border border-zinc-800 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
          {book.publishedYear}
        </span>
      </div>

      {/* Header: Title (Auto-scaling) & Author */}
      <div className="bg-black/60 px-5 py-6 border-b border-zinc-800 overflow-hidden pr-20">
        <h3 
          ref={titleRef}
          className="serif font-black text-white leading-tight group-hover:text-red-400 transition-colors overflow-hidden"
          style={{ fontSize: titleFontSize }}
        >
          {book.title}
        </h3>
        <p className="text-red-600 text-[10px] uppercase tracking-[0.2em] font-black truncate mt-1">
          by {book.author}
        </p>
      </div>

      <div className="p-6 flex-grow flex flex-col gap-8">
        {/* Plot Description Section */}
        <div className="relative">
          <span className="absolute -left-2 -top-2 text-4xl text-zinc-800 serif opacity-20 pointer-events-none">"</span>
          <p className="text-zinc-400 text-sm leading-relaxed relative z-10 italic">
            {book.description}
          </p>
        </div>
        
        {/* Why this book? Section */}
        <div className="bg-black/30 p-5 rounded-md border-l-2 border-red-900/40 relative">
          <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-900 rounded-full"></span>
            Why this book?
          </p>
          <p 
            ref={reasonRef}
            className={`text-zinc-200 text-[13px] leading-relaxed transition-all duration-300 ${!isExpanded ? 'line-clamp-5' : ''}`}
          >
            {book.reason}
          </p>
          
          {(needsExpansion || isExpanded) && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 text-[9px] text-red-900 hover:text-red-500 uppercase tracking-widest font-black flex items-center gap-1 transition-colors"
            >
              {isExpanded ? 'Close' : 'Read more'}
              <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          )}
        </div>

        {/* Acquisition & Metadata */}
        <div className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center justify-between">
          <div className="flex flex-col">
             <span className="text-[8px] uppercase tracking-widest text-zinc-600 font-black mb-1">ISBN-13</span>
             <span className="text-[10px] text-zinc-500 font-mono">{book.isbn}</span>
          </div>
          <div className="flex gap-4">
            <a 
              href={`https://bookshop.org/search?keywords=${searchQuery}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[9px] text-zinc-400 hover:text-red-500 font-black uppercase tracking-widest transition-colors hover:underline underline-offset-4"
            >
              Bookshop
            </a>
            <a 
              href={`https://www.amazon.com/s?k=${searchQuery}&tag=mikeswindow-20`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[9px] text-zinc-400 hover:text-red-500 font-black uppercase tracking-widest transition-colors hover:underline underline-offset-4"
            >
              Amazon
            </a>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex gap-2">
        <button 
          onClick={() => onUpdateStatus(book.id, isSaved ? 'recommended' : 'saved')}
          className={`flex-[2] py-2.5 px-3 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${isSaved ? 'bg-zinc-800 text-red-500 border-red-900/40' : 'bg-red-900 hover:bg-red-800 text-white border-red-800 shadow-lg shadow-red-900/10'}`}
        >
          {isSaved ? 'Remove' : 'Add to List'}
        </button>

        <button 
          onClick={() => onUpdateStatus(book.id, isRead ? 'recommended' : 'read')}
          className={`flex-1 py-2.5 px-3 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${isRead ? 'bg-zinc-800 text-green-500 border-green-900/40' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 border-zinc-800'}`}
        >
          {isRead ? 'Undo' : 'Mark Read'}
        </button>
      </div>
    </div>
  );
};

export default BookCard;

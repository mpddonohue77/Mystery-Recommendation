
import React from 'react';
import { UserBook } from '../types';

interface SavedListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedBooks: UserBook[];
  onRemove: (id: string) => void;
  onExport: () => void;
  onClear: () => void;
}

const SavedListDrawer: React.FC<SavedListDrawerProps> = ({ 
  isOpen, 
  onClose, 
  savedBooks, 
  onRemove, 
  onExport, 
  onClear 
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-[200] transform transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-black/40">
          <div>
            <h2 className="serif text-2xl font-black text-white uppercase tracking-tighter italic">The TBR List</h2>
            <p className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-black mt-1">Selected books</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {savedBooks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale p-12">
               <svg className="w-16 h-16 text-zinc-800 mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              <p className="serif text-lg italic text-zinc-400">Your list is currently empty.</p>
              <p className="text-[10px] uppercase tracking-widest mt-2">Add leads from the search results.</p>
            </div>
          ) : (
            savedBooks.map((book) => (
              <div key={book.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex gap-4 group">
                <div className="flex-grow min-w-0">
                  <h4 className="text-white font-bold text-sm truncate">{book.title}</h4>
                  <p className="text-red-600 text-[10px] font-black uppercase tracking-widest mb-2">{book.author}</p>
                  <p className="text-zinc-500 text-[11px] line-clamp-2 italic leading-relaxed">{book.description}</p>
                </div>
                <button 
                  onClick={() => onRemove(book.id)}
                  className="shrink-0 p-2 text-zinc-700 hover:text-red-500 transition-colors self-start"
                  title="Remove from list"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {savedBooks.length > 0 && (
          <div className="p-6 border-t border-zinc-900 bg-black/60 space-y-3">
            <button 
              onClick={onExport}
              className="w-full bg-red-900 hover:bg-red-800 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Download list
            </button>
            <button 
              onClick={onClear}
              className="w-full text-zinc-600 hover:text-zinc-400 py-2 text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              Clear all inputs
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SavedListDrawer;

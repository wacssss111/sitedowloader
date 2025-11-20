import React, { useState } from 'react';
import { SoftwareItem, ThemeMode, Category } from '../types';

interface Props {
  item: SoftwareItem;
  category?: Category;
  onDownload: (item: SoftwareItem) => void;
  theme: ThemeMode;
}

export const SoftwareCard: React.FC<Props> = ({ item, category, onDownload, theme }) => {
  const [copied, setCopied] = useState(false);
  
  // Theme Logic
  const cardBg = theme === 'light' ? 'bg-white border-slate-200 hover:border-brand-red/50 shadow-sm hover:shadow-xl' 
    : theme === 'black' ? 'bg-neutral-900 border-neutral-800 hover:border-brand-red shadow-lg hover:shadow-brand-red/20' 
    : 'bg-slate-800 border-slate-700 hover:border-brand-red/50 shadow-lg hover:shadow-brand-red/10';
  
  const titleColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const descColor = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const metaBg = theme === 'light' ? 'bg-slate-50 border-t border-slate-100' : theme === 'black' ? 'bg-black border-t border-neutral-800' : 'bg-slate-900/50 border-t border-slate-700';
  const iconBg = theme === 'light' ? 'bg-slate-100' : theme === 'black' ? 'bg-neutral-800' : 'bg-slate-700';

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.secureLinkUrl) {
      navigator.clipboard.writeText(item.secureLinkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`${cardBg} rounded-xl border overflow-hidden transition-all duration-300 flex flex-col h-full group relative`}>
      {item.isSecureLink && (
        <div className="absolute top-0 right-0 bg-green-500 text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 shadow-[0_0_10px_rgba(34,197,94,0.4)]">
            <i className="fa-solid fa-shield-halved mr-1"></i> TUNNEL ACTIVE
        </div>
      )}

      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 ${iconBg} rounded-lg group-hover:bg-brand-red/10 transition-colors`}>
            <i className={`fa-solid fa-${category?.icon || 'cube'} text-2xl text-brand-red`}></i>
          </div>
          <div className="flex gap-2 flex-wrap justify-end mt-4 sm:mt-0">
             {item.isTelegramImport && (
               <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-md border border-blue-500/20">
                 <i className="fa-brands fa-telegram mr-1"></i> TG
               </span>
             )}
             <span className={`px-2 py-1 ${theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-slate-300'} text-xs font-mono rounded-md`}>
               v{item.version}
             </span>
          </div>
        </div>
        
        <div className="mb-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-brand-red">{category?.name || 'Uncategorized'}</span>
        </div>
        <h3 className={`text-xl font-bold ${titleColor} mb-2 truncate font-sans`}>{item.title}</h3>
        <p className={`${descColor} text-sm mb-4 line-clamp-2 leading-relaxed`}>{item.description}</p>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {item.tags.map(tag => (
            <span key={tag} className={`text-xs px-2 py-1 rounded ${theme === 'light' ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-500'}`}>#{tag}</span>
          ))}
        </div>
      </div>

      <div className={`${metaBg} p-4 flex justify-between items-center mt-auto`}>
        <div className="text-xs text-slate-500 font-mono">
          <i className="fa-solid fa-download mr-1"></i> {item.downloads.toLocaleString()}
          <span className="mx-2">|</span>
          {item.size}
        </div>
        
        <div className="flex gap-2">
          {item.isSecureLink && (
            <button
              onClick={handleShare}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all shadow-lg ${copied ? 'bg-green-500 text-black' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
              title="Copy Share Link"
            >
              <i className={`fa-solid ${copied ? 'fa-check' : 'fa-share-nodes'}`}></i>
            </button>
          )}
          
          <button 
            onClick={() => onDownload(item)}
            className={`text-sm px-4 py-2 rounded-lg transition-all font-bold shadow-lg flex items-center group-hover:scale-105 ${
                item.isSecureLink 
                  ? 'bg-green-600 hover:bg-green-500 text-black shadow-green-500/20' 
                  : 'bg-brand-red hover:bg-brand-darkRed text-white shadow-brand-red/20'
            }`}
          >
            {item.isSecureLink ? (
                <>Secure DL <i className="fa-solid fa-lock ml-2"></i></>
            ) : (
                <>Download <i className="fa-solid fa-arrow-down ml-2"></i></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
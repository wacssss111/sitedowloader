import React from 'react';
import { ViewState, ThemeMode } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isAdmin: boolean;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  onOpenSuggestion?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, isAdmin, theme, setTheme, onOpenSuggestion }) => {
  
  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('black');
    else setTheme('dark');
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return 'fa-moon';
    if (theme === 'light') return 'fa-sun';
    return 'fa-ghost'; // Black mode
  };

  // Dynamic styles based on theme
  const navBg = theme === 'light' ? 'bg-white/90 border-slate-200' : theme === 'black' ? 'bg-black border-red-900/30' : 'bg-slate-900/90 border-slate-800';
  const textColor = theme === 'light' ? 'text-slate-800' : 'text-white';
  const logoColor = theme === 'light' ? 'text-slate-900' : 'text-white';

  return (
    <nav className={`${navBg} backdrop-blur-md border-b sticky top-0 z-50 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center cursor-pointer group" onClick={() => setView('home')}>
            <div className="flex-shrink-0 transition-transform group-hover:rotate-12">
              <i className="fa-solid fa-dragon text-brand-red text-3xl"></i>
            </div>
            <div className="ml-3">
              <div className={`text-xl font-black tracking-tighter ${logoColor} uppercase`}>
                FEITOV<span className="text-brand-red mx-0.5">+</span>MOPSVK
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => setView('home')}
              className={`px-3 py-2 rounded-md text-sm font-bold transition-all ${
                currentView === 'home' 
                  ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' 
                  : `${theme === 'light' ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/5'}`
              }`}
            >
              Library
            </button>
            
            {onOpenSuggestion && (
               <button
                onClick={onOpenSuggestion}
                className={`hidden md:block px-3 py-2 rounded-md text-sm font-bold transition-all ${theme === 'light' ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
               >
                <i className="fa-solid fa-lightbulb mr-1"></i> Suggest
               </button>
            )}

            <button
              onClick={() => setView('admin')}
              className={`px-3 py-2 rounded-md text-sm font-bold transition-all ${
                currentView === 'admin' 
                  ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' 
                  : `${theme === 'light' ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/5'}`
              }`}
            >
              {isAdmin ? 'Panel' : 'Login'}
            </button>

            <div className="h-6 w-px bg-slate-700/50 mx-2"></div>

            <button
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                theme === 'light' ? 'bg-slate-100 text-yellow-500 hover:bg-slate-200' : 
                theme === 'black' ? 'bg-red-900/20 text-brand-red border border-brand-red/20' : 
                'bg-slate-800 text-blue-400 hover:bg-slate-700'
              }`}
              title="Switch Theme"
            >
              <i className={`fa-solid ${getThemeIcon()}`}></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { SoftwareCard } from './components/SoftwareCard';
import { SoftwareItem, ViewState, ThemeMode, Category } from './types';
import { getSoftwareList, verifyAdminKey, getCategories } from './services/storageService';

const SUGGESTION_BOT_TOKEN = '8014301606:AAG2txyOddns7JWOe-K3-4sB71FKpBUAVTA';
const MAIN_ADMIN_ID = '7808015273'; 

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<SoftwareItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  
  // Suggestion State
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [suggestionData, setSuggestionData] = useState({ username: '', proposal: '', utility: '' });
  const [suggestSending, setSuggestSending] = useState(false);

  useEffect(() => {
    refreshData();
    const session = sessionStorage.getItem('admin_session');
    if (session === 'active') setIsAdmin(true);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
        const [fetchedItems, fetchedCats] = await Promise.all([
            getSoftwareList(),
            getCategories()
        ]);
        setItems(fetchedItems);
        setCategories(fetchedCats);
    } catch (e) {
        console.error("Failed to load data", e);
    } finally {
        setLoading(false);
    }
  };

  const handleAdminLogin = (key: string) => {
    const isValid = verifyAdminKey(key);
    if (isValid) {
      setIsAdmin(true);
      sessionStorage.setItem('admin_session', 'active');
      setView('admin');
    }
    return isValid;
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('admin_session');
    setView('home');
  };

  // Filter Logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (item: SoftwareItem) => {
    const url = item.isSecureLink ? item.secureLinkUrl : item.downloadUrl;
    alert(`Downloading ${item.title} from ${url || 'local source'}...`);
  };

  const handleSendSuggestion = async (e: React.FormEvent) => {
      e.preventDefault();
      setSuggestSending(true);
      
      try {
          const message = `💡 *New Suggestion*\n\n👤 *User:* @${suggestionData.username.replace('@', '')}\n📝 *Proposal:* ${suggestionData.proposal}\n🚀 *Utility:* ${suggestionData.utility}`;
          
          await fetch(`https://api.telegram.org/bot${SUGGESTION_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  chat_id: MAIN_ADMIN_ID,
                  text: message,
                  parse_mode: 'Markdown'
              })
          });
          
          alert('Suggestion sent successfully!');
          setSuggestionData({ username: '', proposal: '', utility: '' });
          setIsSuggestionOpen(false);
      } catch (error) {
          console.error(error);
          alert('Failed to send suggestion. Please try again later.');
      } finally {
          setSuggestSending(false);
      }
  };

  // Theme Styles Wrapper
  const appBg = theme === 'light' ? 'bg-slate-50' : theme === 'black' ? 'bg-black' : 'bg-[#0f172a]';
  const textColor = theme === 'light' ? 'text-slate-800' : 'text-slate-200';
  const headingColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : theme === 'black' ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-800 border-slate-700';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-black/20 border-white/10 text-white';

  return (
    <div className={`min-h-screen flex flex-col ${appBg} ${textColor} font-sans transition-colors duration-500`}>
      <Navbar 
        currentView={view} 
        setView={setView} 
        isAdmin={isAdmin} 
        theme={theme}
        setTheme={setTheme}
        onOpenSuggestion={() => setIsSuggestionOpen(true)}
      />

      <main className="flex-grow">
        
        {view === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Header */}
            <div className="text-center mb-12 mt-4">
              <h1 className={`text-5xl md:text-7xl font-black ${headingColor} mb-4 tracking-tighter uppercase`}>
                feitov<span className="text-brand-red">+</span>mopsvk
              </h1>
              <p className={`max-w-2xl mx-auto text-lg font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                // Владелец @feitov // Верифицирован и написан сайт @mopsvk //
              </p>
              
              {/* Search */}
              <div className="max-w-xl mx-auto relative group mt-8">
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-brand-red to-red-900 rounded-lg blur opacity-20 group-hover:opacity-60 transition duration-200`}></div>
                <div className="relative">
                   <input 
                    type="text"
                    placeholder="SEARCH DATABASE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${theme === 'light' ? 'bg-white text-slate-900 border-slate-200' : theme === 'black' ? 'bg-neutral-900 text-white border-neutral-800' : 'bg-slate-900 text-white border-slate-700'} border rounded-lg py-4 pl-6 pr-12 focus:outline-none focus:border-brand-red shadow-xl placeholder-slate-500 text-lg font-mono transition-colors`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-red">
                    <i className="fa-solid fa-search"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Tab */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                <button 
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full text-sm font-bold uppercase transition-all ${selectedCategory === 'all' ? 'bg-brand-red text-white' : `${theme === 'light' ? 'bg-slate-200 text-slate-600' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}`}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-full text-sm font-bold uppercase transition-all flex items-center gap-2 ${selectedCategory === cat.id ? 'bg-brand-red text-white' : `${theme === 'light' ? 'bg-slate-200 text-slate-600' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}`}
                    >
                        <i className={`fa-solid fa-${cat.icon}`}></i> {cat.name}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <i className="fa-solid fa-circle-notch fa-spin text-4xl text-brand-red"></i>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                    <SoftwareCard 
                        key={item.id} 
                        item={item} 
                        category={categories.find(c => c.id === item.categoryId)}
                        onDownload={handleDownload} 
                        theme={theme}
                    />
                ))}
                </div>
            )}
            
            {!loading && filteredItems.length === 0 && (
              <div className="text-center py-12 opacity-50">
                 <i className="fa-solid fa-terminal text-6xl text-slate-500 mb-4"></i>
                 <p className="text-slate-500 font-mono">NO_RESULTS_FOUND</p>
              </div>
            )}
          </div>
        )}

        {view === 'admin' && (
          <>
            {!isAdmin ? (
              <AdminLogin onLogin={handleAdminLogin} />
            ) : (
              <AdminDashboard 
                items={items} 
                categories={categories} 
                refreshData={refreshData} 
                onLogout={handleLogout} 
                theme={theme}
              />
            )}
          </>
        )}

      </main>

      {/* Suggestion Modal */}
      {isSuggestionOpen && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className={`${cardBg} p-6 rounded-xl max-w-md w-full border border-white/10 shadow-2xl relative`}>
                <button onClick={() => setIsSuggestionOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                    <i className="fa-solid fa-times"></i>
                </button>
                
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fa-solid fa-lightbulb text-xl"></i>
                    </div>
                    <h3 className={`text-xl font-bold ${headingColor}`}>Submit Feature Request</h3>
                    <p className="text-slate-500 text-xs">Help improve Feitov+Mopsvk</p>
                </div>

                <form onSubmit={handleSendSuggestion} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Telegram Username</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-500">@</span>
                            <input 
                                required
                                value={suggestionData.username}
                                onChange={e => setSuggestionData({...suggestionData, username: e.target.value})}
                                className={`w-full ${inputBg} pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500`}
                                placeholder="username"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Your Proposal</label>
                        <textarea 
                            required
                            value={suggestionData.proposal}
                            onChange={e => setSuggestionData({...suggestionData, proposal: e.target.value})}
                            className={`w-full ${inputBg} p-3 rounded-lg focus:outline-none focus:border-yellow-500 h-20`}
                            placeholder="What should we add?"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Why is it useful?</label>
                        <textarea 
                            required
                            value={suggestionData.utility}
                            onChange={e => setSuggestionData({...suggestionData, utility: e.target.value})}
                            className={`w-full ${inputBg} p-3 rounded-lg focus:outline-none focus:border-yellow-500 h-20`}
                            placeholder="Explain the benefit..."
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={suggestSending}
                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {suggestSending ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Send Suggestion'}
                    </button>
                </form>
            </div>
         </div>
      )}

      <footer className={`${theme === 'light' ? 'bg-slate-100 border-slate-200' : theme === 'black' ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-950 border-slate-800'} border-t py-8 mt-12 transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm font-mono">
            FEITOV+MOPSVK // <a href="https://t.me/bezdarnostoff" target="_blank" rel="noopener noreferrer" className="hover:text-brand-red transition-colors underline decoration-brand-red/50">https://t.me/bezdarnostoff</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

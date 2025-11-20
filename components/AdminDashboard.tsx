
import React, { useState, useEffect, useRef } from 'react';
import { SoftwareItem, Category, ThemeMode, TelegramConfig } from '../types';
import { addSoftware, deleteSoftware, updateSoftware, addCategory, deleteCategory, getTelegramConfig } from '../services/storageService';
import { isSupabaseConfigured } from '../services/supabase';

interface AdminDashboardProps {
  items: SoftwareItem[];
  categories: Category[];
  refreshData: () => void;
  onLogout: () => void;
  theme: ThemeMode;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ items, categories, refreshData, onLogout, theme }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isCategoryMode, setIsCategoryMode] = useState(false);
  const [isBotMode, setIsBotMode] = useState(false);
  const [isTgModalOpen, setIsTgModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [tgConfig, setTgConfig] = useState<TelegramConfig | null>(null);

  // Ngrok Tunnel State
  const [tunnelModalOpen, setTunnelModalOpen] = useState(false);
  const [tunnelItem, setTunnelItem] = useState<SoftwareItem | null>(null);
  const [tunnelLogs, setTunnelLogs] = useState<string[]>([]);
  const [tunnelStatus, setTunnelStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTgConfig(getTelegramConfig());
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [tunnelLogs]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    version: '1.0.0',
    categoryId: categories[0]?.id || '',
    tags: '',
    size: '',
    fileName: ''
  });

  const [catFormData, setCatFormData] = useState({
    name: '',
    icon: 'folder'
  });

  // Styles
  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : theme === 'black' ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-800 border-slate-700';
  const textColor = theme === 'light' ? 'text-slate-800' : 'text-white';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-black/20 border-white/10 text-white';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Auto-fill details from file
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        setFormData(prev => ({
            ...prev,
            title: file.name,
            fileName: file.name,
            size: `${sizeMB} MB`,
            version: '1.0.0' // Default
        }));
    }
  };

  const handleDirectUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    const newItem: SoftwareItem = {
      id: Date.now().toString(),
      title: formData.title,
      fileName: formData.fileName || formData.title,
      description: formData.description,
      version: formData.version,
      categoryId: formData.categoryId,
      size: formData.size || `${Math.floor(Math.random() * 500) + 10} MB`,
      downloadUrl: '#',
      downloads: 0,
      createdAt: Date.now(),
      isTelegramImport: false,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
    };

    await addSoftware(newItem);
    refreshData();
    setFormData({ ...formData, title: '', description: '', tags: '', size: '', fileName: '' });
    setProcessing(false);
    setIsUploading(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCat: Category = {
        id: `cat_${Date.now()}`,
        name: catFormData.name,
        icon: catFormData.icon
    };
    await addCategory(newCat);
    refreshData();
    setCatFormData({ name: '', icon: 'folder' });
  };

  const handleDeleteCategory = async (id: string) => {
      if(confirm('Delete category?')) {
          await deleteCategory(id);
          refreshData();
      }
  }

  const handleTelegramImport = async () => {
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    const mockTgItem: SoftwareItem = {
      id: Date.now().toString(),
      title: 'Telegram_Export_Crack_v2.zip',
      fileName: 'Telegram_Export_Crack_v2.zip',
      description: 'Imported directly from Private Channel #9921. Contains necessary patches.',
      version: '2.0.0-beta',
      categoryId: categories[0]?.id || 'misc',
      size: '89 MB',
      downloadUrl: '#',
      downloads: 0,
      createdAt: Date.now(),
      isTelegramImport: true,
      tags: ['Imported', 'Telegram'],
    };
    
    await addSoftware(mockTgItem);
    refreshData();
    setProcessing(false);
    setIsTgModalOpen(false);
  };

  const handleDeleteItem = async (id: string) => {
      if (confirm('Are you sure you want to delete this item?')) {
          await deleteSoftware(id);
          refreshData();
      }
  };

  // --- Ngrok Logic ---

  const openTunnelModal = (item: SoftwareItem) => {
      if (item.isSecureLink) {
          // If already active, just toggle off instantly
          updateSoftware({ ...item, isSecureLink: false, secureLinkUrl: undefined }).then(() => refreshData());
          return;
      }
      setTunnelItem(item);
      setTunnelStatus('idle');
      setTunnelLogs([]);
      setTunnelModalOpen(true);
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const startTunnel = async () => {
      if (!tunnelItem) return;
      setTunnelStatus('connecting');
      
      const addLog = (msg: string) => setTunnelLogs(prev => [...prev, msg]);
      
      addLog(`t=${new Date().toISOString()} msg="starting tunnel" item="${tunnelItem.fileName}"`);
      await new Promise(r => setTimeout(r, 600));
      addLog(`t=${new Date().toISOString()} msg="connecting to ngrok region" region=us`);
      await new Promise(r => setTimeout(r, 800));
      addLog(`t=${new Date().toISOString()} msg="authenticated" clientid=${Math.random().toString(16).substring(2)}`);
      await new Promise(r => setTimeout(r, 600));
      
      const randomHash = Math.random().toString(36).substring(2, 8);
      const url = `https://${randomHash}.ngrok-free.app/dl/${tunnelItem.id}`;
      
      addLog(`t=${new Date().toISOString()} msg="tunnel established" url=${url}`);
      addLog(`t=${new Date().toISOString()} msg="forwarding" addr=http://localhost:80`);
      
      setTunnelStatus('connected');
      
      // Save to item
      await updateSoftware({ 
          ...tunnelItem, 
          isSecureLink: true, 
          secureLinkUrl: url 
      });
      refreshData();
      
      // Close modal after brief success view
      setTimeout(() => {
          setTunnelModalOpen(false);
      }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className={`text-3xl font-black uppercase ${textColor}`}>
            Admin <span className="text-brand-red">Control</span>
            </h1>
            <p className="text-slate-500 text-sm">Manage softs, databases, and categories.</p>
        </div>
        <div className="flex flex-wrap gap-3">
             <button 
              onClick={() => setIsBotMode(!isBotMode)}
              className={`px-4 py-2 rounded-lg flex items-center transition-colors ${isBotMode ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              <i className="fa-solid fa-robot mr-2"></i> Bot
            </button>
            <button 
              onClick={() => setIsCategoryMode(!isCategoryMode)}
              className={`px-4 py-2 rounded-lg flex items-center transition-colors ${isCategoryMode ? 'bg-slate-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-white'}`}
            >
              <i className="fa-solid fa-tags mr-2"></i> Categories
            </button>
            <button 
              onClick={() => setIsTgModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-lg shadow-blue-500/20"
            >
              <i className="fa-brands fa-telegram mr-2"></i> TG Import
            </button>
            <button 
              onClick={() => setIsUploading(!isUploading)}
              className="bg-brand-red hover:bg-brand-darkRed text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-lg shadow-brand-red/20"
            >
              <i className={`fa-solid ${isUploading ? 'fa-times' : 'fa-upload'} mr-2`}></i>
              {isUploading ? 'Cancel' : 'Upload'}
            </button>
             <button 
              onClick={onLogout}
              className="bg-slate-700 hover:bg-red-900/80 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <i className="fa-solid fa-sign-out-alt"></i>
            </button>
        </div>
      </div>

      {/* STORAGE WARNING */}
      {!isSupabaseConfigured && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8 flex items-start gap-3">
            <i className="fa-solid fa-triangle-exclamation text-yellow-500 mt-1"></i>
            <div>
                <h3 className="text-yellow-500 font-bold text-sm uppercase">Local Storage Mode</h3>
                <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Database is not configured. Files are visible <b>only to you</b>. 
                    To sync with everyone, add your Supabase keys in <code>services/supabase.ts</code>.
                </p>
            </div>
        </div>
      )}

      {/* BOT MANAGEMENT */}
      {isBotMode && tgConfig && (
         <div className={`${cardBg} rounded-xl p-6 mb-8 border-l-4 border-blue-500 animate-fade-in relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <i className="fa-brands fa-telegram text-9xl text-blue-500"></i>
            </div>
            <h2 className={`text-xl font-bold ${textColor} mb-4 flex items-center`}>
                <i className="fa-brands fa-telegram text-blue-500 mr-3 text-2xl"></i>
                Telegram Bot Configuration
            </h2>
            <div className="grid md:grid-cols-2 gap-8 relative z-10">
                <div>
                    <div className="mb-4">
                        <label className="text-xs text-slate-500 uppercase font-bold">Bot Name</label>
                        <div className={`text-lg font-mono font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                            @{tgConfig.botName}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="text-xs text-slate-500 uppercase font-bold">API Token</label>
                        <div className="flex items-center gap-2">
                            <code className={`px-3 py-1 rounded text-sm font-mono ${theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-black/30 text-green-400'}`}>
                                {tgConfig.botToken.substring(0, 15)}...{tgConfig.botToken.substring(tgConfig.botToken.length - 5)}
                            </code>
                            <span className="text-xs text-green-500 font-bold border border-green-500/30 px-2 py-0.5 rounded-full bg-green-500/10">ACTIVE</span>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Authorized Admins (2)</label>
                    <div className="space-y-2">
                        {tgConfig.adminIds.map((id, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/10'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <i className="fa-solid fa-user-shield"></i>
                                    </div>
                                    <span className={`font-mono text-sm ${textColor}`}>{id}</span>
                                </div>
                                <span className="text-xs text-slate-500">Admin Access</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
         </div>
      )}

      {/* CATEGORY MANAGER */}
      {isCategoryMode && (
          <div className={`${cardBg} rounded-xl p-6 mb-8 border-l-4 border-brand-red animate-fade-in`}>
              <h2 className={`text-xl font-bold ${textColor} mb-4`}>Manage Categories</h2>
              <div className="flex gap-4 mb-6 items-end">
                  <div className="flex-1">
                      <label className="text-xs text-slate-500 uppercase font-bold">Name</label>
                      <input 
                        value={catFormData.name} onChange={(e) => setCatFormData({...catFormData, name: e.target.value})}
                        className={`w-full ${inputBg} rounded-lg p-2 mt-1 focus:border-brand-red focus:outline-none`}
                        placeholder="e.g. Databases"
                      />
                  </div>
                  <div className="w-32">
                      <label className="text-xs text-slate-500 uppercase font-bold">Icon (FA)</label>
                      <input 
                        value={catFormData.icon} onChange={(e) => setCatFormData({...catFormData, icon: e.target.value})}
                        className={`w-full ${inputBg} rounded-lg p-2 mt-1 focus:border-brand-red focus:outline-none`}
                        placeholder="database"
                      />
                  </div>
                  <button onClick={handleAddCategory} className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-500 h-[42px]">
                      Add
                  </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                  {categories.map(cat => (
                      <div key={cat.id} className={`flex items-center gap-2 px-3 py-1 rounded-full border ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-black/20 border-white/10'}`}>
                          <i className={`fa-solid fa-${cat.icon} text-slate-400`}></i>
                          <span className={`text-sm ${textColor}`}>{cat.name}</span>
                          <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-400 ml-1"><i className="fa-solid fa-times"></i></button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* TG IMPORT MODAL */}
      {isTgModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className={`${cardBg} p-6 rounded-xl border border-blue-500/30 max-w-md w-full shadow-2xl`}>
                <h3 className={`text-xl font-bold ${textColor} mb-4`}><i className="fa-brands fa-telegram text-blue-400 mr-2"></i> Import from Telegram</h3>
                <input 
                    type="text" 
                    placeholder="https://t.me/c/123456789/100"
                    className={`w-full ${inputBg} rounded-lg p-3 focus:border-blue-500 focus:outline-none mb-4`}
                />
                <div className="flex justify-end gap-3">
                    <button onClick={() => setIsTgModalOpen(false)} className="text-slate-400 hover:text-white">Cancel</button>
                    <button onClick={handleTelegramImport} disabled={processing} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50">
                        {processing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Fetch'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* NGROK TUNNEL MODAL */}
      {tunnelModalOpen && tunnelItem && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-black border border-green-900 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.1)] flex flex-col h-[400px]">
                {/* Terminal Header */}
                <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs font-mono text-slate-400">ngrok — {tunnelItem.fileName}</div>
                    <button onClick={() => setTunnelModalOpen(false)} className="text-slate-500 hover:text-white"><i className="fa-solid fa-times"></i></button>
                </div>
                
                {/* Terminal Body */}
                <div className="flex-grow p-4 font-mono text-xs sm:text-sm text-green-500 overflow-y-auto bg-black">
                    {tunnelLogs.map((log, i) => (
                        <div key={i} className="mb-1 whitespace-pre-wrap opacity-90">{log}</div>
                    ))}
                    <div ref={logsEndRef} />
                </div>

                {/* Terminal Footer */}
                <div className="bg-neutral-900 p-4 border-t border-neutral-800 flex justify-end">
                    {tunnelStatus === 'connected' ? (
                        <button onClick={() => setTunnelModalOpen(false)} className="bg-white text-black px-4 py-2 rounded font-bold hover:bg-slate-200 transition-colors">
                            Close & Save
                        </button>
                    ) : (
                         <button 
                            onClick={startTunnel} 
                            disabled={tunnelStatus !== 'idle'}
                            className="bg-green-600 hover:bg-green-500 text-black px-6 py-2 rounded font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {tunnelStatus === 'idle' ? 'INITIALIZE_TUNNEL' : 'ESTABLISHING_CONNECTION...'}
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* UPLOAD FORM */}
      {isUploading && (
        <div className={`${cardBg} p-6 rounded-xl mb-8 border-l-4 border-brand-red animate-scale-in`}>
          <h2 className={`text-xl font-bold ${textColor} mb-4 uppercase`}>Upload New Item</h2>
          <form onSubmit={handleDirectUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Select File (Auto-fill)</label>
                <div className={`relative border-2 border-dashed ${theme === 'light' ? 'border-slate-300 hover:border-brand-red' : 'border-slate-700 hover:border-brand-red'} rounded-lg p-6 transition-colors text-center cursor-pointer group`}>
                    <input type="file" onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <i className="fa-solid fa-file-arrow-up text-3xl text-slate-500 group-hover:text-brand-red mb-2 transition-colors"></i>
                    <p className="text-sm text-slate-500 font-mono">{formData.fileName ? formData.fileName : "Drag & Drop or Click to Browse"}</p>
                </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Software Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full ${inputBg} rounded-lg px-4 py-2 focus:outline-none focus:border-brand-red border transition-all`}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={`w-full ${inputBg} rounded-lg px-4 py-2 focus:outline-none focus:border-brand-red border transition-all`}
              >
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full ${inputBg} rounded-lg px-4 py-2 focus:outline-none focus:border-brand-red border transition-all`}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tags (comma separated)</label>
              <input
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Crack, Utility, SQL"
                className={`w-full ${inputBg} rounded-lg px-4 py-2 focus:outline-none focus:border-brand-red border transition-all`}
              />
            </div>
             <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Manual Size Override</label>
              <input
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className={`w-full ${inputBg} rounded-lg px-4 py-2 focus:outline-none focus:border-brand-red border transition-all`}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsUploading(false)}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${theme === 'light' ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:text-white'}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="bg-brand-red hover:bg-brand-darkRed text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-brand-red/20 transition-all disabled:opacity-50"
              >
                {processing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SOFTWARE LIST */}
      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className={`${cardBg} p-4 rounded-lg flex flex-col md:flex-row items-center gap-4 hover:border-slate-600 transition-all group`}>
            <div className={`w-10 h-10 rounded bg-slate-700 flex items-center justify-center flex-shrink-0`}>
                <i className={`fa-solid fa-${categories.find(c => c.id === item.categoryId)?.icon || 'file'} text-slate-400`}></i>
            </div>
            <div className="flex-grow text-center md:text-left min-w-0">
              <h3 className={`font-bold ${textColor} truncate`}>{item.title}</h3>
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-500 font-mono mt-1">
                <span>v{item.version}</span>
                <span>•</span>
                <span>{item.size}</span>
                <span>•</span>
                <span>{item.downloads} DLs</span>
                {item.isSecureLink && <span className="text-green-500">• TUNNEL ACTIVE</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
                {item.isSecureLink && (
                     <button 
                        onClick={() => copyLink(item.secureLinkUrl!)}
                        className="w-8 h-8 rounded flex items-center justify-center bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black transition-colors"
                        title="Copy Tunnel Link"
                    >
                        <i className="fa-solid fa-link"></i>
                    </button>
                )}
                <button 
                    onClick={() => openTunnelModal(item)}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all border ${item.isSecureLink ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-slate-600 text-slate-400 hover:border-white hover:text-white'}`}
                >
                    {item.isSecureLink ? 'Manage Tunnel' : 'Create Tunnel'}
                </button>
                <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="w-8 h-8 rounded flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                    <i className="fa-solid fa-trash"></i>
                </button>
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
            <div className="text-center py-12 text-slate-500 font-mono">
                REPOSITORY_EMPTY
            </div>
        )}
      </div>
    </div>
  );
};

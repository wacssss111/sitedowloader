import React, { useState } from 'react';

interface Props {
  onLogin: (key: string) => boolean;
}

export const AdminLogin: React.FC<Props> = ({ onLogin }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(key)) {
      setError(true);
      setKey('');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-red-900/30 shadow-2xl relative overflow-hidden">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black border border-red-900/50 mb-4 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <i className="fa-solid fa-user-shield text-2xl text-brand-red"></i>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Admin Panel</h2>
          <p className="text-slate-400 text-sm mt-2">Authentication required.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={key}
              onChange={(e) => { setError(false); setKey(e.target.value); }}
              className={`w-full bg-black/50 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-lg py-3 px-4 text-white focus:outline-none focus:border-brand-red transition-all text-center tracking-widest placeholder-slate-600`}
              placeholder="ENTER KEY"
            />
            {error && <p className="text-red-500 text-xs mt-2 text-center font-mono">ACCESS DENIED</p>}
          </div>
          
          <button
            type="submit"
            className="w-full bg-brand-red hover:bg-brand-darkRed text-white font-bold py-3 rounded-lg shadow-lg shadow-brand-red/20 transition-all uppercase tracking-widest"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};
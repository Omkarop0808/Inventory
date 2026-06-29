import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Building, ArrowLeft } from 'lucide-react';

export default function GuestSearch() {
  const navigate = useNavigate();
  const [propertyCode, setPropertyCode] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    let code = propertyCode.trim();
    if (code) {
      // If user pasted a full URL (e.g. http://localhost:5173/p/oms-paradise)
      if (code.includes('/')) {
        const parts = code.split('/');
        code = parts[parts.length - 1];
      }
      navigate(`/p/${code}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Ambient Glows (Light Theme) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-400/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <nav className="flex items-center px-6 py-4 md:px-12 md:py-6 relative z-10 bg-white/50 backdrop-blur-md border-b border-slate-200">
        <Button variant="ghost" className="mr-4 text-slate-600 hover:text-primary hover:bg-primary/5" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <div className="flex items-center gap-2 text-xl font-heading font-extrabold text-slate-900 tracking-tight">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 shadow-sm">
            <Building className="w-4 h-4 text-primary" />
          </div>
          Mezenga
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-10 space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
              Guest Portal
            </h1>
            <p className="text-slate-600 text-lg px-4 font-medium">
              Enter the unique property code or link provided by your homestay owner.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden group">
            {/* Subtle inner glow effect on the card */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <form onSubmit={handleSearch} className="space-y-6 relative z-10">
              <div className="space-y-3">
                <label htmlFor="code" className="text-sm font-semibold text-slate-500 uppercase tracking-wider pl-1">Property Code</label>
                <div className="relative group/input">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                  <Input 
                    id="code"
                    value={propertyCode}
                    onChange={(e) => setPropertyCode(e.target.value)}
                    placeholder="e.g. sunset-villa" 
                    className="pl-12 h-16 text-lg bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-2xl ring-offset-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
                    required
                  />
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full h-16 rounded-2xl text-lg font-bold shadow-[0_8px_30px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_40px_rgba(37,99,235,0.3)] hover:-translate-y-1 transition-all bg-primary hover:bg-primary/90 text-white">
                Search Property
              </Button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { host } from '../lib/Api';

//  restaurantId: user.restaurantId,
//         restaurantName: user.restaurantName,

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const signIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${host}/api/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      login(response.data.user, response.data.token);
      
      const role = response.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'owner' || role === 'staff') navigate('/');
      else navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid email or password');
      console.log('Login Error: ' , error.response?.data)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md">
        
        {/* --- LOGO & BRANDING --- */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white border border-sky-100 rounded-3xl shadow-xl shadow-sky-100/50 mb-6 overflow-hidden">
            <img 
              src="/image/golden-tran-logo.png" 
              alt="QR Dine Logo" 
              className="w-20 h-20 object-contain p-2" 
            />
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex justify-center items-center">
            Qr
            <span className="ml-1 bg-gradient-to-tr from-sky-400 via-sky-500 to-cyan-400 bg-clip-text text-transparent">
              Dine
            </span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            Management & Staff Portal
          </p>
        </div>

        {/* --- LOGIN CARD --- */}
        <div className="bg-white rounded-[2rem] p-10 shadow-2xl shadow-sky-100/40 border border-white">
          <form onSubmit={signIn} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Corporate Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  placeholder="name@qrdine.com"
                  className="w-full pl-12 pr-4 py-4 bg-sky-50/30 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Security Key
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-sky-50/30 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 text-red-500 bg-red-50/50 p-4 rounded-2xl border border-red-100 animate-pulse">
                <AlertCircle size={18} />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-sky-200 transition-all flex items-center justify-center gap-3 active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Enter Dashboard"
              )}
            </button>
          </form>
        </div>

        {/* --- FOOTER --- */}
        <div className="mt-10 text-center">
          <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">
            NextWave Dev <span className="mx-2">•</span> v2.0.4
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
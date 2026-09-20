import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      // Save token (assuming it's returned in response.data.accessToken)
      localStorage.setItem('accessToken', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <img alt="DeskFlow Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl4MEdDJ6pufw8Id4QNCPrcv5cBVnLPL_ozGKA-xMOPILdkszihm0_4kJWfwBxw-wnpDvMhuMoWOMcv1rFlZL9NVJmhOOAzCVAZvzlePPg5D8AbyyRz9Puh-iVKPMBd_mBfhy0HHlniQiMYF7IC7DbSXDTAHj6HV3g0pF5771V5gl2qCZn5pWGsDyyptpsi68vhWxJ7HgtvffiJxheyK7YugM5_bXWRIr_5MEZbeU5n_PVZD89Tkf_" />
            <span className="text-headline-sm font-headline-sm text-on-surface tracking-tight">DeskFlow</span>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 bg-surface">
        <div className="flex flex-col w-full items-center justify-center min-h-[calc(100vh-4rem)] px-gutter py-space-xl relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none"></div>
          
          <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-xl p-space-xl relative z-10">
            <div className="flex flex-col items-center text-center mb-space-xl">
              <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mb-space-md shadow-sm">
                <span className="material-symbols-outlined text-on-primary-container text-[32px]">support_agent</span>
              </div>
              <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight mb-space-xs">Welcome to DeskFlow</h1>
              <p className="text-body-md text-on-surface-variant">Internal IT &amp; Facilities Helpdesk</p>
            </div>
            
            <form className="flex flex-col gap-space-lg" onSubmit={handleLogin}>
              {error && <div className="text-error text-center text-sm font-medium">{error}</div>}
              <div className="flex flex-col gap-space-xs">
                <label className="text-label-md text-on-surface font-medium" htmlFor="email">Work Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                  <input 
                    className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-body-md rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
                    id="email" 
                    placeholder="alex.morgan@company.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-space-xs">
                <label className="text-label-md text-on-surface font-medium" htmlFor="password">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                  <input 
                    className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-body-md rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
                    id="password" 
                    placeholder="••••••••••••" 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" 
                    onClick={() => setShowPassword(!showPassword)} 
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-center text-body-md mt-2">
                <span className="text-on-surface-variant mr-1">Don't have an account?</span>
                <a className="text-primary font-medium hover:underline cursor-pointer" onClick={() => navigate('/register')}>Sign up</a>
              </div>
              
              <button className="w-full bg-primary hover:bg-primary/90 text-on-primary font-medium text-body-md py-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-space-sm" type="submit">
                <span>Log in</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-low py-space-xl">
        <div className="max-w-7xl mx-auto px-gutter text-center text-on-surface-variant text-body-sm">
          © 2024 DeskFlow IT &amp; Facilities. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

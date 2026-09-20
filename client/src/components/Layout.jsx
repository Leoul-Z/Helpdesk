import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setGlobalSearch(val);
    if (val.trim()) {
      navigate(`/tickets?search=${encodeURIComponent(val.trim())}`, { replace: true });
    } else if (location.pathname === '/tickets') {
      navigate('/tickets', { replace: true });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Tickets', path: '/tickets' },
  ];
  
  if (user?.role === 'EMPLOYEE') {
    navLinks.push({ name: 'New Ticket', path: '/new-ticket' });
  }

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <img alt="DeskFlow Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl4MEdDJ6pufw8Id4QNCPrcv5cBVnLPL_ozGKA-xMOPILdkszihm0_4kJWfwBxw-wnpDvMhuMoWOMcv1rFlZL9NVJmhOOAzCVAZvzlePPg5D8AbyyRz9Puh-iVKPMBd_mBfhy0HHlniQiMYF7IC7DbSXDTAHj6HV3g0pF5771V5gl2qCZn5pWGsDyyptpsi68vhWxJ7HgtvffiJxheyK7YugM5_bXWRIr_5MEZbeU5n_PVZD89Tkf_" />
            <span className="text-headline-sm font-headline-sm text-on-surface tracking-tight">DeskFlow</span>
          </div>
          
          {user && (
            <>
              <nav className="hidden md:flex items-center gap-space-lg">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-space-sm py-1 transition-colors ${
                      location.pathname === link.path 
                        ? 'bg-primary-container text-on-primary-container font-medium rounded-lg' 
                        : 'text-body-md text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
              
              <div className="flex items-center gap-space-md">
                <div className="relative hidden md:block">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                  <input 
                    className="bg-surface-container-low text-on-surface placeholder:text-outline text-body-md rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="Search tickets..." 
                    type="text"
                    value={globalSearch}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="flex items-center gap-space-sm bg-surface-container-low px-3 py-1.5 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-label-md text-on-surface font-medium">{user.email || 'User'}</span>
                    <span className="text-label-sm text-secondary">{user.role || 'Role'}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="hidden sm:block p-2 text-on-surface-variant hover:text-error transition-colors" title="Logout">
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
                <button className="md:hidden p-2 text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  <span className="material-symbols-outlined text-[24px]">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Mobile menu dropdown */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden bg-surface border-t border-surface-container absolute top-16 left-0 w-full z-40 px-gutter py-space-md flex flex-col gap-space-sm shadow-md">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-space-sm py-2 transition-colors ${
                  location.pathname === link.path 
                    ? 'bg-primary-container text-on-primary-container font-medium rounded-lg' 
                    : 'text-body-md text-on-surface-variant'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="relative mt-2">
               <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
               <input 
                 className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-body-md rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" 
                 placeholder="Search tickets..." 
                 type="text"
                 value={globalSearch}
                 onChange={handleSearchChange}
               />
            </div>
            <button onClick={handleLogout} className="mt-2 text-left px-space-sm py-2 text-error font-medium hover:bg-error/10 rounded-lg transition-colors flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="w-full pt-16 bg-surface">
        {children}
      </main>

      <footer className="w-full bg-surface-container-low py-space-xl">
        <div className="max-w-7xl mx-auto px-gutter text-center text-on-surface-variant text-body-sm">
          © 2024 DeskFlow IT &amp; Facilities. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

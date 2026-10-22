import { Link, useNavigate } from 'react-router-dom';
import { Scale, Menu, X, User, LogOut, FileText } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 border-b-4 border-amber-600 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Court Themed */}
          <Link to="/" className="flex items-center gap-3 text-amber-100 hover:text-white transition-colors group">
            <div className="relative">
              <Scale className="w-10 h-10 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-amber-400 blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-2xl tracking-wide text-amber-50">NYAYASETU</span>
              <span className="text-xs text-amber-300 font-serif italic">The Court of Digital Justice</span>
            </div>
          </Link>

          {/* Desktop Navigation - Court Themed */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/about" className="text-sm font-medium text-amber-100 hover:text-white transition-colors">
              About
            </Link>
            <Link to="/resources" className="text-sm font-medium text-amber-100 hover:text-white transition-colors">
              Resources
            </Link>
            <Link to="/privacy" className="text-sm font-medium text-amber-100 hover:text-white transition-colors">
              Privacy
            </Link>

            {isAuthenticated && user ? (
              <>
                <Link 
                  to="/assessments" 
                  className="flex items-center gap-2 text-sm font-medium text-amber-100 hover:text-white transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  My Cases
                </Link>
                {user.role === 'ADMIN' && (
                  <Link 
                    to="/admin" 
                    className="text-sm font-medium text-yellow-300 hover:text-yellow-100 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-3 border-l border-amber-600">
                  <span className="text-sm text-amber-200">
                    <User className="w-4 h-4 inline mr-1" />
                    {user.full_name}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-sm font-medium text-amber-100 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-amber-100 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/assessment" className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-lg font-semibold shadow-lg transition-all hover:shadow-xl">
                  File a Petition
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-blue-900 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col gap-3">
              <Link 
                to="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-blue-900 transition-colors py-2"
              >
                About
              </Link>
              <Link 
                to="/resources" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-blue-900 transition-colors py-2"
              >
                Resources
              </Link>
              <Link 
                to="/privacy" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-blue-900 transition-colors py-2"
              >
                Privacy
              </Link>

              {isAuthenticated && user ? (
                <>
                  <Link 
                    to="/assessments" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-900 transition-colors py-2"
                  >
                    <FileText className="w-4 h-4" />
                    My Assessments
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors py-2"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-sm text-slate-600 mb-3">
                      <User className="w-4 h-4 inline mr-1" />
                      {user.full_name}
                    </p>
                    <button 
                      onClick={handleLogout}
                      className="btn btn-secondary w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-3 border-t border-slate-200">
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-secondary w-full"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/assessment" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary w-full"
                  >
                    Start Assessment
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

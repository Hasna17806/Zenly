import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Heart, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check login status on component mount and when localStorage changes
  useEffect(() => {
    checkLoginStatus();
    
    // Listen for storage changes (logout in another tab)
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
    
    if (token) {
      setIsLoggedIn(true);
      setUser({
        email: userEmail || 'user@example.com',
        name: userName || userEmail?.split('@')[0] || 'User',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || userEmail || 'User')}&background=3B82F6&color=fff&bold=true`
      });
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const handleLogout = () => {
    // Clear all storage
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userName');
    
    setIsLoggedIn(false);
    setIsProfileMenuOpen(false);
    
    toast.success('Logged out successfully', {
      icon: '👋',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
    
    navigate('/');
  };

  const handleProfileClick = () => {
    if (isLoggedIn) {
      setIsProfileMenuOpen(!isProfileMenuOpen);
    }
  };

  const navItems = [
    { name: 'MOOD', path: '/mood' },
    { name: 'CHALLENGES', path: '/challenges' },
    { name: 'CHAT', path: '/chat' },
    { name: 'PROGRESS', path: '/progress' }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="w-full px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
          <img src="https://res.cloudinary.com/dkqjn6dqw/image/upload/v1771944890/s__1_-removebg-preview_b54v9c.png"
           alt="zenly logo"
           className='w-50 h-auto'
            />
          </Link>

          {/* Desktop Navigation - Center */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-sm font-semibold text-gray-600 hover:text-blue-600 tracking-wider transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              /* Logged In State */
              <>
                {/* Greeting */}
                {user && (
                  <span className="hidden md:block text-sm text-gray-600">
                    Hi, <span className="font-semibold text-blue-600">{user.name}</span>
                  </span>
                )}

                {/* Profile Avatar */}
                <div className="relative">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors focus:outline-none"
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span className="text-sm">My Profile</span>
                        </Link>
                        
                        <Link
                          to="/settings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-sm">Settings</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Not Logged In State */
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold text-sm hover:bg-blue-700 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            {isLoggedIn ? (
              <>
                {/* Mobile Greeting */}
                {user && (
                  <div className="px-4 py-3 bg-blue-50 rounded-lg mb-3">
                    <p className="text-sm text-gray-600">Hi,</p>
                    <p className="font-semibold text-blue-700">{user.name}</p>
                  </div>
                )}

                {/* Mobile Navigation Links */}
                <div className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="text-gray-600 hover:text-blue-600 px-4 py-2 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  <hr className="my-2 border-gray-100" />
                  
                  <Link
                    to="/profile"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-red-600 hover:bg-red-50 px-4 py-2 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
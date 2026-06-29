import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import api from '../lib/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    if (user) {
      api.get('/properties')
        .then(res => setProperties(res.data))
        .catch(err => console.error(err));
    }
  }, [user, location.pathname]);

  const isAdmin = user && user.email === 'admin@mezenga.com';

  return (
    <nav className="bg-background/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-playfair font-bold text-primary flex items-center gap-2">
            <span className="bg-primary text-white p-1.5 rounded-lg text-lg">M</span>
            Mezenga
          </Link>

          {/* Role / Page Switcher */}
          <div className="flex bg-muted p-1 rounded-lg text-sm font-medium">
            <button
              onClick={() => navigate('/dashboard')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                location.pathname === '/dashboard' ? 'bg-white shadow text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Owner Dashboard
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  location.pathname === '/admin' ? 'bg-white shadow text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Super Admin
              </button>
            )}
            
            {/* Quick Public View Dropdown */}
            {properties.length > 0 && (
              <div className="relative group">
                <button className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground flex items-center gap-1">
                  View Public Page ▾
                </button>
                <div className="absolute left-0 mt-1 hidden group-hover:block bg-white border rounded-lg shadow-lg py-2 w-48 z-50">
                  {properties.map(p => (
                    <Link
                      key={p._id}
                      to={`/p/${p.publicSlug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-muted"
                    >
                      {p.propertyName}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {user.photoURL && (
                <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border" />
              )}
              <span className="text-sm font-medium text-foreground">{user.displayName || user.email}</span>
              <Button onClick={logout} variant="outline" size="sm">Logout</Button>
            </div>
          ) : (
            <Button onClick={() => navigate('/login')} size="sm">Login</Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

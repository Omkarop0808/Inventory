import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Building, 
  BedDouble, 
  CalendarDays, 
  LogOut, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.email === 'patilomkar0806@gmail.com';
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabClick = (id) => {
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard', { state: { activeTab: id } });
    } else {
      setActiveTab(id);
    }
  };

  const navItems = [
    { id: 'properties', label: 'Properties', icon: Building },
    { id: 'rooms', label: 'Room Management', icon: BedDouble },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  ];

  return (
    <aside className="w-64 bg-background border-r border-border/50 flex flex-col h-screen sticky top-0 transition-all duration-300">
      
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b">
        <NavLink to="/" className="text-xl font-heading font-bold text-primary flex items-center gap-2">
          <Building className="w-6 h-6" /> Mezenga
        </NavLink>
      </div>

      {/* User Profile Snippet */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border ring-2 ring-primary/20" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-foreground truncate">{user?.displayName || 'Host'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === item.id 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              {item.label}
            </div>
            {activeTab === item.id && <ChevronRight className="w-4 h-4" />}
          </button>
        ))}

        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-border/50">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Admin</p>
            <NavLink
              to="/admin"
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
              Super Admin Panel
            </NavLink>
          </div>
        )}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
      </div>

    </aside>
  );
};

export default Sidebar;

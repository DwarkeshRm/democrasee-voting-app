
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { getCurrentUser, logout } from '@/services/votingService';
import Logo from './Logo';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ username: string; isAdmin: boolean } | null>(null);
  
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser({
        username: currentUser.username,
        isAdmin: currentUser.isAdmin
      });
    } else {
      setUser(null);
    }
  }, [location.pathname]);
  
  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };
  
  if (!user) {
    return (
      <nav className="app-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
          </div>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="app-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Logo />
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:flex space-x-4 mr-6">
              <Button
                variant={location.pathname === '/vote' ? 'default' : 'outline'}
                asChild
              >
                <Link to="/vote">Vote</Link>
              </Button>
              
              <Button 
                variant={location.pathname === '/results' ? 'default' : 'outline'}
                asChild
              >
                <Link to="/results">Results</Link>
              </Button>
              
              {!user.isAdmin && (
                <Button 
                  variant={location.pathname === '/candidate-registration' ? 'default' : 'outline'}
                  asChild
                >
                  <Link to="/candidate-registration">Register as Candidate</Link>
                </Button>
              )}
              
              {user.isAdmin && (
                <Button 
                  variant={location.pathname === '/admin' ? 'default' : 'outline'}
                  asChild
                >
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-1" />
                <span>{user.username}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

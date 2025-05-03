
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckSquare } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="app-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <CheckSquare className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-primary">DemocraSee</span>
            </Link>
          </div>
          <div className="flex space-x-4">
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
            <Button 
              variant={location.pathname === '/admin' ? 'default' : 'outline'}
              asChild
            >
              <Link to="/admin">Admin</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

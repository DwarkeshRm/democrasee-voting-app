
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Check } from 'lucide-react';

const Logo = () => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 1000);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Link to="/" className="flex items-center">
      <div className="relative">
        <CheckSquare 
          className={`h-8 w-8 text-primary transition-transform duration-300 ${
            animate ? 'scale-125' : ''
          }`} 
        />
        {animate && (
          <Check 
            className="h-4 w-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping" 
          />
        )}
      </div>
      <span className="text-xl font-bold text-primary ml-2">DemocraSee</span>
    </Link>
  );
};

export default Logo;

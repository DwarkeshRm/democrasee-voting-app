
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { VoteIcon, BarChart3, Settings, LogIn } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { getCurrentUser } from '@/services/votingService';

const Index = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setIsLoggedIn(true);
      setIsAdmin(user.isAdmin);
    }
  }, []);
  
  const handleLoginSuccess = () => {
    const user = getCurrentUser();
    setIsLoggedIn(true);
    if (user?.isAdmin) {
      setIsAdmin(true);
      navigate('/admin');
    } else {
      navigate('/vote');
    }
  };
  
  const handleRegisterSuccess = () => {
    setShowLogin(true);
  };
  
  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-primary">DemocraSee Voting System</h1>
          <p className="text-xl text-gray-600 mb-8">
            A modern digital voting platform with simple administration and real-time results.
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          {showLogin ? (
            <LoginForm 
              onLoginSuccess={handleLoginSuccess} 
              onRegisterClick={() => setShowLogin(false)} 
            />
          ) : (
            <RegisterForm 
              onRegisterSuccess={handleRegisterSuccess} 
              onLoginClick={() => setShowLogin(true)} 
            />
          )}
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-primary">DemocraSee Voting System</h1>
        <p className="text-xl text-gray-600 mb-8">
          A modern digital voting platform with simple administration and real-time results.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <Card className="transform transition-all hover:scale-105">
          <CardHeader className="text-center border-b pb-2">
            <VoteIcon className="h-12 w-12 mx-auto text-primary mb-2" />
            <h2 className="text-xl font-semibold">Cast Your Vote</h2>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">
              Browse active polls and cast your vote securely.
            </p>
            <Button asChild>
              <Link to="/vote">Vote Now</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="transform transition-all hover:scale-105">
          <CardHeader className="text-center border-b pb-2">
            <BarChart3 className="h-12 w-12 mx-auto text-primary mb-2" />
            <h2 className="text-xl font-semibold">View Results</h2>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">
              See real-time election results with visual charts and detailed statistics.
            </p>
            <Button asChild>
              <Link to="/results">See Results</Link>
            </Button>
          </CardContent>
        </Card>
        
        {isAdmin ? (
          <Card className="transform transition-all hover:scale-105">
            <CardHeader className="text-center border-b pb-2">
              <Settings className="h-12 w-12 mx-auto text-primary mb-2" />
              <h2 className="text-xl font-semibold">Administration</h2>
            </CardHeader>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-4">
                Create polls, manage candidates, reset votes, and export data.
              </p>
              <Button asChild>
                <Link to="/admin">Admin Panel</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="transform transition-all hover:scale-105">
            <CardHeader className="text-center border-b pb-2">
              <LogIn className="h-12 w-12 mx-auto text-primary mb-2" />
              <h2 className="text-xl font-semibold">Candidate Registration</h2>
            </CardHeader>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-4">
                Register as a candidate for upcoming polls.
              </p>
              <Button asChild>
                <Link to="/candidate-registration">Register as Candidate</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Index;


import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { VoteIcon, BarChart3, Settings } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const Index = () => {
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
              Browse candidates and cast your vote securely in our digital ballot system.
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
        
        <Card className="transform transition-all hover:scale-105">
          <CardHeader className="text-center border-b pb-2">
            <Settings className="h-12 w-12 mx-auto text-primary mb-2" />
            <h2 className="text-xl font-semibold">Administration</h2>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">
              Manage candidates, reset votes, and export data in JSON format.
            </p>
            <Button asChild>
              <Link to="/admin">Admin Panel</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-16 text-center text-gray-500 text-sm">
        <p>DemocraSee Voting System • Secure · Transparent · User-friendly</p>
      </div>
    </Layout>
  );
};

export default Index;

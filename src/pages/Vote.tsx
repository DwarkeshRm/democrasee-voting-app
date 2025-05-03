
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { 
  getCurrentUser, 
  getPolls, 
  updatePollStatus 
} from '@/services/votingService';
import { Poll } from '@/types';
import Layout from '@/components/layout/Layout';
import PollCard from '@/components/polls/PollCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Vote = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [upcomingPolls, setUpcomingPolls] = useState<Poll[]>([]);
  const [pastPolls, setPastPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
      toast({
        title: "Access Denied",
        description: "Please login to access the voting page",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    loadPolls();
    
    // Set up interval to update poll statuses
    const interval = setInterval(() => {
      updatePollStatus();
      loadPolls();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [navigate, toast]);
  
  const loadPolls = () => {
    setLoading(true);
    updatePollStatus();
    const allPolls = getPolls();
    setPolls(allPolls);
    
    const now = new Date();
    
    // Sort polls by active/upcoming/past
    const active: Poll[] = [];
    const upcoming: Poll[] = [];
    const past: Poll[] = [];
    
    allPolls.forEach(poll => {
      const startDate = new Date(poll.startDate);
      const endDate = new Date(poll.endDate);
      
      if (now >= startDate && now <= endDate) {
        active.push(poll);
      } else if (now < startDate) {
        upcoming.push(poll);
      } else {
        past.push(poll);
      }
    });
    
    setActivePolls(active);
    setUpcomingPolls(upcoming);
    setPastPolls(past);
    setLoading(false);
  };
  
  if (loading) {
    return (
      <Layout>
        <h1 className="page-header">Vote in Polls</h1>
        <div className="text-center p-10">Loading polls...</div>
      </Layout>
    );
  }
  
  if (polls.length === 0) {
    return (
      <Layout>
        <h1 className="page-header">Vote in Polls</h1>
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No polls available</AlertTitle>
          <AlertDescription>
            There are currently no polls available for voting. Please check back later.
          </AlertDescription>
        </Alert>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <h1 className="page-header">Vote in Polls</h1>
      
      {activePolls.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Active Polls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        </div>
      )}
      
      {upcomingPolls.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Upcoming Polls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        </div>
      )}
      
      {pastPolls.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Polls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Vote;

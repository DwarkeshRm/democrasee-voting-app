
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCurrentUser, 
  getPolls, 
  updatePollStatus 
} from '@/services/votingService';
import Layout from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Poll } from '@/types';
import PollCard from '@/components/polls/PollCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Vote = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [upcomingPolls, setUpcomingPolls] = useState<Poll[]>([]);
  const [endedPolls, setEndedPolls] = useState<Poll[]>([]);
  const [selectedTab, setSelectedTab] = useState("active");
  const [loading, setLoading] = useState(true);

  const loadPolls = () => {
    // Update poll statuses and load polls
    updatePollStatus();
    const allPolls = getPolls();
    setPolls(allPolls);
    
    const now = new Date();
    
    // Filter polls by status
    const active = allPolls.filter(poll => {
      const startDate = new Date(poll.startDate);
      const endDate = new Date(poll.endDate);
      return now >= startDate && now <= endDate;
    });
    setActivePolls(active);
    
    const upcoming = allPolls.filter(poll => {
      const startDate = new Date(poll.startDate);
      return now < startDate;
    });
    setUpcomingPolls(upcoming);
    
    const ended = allPolls.filter(poll => {
      const endDate = new Date(poll.endDate);
      return now > endDate;
    });
    setEndedPolls(ended);
    
    // Set initial tab based on available polls
    if (active.length > 0 && selectedTab === "active") {
      setSelectedTab("active");
    } else if (upcoming.length > 0 && active.length === 0) {
      setSelectedTab("upcoming");
    } else if (ended.length > 0 && active.length === 0 && upcoming.length === 0) {
      setSelectedTab("ended");
    }
    
    setLoading(false);
  };

  useEffect(() => {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
      navigate('/');
      return;
    }
    
    loadPolls();
    
    // Set up interval to update poll statuses
    const interval = setInterval(() => {
      updatePollStatus();
      loadPolls();
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [navigate]);

  const handleRefresh = () => {
    setLoading(true);
    loadPolls();
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center p-10">Loading polls...</div>
      </Layout>
    );
  }

  if (polls.length === 0) {
    return (
      <Layout>
        <div className="text-center p-10">
          <h1 className="text-2xl font-bold mb-4">No polls available</h1>
          <p className="text-gray-500 mb-4">There are no polls available to vote on at this time.</p>
          <Button onClick={handleRefresh} variant="outline" className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Available Elections</h1>
          <Button 
            onClick={handleRefresh} 
            size="sm" 
            variant="outline" 
            className="flex items-center text-blue-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
        <p className="text-gray-600 mt-2">Participate in active elections or view upcoming and past elections</p>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8 bg-blue-100/50 p-1 rounded-lg">
          <TabsTrigger 
            value="active" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex gap-2"
          >
            Active
            {activePolls.length > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                {activePolls.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="upcoming"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex gap-2"
          >
            Upcoming
            {upcomingPolls.length > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                {upcomingPolls.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="ended"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex gap-2"
          >
            Ended
            {endedPolls.length > 0 && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                {endedPolls.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {activePolls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePolls.map(poll => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          ) : (
            <Alert className="bg-blue-50 border-blue-100">
              <AlertTitle className="text-blue-800">No Active Polls</AlertTitle>
              <AlertDescription className="text-blue-600">
                There are no active polls at this time. Check the upcoming tab for future elections.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming">
          {upcomingPolls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingPolls.map(poll => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          ) : (
            <Alert className="bg-yellow-50 border-yellow-100">
              <AlertTitle className="text-yellow-800">No Upcoming Polls</AlertTitle>
              <AlertDescription className="text-yellow-600">
                There are no upcoming polls scheduled at this time.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="ended">
          {endedPolls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedPolls.map(poll => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          ) : (
            <Alert className="bg-gray-50 border-gray-100">
              <AlertTitle className="text-gray-700">No Ended Polls</AlertTitle>
              <AlertDescription className="text-gray-600">
                There are no ended polls to display.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Vote;

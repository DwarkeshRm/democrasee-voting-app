
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

const Vote = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [upcomingPolls, setUpcomingPolls] = useState<Poll[]>([]);
  const [endedPolls, setEndedPolls] = useState<Poll[]>([]);
  const [selectedTab, setSelectedTab] = useState("active");

  useEffect(() => {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
      navigate('/');
      return;
    }
    
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
    if (active.length > 0) {
      setSelectedTab("active");
    } else if (upcoming.length > 0) {
      setSelectedTab("upcoming");
    } else {
      setSelectedTab("ended");
    }
    
    // Set up interval to update poll statuses
    const interval = setInterval(() => {
      updatePollStatus();
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [navigate]);

  if (polls.length === 0) {
    return (
      <Layout>
        <div className="text-center p-10">
          <h1 className="text-2xl font-bold mb-4">No polls available</h1>
          <p className="text-gray-500">There are no polls available to vote on at this time.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Available Elections</h1>
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
            <div className="text-center p-10 bg-blue-50 rounded-lg border border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">No Active Polls</h2>
              <p className="text-gray-600">There are no active polls at this time. Check the upcoming tab for future elections.</p>
            </div>
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
            <div className="text-center p-10 bg-yellow-50 rounded-lg border border-yellow-100">
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">No Upcoming Polls</h2>
              <p className="text-gray-600">There are no upcoming polls scheduled at this time.</p>
            </div>
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
            <div className="text-center p-10 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Ended Polls</h2>
              <p className="text-gray-600">There are no ended polls to display.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Vote;

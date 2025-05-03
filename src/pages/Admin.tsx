
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getCurrentUser, 
  getPolls, 
  updatePollStatus 
} from '@/services/votingService';
import Layout from '@/components/layout/Layout';
import CreatePollForm from '@/components/polls/CreatePollForm';
import PollCard from '@/components/polls/PollCard';
import { Poll } from '@/types';

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activeTab, setActiveTab] = useState('polls');
  
  useEffect(() => {
    // Check if user is admin
    const user = getCurrentUser();
    if (!user || !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page",
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
    updatePollStatus();
    setPolls(getPolls());
  };
  
  const handlePollCreated = () => {
    loadPolls();
    setActiveTab('polls');
  };
  
  return (
    <Layout>
      <h1 className="page-header">Admin Panel</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="polls">Manage Polls</TabsTrigger>
          <TabsTrigger value="create">Create Poll</TabsTrigger>
        </TabsList>
        
        <TabsContent value="polls">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.length > 0 ? (
              polls.map((poll) => (
                <PollCard key={poll.id} poll={poll} isAdmin={true} />
              ))
            ) : (
              <div className="col-span-full text-center p-10 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-600 mb-2">No polls created</h2>
                <p className="text-gray-500 mb-4">Click the "Create Poll" tab to create your first poll.</p>
                <Button onClick={() => setActiveTab('create')}>Create a Poll</Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="create">
          <div className="max-w-2xl mx-auto">
            <CreatePollForm onPollCreated={handlePollCreated} />
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Admin;

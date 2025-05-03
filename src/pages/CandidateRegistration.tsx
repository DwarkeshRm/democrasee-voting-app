
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getCurrentUser, 
  getPolls, 
  addCandidate,
  getCandidates,
  getPollStatus
} from '@/services/votingService';
import Layout from '@/components/layout/Layout';
import { Poll } from '@/types';

const CandidateRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [upcomingPolls, setUpcomingPolls] = useState<Poll[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<string>('');
  const [candidateName, setCandidateName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  useEffect(() => {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
      toast({
        title: "Access Denied",
        description: "Please login to register as a candidate",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    // Get all polls
    const allPolls = getPolls();
    setPolls(allPolls);
    
    // Filter only upcoming polls that haven't started yet
    const upcoming = allPolls.filter(poll => {
      const status = getPollStatus(poll.id);
      return !status.hasStarted && !status.hasEnded;
    });
    
    setUpcomingPolls(upcoming);
  }, [navigate, toast]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPoll) {
      toast({
        title: "Error",
        description: "Please select a poll",
        variant: "destructive",
      });
      return;
    }
    
    if (!candidateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your candidate name",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user is already registered for this poll
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const existingCandidates = getCandidates(selectedPoll);
    if (existingCandidates.some(c => c.name === candidateName)) {
      toast({
        title: "Error",
        description: "A candidate with this name is already registered for this poll",
        variant: "destructive",
      });
      return;
    }
    
    // Check poll status
    const status = getPollStatus(selectedPoll);
    if (status.hasStarted) {
      toast({
        title: "Error",
        description: "This poll has already started. Registration closed.",
        variant: "destructive",
      });
      return;
    }
    
    const candidate = addCandidate({
      name: candidateName,
      imageUrl,
      pollId: selectedPoll
    });
    
    if (candidate) {
      toast({
        title: "Success",
        description: "You have successfully registered as a candidate",
      });
      setCandidateName('');
      setImageUrl('');
      setSelectedPoll('');
    } else {
      toast({
        title: "Error",
        description: "Failed to register as a candidate",
        variant: "destructive",
      });
    }
  };
  
  if (upcomingPolls.length === 0) {
    return (
      <Layout>
        <h1 className="page-header">Candidate Registration</h1>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center p-10">
                <p className="text-lg mb-4">There are currently no upcoming polls open for candidate registration.</p>
                <Button onClick={() => navigate('/')}>Return to Homepage</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <h1 className="page-header">Candidate Registration</h1>
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Register as a Candidate</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="poll">Select Poll</Label>
                <select
                  id="poll"
                  value={selectedPoll}
                  onChange={(e) => setSelectedPoll(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">-- Select a Poll --</option>
                  {upcomingPolls.map((poll) => (
                    <option key={poll.id} value={poll.id}>
                      {poll.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Candidate Name</Label>
                <Input 
                  id="name" 
                  value={candidateName} 
                  onChange={(e) => setCandidateName(e.target.value)} 
                  placeholder="Enter your candidate name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Image URL (Optional)</Label>
                <Input 
                  id="image" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)} 
                  placeholder="Enter image URL"
                />
              </div>
              
              <Button type="submit" className="w-full">
                Register as Candidate
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CandidateRegistration;


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  getCurrentUser, 
  getPollById,
  getCandidates,
  resetVoting,
  removeCandidate,
  exportPollResultsToJson
} from '@/services/votingService';
import { Candidate, Poll } from '@/types';
import Layout from '@/components/layout/Layout';
import CandidateCard from '@/components/candidates/CandidateCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PollManagement = () => {
  const { pollId } = useParams<{ pollId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  
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
    
    if (!pollId) {
      navigate('/admin');
      return;
    }
    
    // Load poll
    const loadedPoll = getPollById(pollId);
    
    if (!loadedPoll) {
      toast({
        title: "Error",
        description: "Poll not found",
        variant: "destructive",
      });
      navigate('/admin');
      return;
    }
    
    setPoll(loadedPoll);
    
    // Load candidates
    loadCandidates();
    setLoading(false);
  }, [pollId, navigate, toast]);
  
  const loadCandidates = () => {
    if (!pollId) return;
    
    const pollCandidates = getCandidates(pollId);
    setCandidates(pollCandidates);
    setTotalVotes(pollCandidates.reduce((sum, c) => sum + c.votes, 0));
  };
  
  const handleReset = () => {
    if (!pollId) return;
    
    if (window.confirm('Are you sure you want to reset all votes for this poll?')) {
      const success = resetVoting(pollId);
      
      if (success) {
        loadCandidates();
        toast({
          title: "Success",
          description: "All votes have been reset",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to reset votes",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleExport = () => {
    if (!pollId) return;
    
    exportPollResultsToJson(pollId);
    toast({
      title: "Success",
      description: "Results exported successfully",
    });
  };
  
  const handleRemoveCandidate = (candidateId: string) => {
    if (removeCandidate(candidateId)) {
      loadCandidates();
      toast({
        title: "Success",
        description: "Candidate removed successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to remove candidate",
        variant: "destructive",
      });
    }
  };
  
  const colors = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'];
  
  if (loading) {
    return (
      <Layout>
        <div className="text-center p-10">Loading...</div>
      </Layout>
    );
  }
  
  if (!poll) {
    return (
      <Layout>
        <div className="text-center p-10">Poll not found</div>
      </Layout>
    );
  }
  
  const now = new Date();
  const startDate = new Date(poll.startDate);
  const endDate = new Date(poll.endDate);
  const hasStarted = now >= startDate;
  const hasEnded = now > endDate;
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Poll Management</h1>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          Back to Admin
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-bold">{poll.title}</h2>
          <p className="text-gray-500">{poll.description}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p>{new Date(poll.startDate).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p>{new Date(poll.endDate).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {hasStarted && !hasEnded && (
              <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                Active
              </span>
            )}
            {hasEnded && (
              <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                Ended
              </span>
            )}
            {!hasStarted && (
              <span className="inline-block px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                Upcoming
              </span>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={!hasStarted}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Reset All Votes
        </Button>
        <Button 
          variant="outline" 
          onClick={handleExport}
        >
          <Download className="h-4 w-4 mr-2" /> Export Results (JSON)
        </Button>
      </div>
      
      <Tabs defaultValue="candidates" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="candidates">
          {candidates.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No candidates</AlertTitle>
              <AlertDescription>
                There are no candidates registered for this poll.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  isAdmin={true}
                  onDelete={handleRemoveCandidate}
                  isVoted={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="results">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="border-b">
                  <h2 className="text-xl font-bold">Vote Distribution</h2>
                </CardHeader>
                <CardContent className="pt-6 h-[400px]">
                  {totalVotes > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={candidates}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end"
                          height={70}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`${value} votes`, 'Votes']} 
                          labelFormatter={(label) => `Candidate: ${label}`}
                        />
                        <Bar dataKey="votes" name="Votes">
                          {candidates.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No votes have been cast yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader className="border-b">
                  <h2 className="text-xl font-bold">Vote Counts</h2>
                </CardHeader>
                <CardContent className="pt-6">
                  {candidates.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 font-bold border-b pb-2">
                        <div>Candidate</div>
                        <div className="text-right">Votes</div>
                      </div>
                      
                      {candidates.map((candidate) => (
                        <div key={candidate.id} className="grid grid-cols-2 gap-2">
                          <div>{candidate.name}</div>
                          <div className="text-right">
                            {candidate.votes} ({totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0}%)
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t pt-2 grid grid-cols-2 gap-2 font-bold">
                        <div>Total Votes</div>
                        <div className="text-right">{totalVotes}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No candidates available.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default PollManagement;

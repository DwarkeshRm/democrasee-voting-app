
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { 
  getCurrentUser, 
  getPolls,
  getPollById,
  getPollStatus
} from '@/services/votingService';
import Layout from '@/components/layout/Layout';
import { Poll } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Link as LinkIcon } from 'lucide-react';
import CandidateRegistrationForm from '@/components/candidates/CandidateRegistrationForm';
import { Button } from '@/components/ui/button';

const CandidateRegistration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlPollId = searchParams.get('pollId');
  
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [pollStatus, setPollStatus] = useState<{
    hasStarted: boolean;
    hasEnded: boolean;
    candidateCount: number;
  } | null>(null);
  
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
    
    // Load polls
    const allPolls = getPolls();
    
    // Show only active or upcoming polls
    const availablePolls = allPolls.filter(poll => {
      const now = new Date();
      const endDate = new Date(poll.endDate);
      return now <= endDate;
    });
    
    setPolls(availablePolls);
    
    // If poll ID is provided in URL, select it
    if (urlPollId) {
      setSelectedPollId(urlPollId);
    } else if (availablePolls.length > 0) {
      setSelectedPollId(availablePolls[0].id);
    }
  }, [navigate, toast, urlPollId]);
  
  useEffect(() => {
    if (selectedPollId) {
      const poll = getPollById(selectedPollId);
      setSelectedPoll(poll);
      
      if (poll) {
        setPollStatus(getPollStatus(selectedPollId));
      } else {
        setPollStatus(null);
      }
    }
  }, [selectedPollId]);
  
  const handlePollChange = (id: string) => {
    setSelectedPollId(id);
  };
  
  const handleCandidateAdded = () => {
    if (selectedPollId) {
      setPollStatus(getPollStatus(selectedPollId));
    }
    
    toast({
      title: "Success",
      description: "You've been registered as a candidate!"
    });
  };
  
  const getCandidateRegistrationLink = () => {
    if (!selectedPollId) return '';
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/candidate-registration?pollId=${selectedPollId}`;
  };
  
  const copyShareLink = () => {
    const link = getCandidateRegistrationLink();
    navigator.clipboard.writeText(link);
    toast({
      description: "Share link copied to clipboard",
    });
  };
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Candidate Registration</h1>
        
        {polls.length === 0 ? (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No active polls</AlertTitle>
            <AlertDescription>
              There are currently no active or upcoming polls available for candidate registration.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2 mb-8">
              <Label htmlFor="poll-select">Select Poll</Label>
              <Select value={selectedPollId || ''} onValueChange={handlePollChange}>
                <SelectTrigger className="w-full border-blue-200">
                  <SelectValue placeholder="Select a poll" />
                </SelectTrigger>
                <SelectContent>
                  {polls.map((poll) => (
                    <SelectItem key={poll.id} value={poll.id}>
                      {poll.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedPoll && pollStatus && (
              <div className="mb-8">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <h2 className="text-lg font-semibold text-blue-800">{selectedPoll.title}</h2>
                  <p className="text-gray-600 my-2">{selectedPoll.description}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Start:</span> {new Date(selectedPoll.startDate).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">End:</span> {new Date(selectedPoll.endDate).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Candidates:</span> {pollStatus.candidateCount}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-blue-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center text-blue-600"
                      onClick={copyShareLink}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Copy Share Link for Candidate Registration
                    </Button>
                  </div>
                </div>
                
                {pollStatus.hasEnded ? (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Poll Ended</AlertTitle>
                    <AlertDescription>
                      This poll has already ended and is not accepting new candidates.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="mt-6">
                    <CandidateRegistrationForm 
                      pollId={selectedPollId as string}
                      onCandidateAdded={handleCandidateAdded}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default CandidateRegistration;


import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  getCurrentUser, 
  getPollById,
  getCandidates,
  hasUserVotedInPoll,
  voteForCandidate,
  getUserVoteInPoll
} from '@/services/votingService';
import { Candidate, Poll } from '@/types';
import Layout from '@/components/layout/Layout';
import CandidateCard from '@/components/candidates/CandidateCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check, Clock } from 'lucide-react';

const PollVoting = () => {
  const { pollId } = useParams<{ pollId: string }>();
  const [searchParams] = useSearchParams();
  const directPollId = searchParams.get('pollId');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const activePollId = pollId || directPollId;
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isVoted, setIsVoted] = useState(false);
  const [userVotedFor, setUserVotedFor] = useState<string | undefined>(undefined);
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
    
    if (!activePollId) {
      navigate('/vote');
      return;
    }
    
    // Load poll and check if user can vote
    const loadedPoll = getPollById(activePollId);
    
    if (!loadedPoll) {
      toast({
        title: "Error",
        description: "Poll not found",
        variant: "destructive",
      });
      navigate('/vote');
      return;
    }
    
    setPoll(loadedPoll);
    
    // Check if poll is active
    const now = new Date();
    const startDate = new Date(loadedPoll.startDate);
    const endDate = new Date(loadedPoll.endDate);
    
    if (now < startDate) {
      toast({
        title: "Poll not active",
        description: "This poll has not started yet",
        variant: "destructive",
      });
      navigate('/vote');
      return;
    }
    
    if (now > endDate) {
      // If poll has ended, redirect to results
      navigate(`/results?pollId=${activePollId}`);
      return;
    }
    
    // Load candidates
    const pollCandidates = getCandidates(activePollId);
    setCandidates(pollCandidates);
    
    // Check if user has already voted and get their vote
    const hasVoted = hasUserVotedInPoll(user.id, activePollId);
    setIsVoted(hasVoted);
    
    // Get which candidate the user voted for
    if (hasVoted) {
      const votedFor = getUserVoteInPoll(user.id, activePollId);
      setUserVotedFor(votedFor);
    }
    
    setLoading(false);
  }, [activePollId, navigate, toast]);
  
  const handleVote = (candidateId: string) => {
    if (isVoted) {
      toast({
        title: "Already voted",
        description: "You have already cast your vote in this poll",
        variant: "destructive",
      });
      return;
    }
    
    if (!activePollId) return;
    
    const success = voteForCandidate(activePollId, candidateId);
    if (success) {
      setIsVoted(true);
      setUserVotedFor(candidateId);
      setCandidates(getCandidates(activePollId));
      toast({
        title: "Vote counted!",
        description: "Thank you for voting",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to cast your vote",
        variant: "destructive",
      });
    }
  };
  
  const handleExit = () => {
    navigate('/vote');
  };
  
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
  
  return (
    <Layout>
      <div className="mb-8 p-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">{poll.title}</h1>
        <p className="text-gray-600">{poll.description}</p>
        
        <div className="flex items-center mt-4 text-sm">
          <Clock className="h-4 w-4 mr-1 text-blue-500" />
          <span className="text-gray-500">
            Voting ends: {new Date(poll.endDate).toLocaleString()}
          </span>
        </div>
      </div>
      
      {isVoted && (
        <Alert className="mb-8 bg-green-50 border border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Vote recorded</AlertTitle>
          <AlertDescription className="text-green-700">
            Your vote has been successfully recorded. Thank you for participating!
          </AlertDescription>
        </Alert>
      )}
      
      {candidates.length === 0 ? (
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No candidates</AlertTitle>
          <AlertDescription>
            There are no candidates registered for this poll.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onVote={handleVote}
                isVoted={isVoted}
                userVotedFor={userVotedFor}
              />
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <Button onClick={handleExit} size="lg" className="bg-blue-600 hover:bg-blue-700">
              {isVoted ? "Exit" : "Back to Polls"}
            </Button>
          </div>
        </>
      )}
    </Layout>
  );
};

export default PollVoting;

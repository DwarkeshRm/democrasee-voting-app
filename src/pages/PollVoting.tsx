
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  getCurrentUser, 
  getPollById,
  getCandidates,
  hasUserVotedInPoll,
  voteForCandidate
} from '@/services/votingService';
import { Candidate, Poll } from '@/types';
import Layout from '@/components/layout/Layout';
import CandidateCard from '@/components/candidates/CandidateCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check, Clock, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PollVoting = () => {
  const { pollId } = useParams<{ pollId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
    
    if (!pollId) {
      navigate('/vote');
      return;
    }
    
    // Load poll and check if user can vote
    const loadedPoll = getPollById(pollId);
    
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
      toast({
        title: "Poll ended",
        description: "This poll has ended",
        variant: "destructive",
      });
      navigate('/vote');
      return;
    }
    
    // Load candidates
    const pollCandidates = getCandidates(pollId);
    setCandidates(pollCandidates);
    
    // Check if user has already voted
    const hasVoted = hasUserVotedInPoll(user.id, pollId);
    setIsVoted(hasVoted);
    
    // This is a simplification, in a real app we would store which candidate the user voted for
    // Here we just note that the user has voted, not who they voted for
    setUserVotedFor(undefined);
    
    setLoading(false);
  }, [pollId, navigate, toast]);
  
  const handleVote = (candidateId: string) => {
    if (isVoted) {
      toast({
        title: "Already voted",
        description: "You have already cast your vote in this poll",
        variant: "destructive",
      });
      return;
    }
    
    if (!pollId) return;
    
    const success = voteForCandidate(pollId, candidateId);
    if (success) {
      setIsVoted(true);
      setUserVotedFor(candidateId);
      setCandidates(getCandidates(pollId));
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{poll.title}</h1>
        <p className="text-gray-600">{poll.description}</p>
        
        <div className="flex items-center mt-4 text-sm">
          <Clock className="h-4 w-4 mr-1 text-gray-500" />
          <span className="text-gray-500">
            Voting ends: {new Date(poll.endDate).toLocaleString()}
          </span>
        </div>
      </div>
      
      {isVoted && (
        <Alert className="mb-8 bg-green-50 border-success">
          <Check className="h-4 w-4 text-success" />
          <AlertTitle className="text-success">Vote recorded</AlertTitle>
          <AlertDescription>
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
            <Button onClick={handleExit} size="lg">
              {isVoted ? "Exit" : "Back to Polls"}
            </Button>
          </div>
        </>
      )}
    </Layout>
  );
};

export default PollVoting;

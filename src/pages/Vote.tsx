
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getCandidates, hasUserVoted, voteForCandidate } from '@/services/votingService';
import { Candidate } from '@/types';
import Layout from '@/components/layout/Layout';
import CandidateCard from '@/components/candidates/CandidateCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Vote = () => {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isVoted, setIsVoted] = useState(false);
  const [userVotedFor, setUserVotedFor] = useState<string | undefined>(undefined);

  useEffect(() => {
    setCandidates(getCandidates());
    setIsVoted(hasUserVoted());
    
    // If user has already voted, try to find which candidate they voted for
    // In a real app, this would come from the server/database
    if (hasUserVoted()) {
      // This is just a placeholder since we don't store this info
      // In a real app, you would retrieve this from the server
    }
  }, []);

  const handleVote = (candidateId: string) => {
    if (isVoted) {
      toast({
        title: "Already voted",
        description: "You have already cast your vote",
        variant: "destructive",
      });
      return;
    }

    const success = voteForCandidate(candidateId);
    if (success) {
      setIsVoted(true);
      setUserVotedFor(candidateId);
      setCandidates(getCandidates());
      toast({
        title: "Vote counted!",
        description: "Thank you for voting",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to cast your vote",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <h1 className="page-header">Cast Your Vote</h1>
      
      {isVoted && (
        <Alert className="mb-8 bg-green-50 border-success">
          <AlertCircle className="h-4 w-4 text-success" />
          <AlertTitle className="text-success">Vote recorded</AlertTitle>
          <AlertDescription>
            Your vote has been successfully recorded. Thank you for participating!
          </AlertDescription>
        </Alert>
      )}
      
      {candidates.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No candidates available</h2>
          <p className="text-gray-500">Please wait for an admin to add candidates to the ballot.</p>
        </div>
      ) : (
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
      )}
    </Layout>
  );
};

export default Vote;

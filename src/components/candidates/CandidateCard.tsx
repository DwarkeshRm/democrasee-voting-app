
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Candidate } from '@/types';
import { Trash2 } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  isAdmin?: boolean;
  onVote?: (id: string) => void;
  onDelete?: (id: string) => void;
  isVoted: boolean;
  userVotedFor?: string;
}

const CandidateCard = ({ 
  candidate, 
  isAdmin = false, 
  onVote, 
  onDelete,
  isVoted,
  userVotedFor
}: CandidateCardProps) => {
  const showVoteButton = !isAdmin && !isVoted;
  const isVotedForThis = userVotedFor === candidate.id;

  return (
    <Card className={`transition-all duration-200 ${isVotedForThis ? 'ring-2 ring-success shadow-lg' : ''}`}>
      <CardHeader className="text-center">
        <h3 className="text-lg font-bold">{candidate.name}</h3>
      </CardHeader>
      <CardContent className="pt-0 flex justify-center">
        {candidate.symbol ? (
          <div className="relative w-32 h-32 rounded-full overflow-hidden flex items-center justify-center bg-blue-50 border border-blue-200 mb-4">
            <span className="text-6xl">{candidate.symbol}</span>
          </div>
        ) : (
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-4 border">
            {candidate.imageUrl ? (
              <img 
                src={candidate.imageUrl} 
                alt={candidate.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {isAdmin && onDelete && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(candidate.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Remove
          </Button>
        )}
        {showVoteButton && onVote && (
          <Button 
            onClick={() => onVote(candidate.id)}
            className="w-full"
          >
            Vote
          </Button>
        )}
        {isVotedForThis && (
          <span className="text-sm font-medium text-success flex items-center">
            You voted for this candidate
          </span>
        )}
        {isVoted && !isVotedForThis && (
          <Button variant="outline" disabled className="opacity-50 w-full">
            Vote
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CandidateCard;

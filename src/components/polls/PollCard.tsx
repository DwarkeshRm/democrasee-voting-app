
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Poll } from '@/types';
import { Calendar, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/services/votingService';

interface PollCardProps {
  poll: Poll;
  isAdmin?: boolean;
}

const PollCard = ({ poll, isAdmin = false }: PollCardProps) => {
  const navigate = useNavigate();
  const startDate = new Date(poll.startDate);
  const endDate = new Date(poll.endDate);
  const now = new Date();
  const user = getCurrentUser();
  
  const isActive = now >= startDate && now <= endDate;
  const hasEnded = now > endDate;
  const hasNotStarted = now < startDate;
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const handlePollClick = () => {
    if (isAdmin) {
      navigate(`/admin/polls/${poll.id}`);
    } else {
      if (isActive) {
        navigate(`/vote/${poll.id}`);
      } else if (hasEnded) {
        navigate(`/results?pollId=${poll.id}`);
      }
    }
  };
  
  return (
    <Card className="h-full flex flex-col transition-transform duration-300 hover:scale-[1.02] border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
        <h3 className="text-lg font-bold text-blue-800">{poll.title}</h3>
        <p className="text-sm text-gray-600">{poll.description}</p>
      </CardHeader>
      <CardContent className="flex-grow py-4">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
            <div>
              <div className="text-xs text-gray-500">Date</div>
              <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-blue-500" />
            <div>
              <div className="text-xs text-gray-500">Time</div>
              <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            {isActive && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border border-green-300">
                Active
              </Badge>
            )}
            {hasEnded && (
              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300">
                Ended
              </Badge>
            )}
            {hasNotStarted && (
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300">
                Upcoming
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gradient-to-r from-blue-50 to-purple-50 border-t border-blue-100">
        <Button 
          onClick={handlePollClick}
          className="w-full"
          variant={isAdmin ? "outline" : "default"}
          disabled={!isAdmin && hasNotStarted}
        >
          {isAdmin ? "Manage Poll" : 
            hasEnded ? "View Results" : 
            hasNotStarted ? "Not Started Yet" : 
            "Vote Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PollCard;

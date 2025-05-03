
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Poll } from '@/types';
import { Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PollCardProps {
  poll: Poll;
  isAdmin?: boolean;
}

const PollCard = ({ poll, isAdmin = false }: PollCardProps) => {
  const startDate = new Date(poll.startDate);
  const endDate = new Date(poll.endDate);
  const now = new Date();
  
  const isActive = now >= startDate && now <= endDate;
  const hasEnded = now > endDate;
  const hasNotStarted = now < startDate;
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <h3 className="text-lg font-bold">{poll.title}</h3>
        <p className="text-sm text-gray-500">{poll.description}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span>Start: {formatDate(startDate)}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>End: {formatDate(endDate)}</span>
          </div>
          <div className="mt-4">
            {isActive && (
              <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                Active
              </span>
            )}
            {hasEnded && (
              <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                Ended
              </span>
            )}
            {hasNotStarted && (
              <span className="inline-block px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                Upcoming
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {isAdmin ? (
          <Link to={`/admin/polls/${poll.id}`} className="w-full">
            <Button variant="outline" className="w-full">
              Manage Poll
            </Button>
          </Link>
        ) : (
          <Link to={`/vote/${poll.id}`} className="w-full">
            <Button 
              className="w-full"
              disabled={hasEnded || hasNotStarted}
            >
              {hasEnded ? "Voting Ended" : hasNotStarted ? "Not Started Yet" : "Vote Now"}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default PollCard;

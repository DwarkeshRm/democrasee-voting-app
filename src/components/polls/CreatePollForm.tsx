
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPoll, getCurrentUser } from '@/services/votingService';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreatePollFormProps {
  onPollCreated: () => void;
}

const CreatePollForm = ({ onPollCreated }: CreatePollFormProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('12:00');
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState('12:00');
  const [showSymbols, setShowSymbols] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.isAdmin) {
      toast({
        title: "Error",
        description: "You must be an admin to create polls",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim() || !description.trim() || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    // Create full start date with time
    const fullStartDate = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    fullStartDate.setHours(startHours, startMinutes);

    // Create full end date with time
    const fullEndDate = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    fullEndDate.setHours(endHours, endMinutes);
    
    // Validate dates - allowing today's date but not past dates
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to beginning of day for proper comparison
    
    if (fullStartDate < now) {
      toast({
        title: "Error",
        description: "Start date must be today or in the future",
        variant: "destructive",
      });
      return;
    }
    
    if (fullEndDate <= fullStartDate) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }
    
    const poll = createPoll({
      title,
      description,
      startDate: fullStartDate.toISOString(),
      endDate: fullEndDate.toISOString(),
      createdBy: currentUser.id,
      showSymbols
    });
    
    if (poll) {
      toast({
        title: "Success",
        description: "Poll created successfully",
      });
      setTitle('');
      setDescription('');
      setStartDate(undefined);
      setEndDate(undefined);
      setStartTime('12:00');
      setEndTime('12:00');
      setShowSymbols(false);
      onPollCreated();
    } else {
      toast({
        title: "Error",
        description: "Failed to create poll",
        variant: "destructive",
      });
    }
  };
  
  // Helper function to get today's date with time set to 00:00:00
  const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-100/50 to-purple-100/50">
        <CardTitle className="text-blue-800">Create New Poll</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Poll Title</Label>
            <Input 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter poll title"
              className="border-blue-200 focus:border-blue-400"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter poll description"
              className="border-blue-200 focus:border-blue-400"
              required
            />
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal border-blue-200",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date) => {
                        const today = getTodayStart();
                        return date < today;
                      }}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input 
                  id="startTime" 
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border-blue-200 focus:border-blue-400"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal border-blue-200",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => {
                        const today = getTodayStart();
                        return date < today || (startDate ? date < startDate : false);
                      }}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input 
                  id="endTime" 
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="border-blue-200 focus:border-blue-400"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="showSymbols" 
              checked={showSymbols} 
              onCheckedChange={setShowSymbols} 
            />
            <Label htmlFor="showSymbols">Provide symbols for candidates instead of image URLs</Label>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            Create Poll
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePollForm;

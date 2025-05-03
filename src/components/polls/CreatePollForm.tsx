
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPoll, getCurrentUser } from '@/services/votingService';

interface CreatePollFormProps {
  onPollCreated: () => void;
}

const CreatePollForm = ({ onPollCreated }: CreatePollFormProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
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
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (start < now) {
      toast({
        title: "Error",
        description: "Start date must be in the future",
        variant: "destructive",
      });
      return;
    }
    
    if (end <= start) {
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
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      createdBy: currentUser.id  // Add the createdBy property with the current user's ID
    });
    
    if (poll) {
      toast({
        title: "Success",
        description: "Poll created successfully",
      });
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      onPollCreated();
    } else {
      toast({
        title: "Error",
        description: "Failed to create poll",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Poll</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Poll Title</Label>
            <Input 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter poll title"
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
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time</Label>
              <Input 
                id="startDate" 
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input 
                id="endDate" 
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            Create Poll
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePollForm;

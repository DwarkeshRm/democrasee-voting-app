
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  addCandidate, 
  getCurrentUser,
  getPollById,
  candidateSymbols,
  hasUserRegisteredAsCandidate
} from '@/services/votingService';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CandidateRegistrationFormProps {
  pollId: string;
  onCandidateAdded: () => void;
}

const CandidateRegistrationForm = ({ pollId, onCandidateAdded }: CandidateRegistrationFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [showSymbols, setShowSymbols] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  
  useEffect(() => {
    if (pollId) {
      const poll = getPollById(pollId);
      if (poll) {
        setShowSymbols(poll.showSymbols || false);
      }
      
      // Check if user has already registered as a candidate for this poll
      const currentUser = getCurrentUser();
      if (currentUser && hasUserRegisteredAsCandidate(currentUser.id, pollId)) {
        setAlreadyRegistered(true);
      } else {
        setAlreadyRegistered(false);
      }
    }
  }, [pollId]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to register a candidate",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user has already registered as a candidate for this poll
    if (hasUserRegisteredAsCandidate(currentUser.id, pollId)) {
      toast({
        title: "Error",
        description: "You have already registered as a candidate for this poll",
        variant: "destructive",
      });
      return;
    }
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a candidate name",
        variant: "destructive",
      });
      return;
    }
    
    if (!showSymbols && !imageUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter an image URL",
        variant: "destructive",
      });
      return;
    }
    
    if (showSymbols && !selectedSymbol) {
      toast({
        title: "Error",
        description: "Please select a symbol for the candidate",
        variant: "destructive",
      });
      return;
    }
    
    const candidate = showSymbols 
      ? addCandidate({ name, pollId, symbol: selectedSymbol })
      : addCandidate({ name, pollId, imageUrl });
    
    if (candidate) {
      toast({
        title: "Success",
        description: "Candidate registered successfully",
      });
      setName('');
      setImageUrl('');
      setSelectedSymbol('');
      setAlreadyRegistered(true);
      onCandidateAdded();
    } else {
      toast({
        title: "Error",
        description: "Failed to register candidate",
        variant: "destructive",
      });
    }
  };
  
  if (alreadyRegistered) {
    return (
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Already Registered</AlertTitle>
        <AlertDescription className="text-yellow-700">
          You have already registered as a candidate for this poll. One account can only register once per poll.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-blue-50 border-2 border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-100/50 to-blue-100/30">
        <CardTitle className="text-blue-800">Register as Candidate</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Candidate Name</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter candidate name"
              className="border-blue-200"
              required
            />
          </div>
          
          {showSymbols ? (
            <div className="space-y-2">
              <Label>Select a Symbol</Label>
              <RadioGroup
                value={selectedSymbol}
                onValueChange={setSelectedSymbol}
                className="grid grid-cols-4 gap-4"
              >
                {candidateSymbols.map((symbol) => (
                  <div key={symbol.id} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={symbol.icon} 
                      id={symbol.id}
                      className="peer sr-only" 
                    />
                    <Label
                      htmlFor={symbol.id}
                      className="flex flex-col items-center justify-center rounded-md border-2 border-blue-200 bg-white p-4 hover:bg-blue-50 hover:border-blue-500 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-100 cursor-pointer"
                    >
                      <span className="text-3xl">{symbol.icon}</span>
                      <span className="mt-2 text-xs text-gray-500">{symbol.name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input 
                id="imageUrl" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="border-blue-200"
                required
              />
              <p className="text-xs text-gray-500">
                Enter a URL for the candidate's image (portrait or logo recommended)
              </p>
            </div>
          )}
          
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Register Candidate
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CandidateRegistrationForm;

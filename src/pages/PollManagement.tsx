import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  getCurrentUser, 
  getPollById,
  getCandidates,
  resetVoting,
  removeCandidate,
  deletePoll,
  updatePollTiming,
  generateShareableLink
} from '@/services/votingService';
import { Candidate, Poll } from '@/types';
import Layout from '@/components/layout/Layout';
import CandidateCard from '@/components/candidates/CandidateCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Calendar, Clock, FileText, Link, RefreshCw, Share, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from "date-fns";

const PollManagement = () => {
  const { pollId } = useParams<{ pollId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditTimingDialog, setShowEditTimingDialog] = useState(false);
  const [newStartDate, setNewStartDate] = useState<Date | undefined>(undefined);
  const [newEndDate, setNewEndDate] = useState<Date | undefined>(undefined);
  const [shareableLink, setShareableLink] = useState('');
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  
  // Helper function to get today's date with time set to 00:00:00
  const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };
  
  useEffect(() => {
    // Check if user is admin
    const user = getCurrentUser();
    if (!user || !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    if (!pollId) {
      navigate('/admin');
      return;
    }
    
    // Load poll
    const loadedPoll = getPollById(pollId);
    
    if (!loadedPoll) {
      toast({
        title: "Error",
        description: "Poll not found",
        variant: "destructive",
      });
      navigate('/admin');
      return;
    }
    
    setPoll(loadedPoll);
    setNewStartDate(new Date(loadedPoll.startDate));
    setNewEndDate(new Date(loadedPoll.endDate));
    setShareableLink(generateShareableLink(pollId));
    
    // Load candidates
    loadCandidates();
    setLoading(false);
  }, [pollId, navigate, toast]);
  
  const loadCandidates = () => {
    if (!pollId) return;
    
    const pollCandidates = getCandidates(pollId);
    setCandidates(pollCandidates);
    setTotalVotes(pollCandidates.reduce((sum, c) => sum + c.votes, 0));
  };
  
  const handleReset = () => {
    if (!pollId) return;
    
    if (window.confirm('Are you sure you want to reset all votes for this poll?')) {
      const success = resetVoting(pollId);
      
      if (success) {
        loadCandidates();
        toast({
          title: "Success",
          description: "All votes have been reset",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to reset votes",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleExportToPdf = () => {
    navigate(`/results?pollId=${pollId}`);
  };
  
  const handleRemoveCandidate = (candidateId: string) => {
    if (removeCandidate(candidateId)) {
      loadCandidates();
      toast({
        title: "Success",
        description: "Candidate removed successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to remove candidate",
        variant: "destructive",
      });
    }
  };

  const handleDeletePoll = () => {
    if (!pollId) return;
    
    const success = deletePoll(pollId);
    if (success) {
      toast({
        title: "Success",
        description: "Poll deleted successfully",
      });
      navigate('/admin');
    } else {
      toast({
        title: "Error",
        description: "Failed to delete poll",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTiming = () => {
    if (!pollId || !newStartDate || !newEndDate) return;
    
    const success = updatePollTiming(
      pollId,
      newStartDate.toISOString(),
      newEndDate.toISOString()
    );
    
    if (success) {
      // Update local poll state
      const updatedPoll = getPollById(pollId);
      if (updatedPoll) {
        setPoll(updatedPoll);
      }
      
      setShowEditTimingDialog(false);
      toast({
        title: "Success",
        description: "Poll timing updated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update poll timing",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setIsLinkCopied(true);
    toast({
      title: "Link Copied",
      description: "Shareable link copied to clipboard",
    });
    setTimeout(() => setIsLinkCopied(false), 3000);
  };
  
  const colors = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'];
  
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
  
  const now = new Date();
  const startDate = new Date(poll.startDate);
  const endDate = new Date(poll.endDate);
  const hasStarted = now >= startDate;
  const hasEnded = now > endDate;
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Poll Management</h1>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          Back to Admin
        </Button>
      </div>
      
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100 shadow-md">
        <CardHeader>
          <h2 className="text-xl font-bold text-blue-800">{poll.title}</h2>
          <p className="text-gray-600">{poll.description}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium">{new Date(poll.startDate).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium">{new Date(poll.endDate).toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {hasStarted && !hasEnded && (
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium border border-green-200">
                Active
              </span>
            )}
            {hasEnded && (
              <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium border border-gray-200">
                Ended
              </span>
            )}
            {!hasStarted && (
              <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium border border-yellow-200">
                Upcoming
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <Button 
              variant="outline" 
              className="bg-white hover:bg-gray-50"
              onClick={() => setShowEditTimingDialog(true)}
              disabled={hasEnded}
            >
              <Calendar className="h-4 w-4 mr-2" /> Edit Timing
            </Button>
            
            <Button 
              variant="outline"
              className="bg-white hover:bg-gray-50"
              onClick={handleCopyLink}
            >
              <Share className="h-4 w-4 mr-2" /> 
              {isLinkCopied ? "Copied!" : "Share Link"}
            </Button>
            
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50 bg-white"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash className="h-4 w-4 mr-2" /> Delete Poll
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          variant="outline" 
          className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200"
          onClick={handleReset}
          disabled={!hasStarted}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Reset All Votes
        </Button>
        
        <Button 
          variant="outline"
          className="bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200"
          onClick={handleExportToPdf}
        >
          <FileText className="h-4 w-4 mr-2" /> Export Results (PDF)
        </Button>
      </div>
      
      <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-100">
        <div className="flex items-start mb-2">
          <Link className="h-5 w-5 mr-2 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">Shareable Link</h3>
            <p className="text-sm text-gray-600 mb-2">Share this link with voters to let them access this poll directly:</p>
          </div>
        </div>
        <div className="flex items-center">
          <Input 
            value={shareableLink} 
            readOnly 
            className="mr-2 bg-white border-blue-200"
          />
          <Button onClick={handleCopyLink} variant="outline" className="whitespace-nowrap bg-white">
            {isLinkCopied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="candidates" className="w-full">
        <TabsList className="mb-4 bg-blue-100 p-1">
          <TabsTrigger value="candidates" className="data-[state=active]:bg-white">Candidates</TabsTrigger>
          {hasEnded && (
            <TabsTrigger value="results" className="data-[state=active]:bg-white">Results</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="candidates">
          {candidates.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No candidates</AlertTitle>
              <AlertDescription>
                There are no candidates registered for this poll.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  isAdmin={true}
                  onDelete={handleRemoveCandidate}
                  isVoted={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        {hasEnded && (
          <TabsContent value="results">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader className="border-b">
                    <h2 className="text-xl font-bold">Vote Distribution</h2>
                  </CardHeader>
                  <CardContent className="pt-6 h-[400px]">
                    {totalVotes > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={candidates}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end"
                            height={70}
                            interval={0}
                          />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`${value} votes`, 'Votes']} 
                            labelFormatter={(label) => `Candidate: ${label}`}
                          />
                          <Bar dataKey="votes" name="Votes">
                            {candidates.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No votes have been cast yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader className="border-b">
                    <h2 className="text-xl font-bold">Vote Counts</h2>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {candidates.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 font-bold border-b pb-2">
                          <div>Candidate</div>
                          <div className="text-right">Votes</div>
                        </div>
                        
                        {candidates.map((candidate) => (
                          <div key={candidate.id} className="grid grid-cols-2 gap-2">
                            <div>{candidate.name}</div>
                            <div className="text-right">
                              {candidate.votes} ({totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0}%)
                            </div>
                          </div>
                        ))}
                        
                        <div className="border-t pt-2 grid grid-cols-2 gap-2 font-bold">
                          <div>Total Votes</div>
                          <div className="text-right">{totalVotes}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No candidates available.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Delete Poll Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this poll?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the poll,
              all its candidates, and all votes associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePoll} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Timing Dialog */}
      <AlertDialog open={showEditTimingDialog} onOpenChange={setShowEditTimingDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Poll Timing</AlertDialogTitle>
            <AlertDialogDescription>
              Adjust the start and end dates for this poll.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="startDate"
                    variant={"outline"}
                    className="justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newStartDate ? format(newStartDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={newStartDate}
                    onSelect={setNewStartDate}
                    initialFocus
                    disabled={(date) => {
                      const today = getTodayStart();
                      return date < today;
                    }}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={newStartDate ? format(newStartDate, "HH:mm") : ""}
                onChange={(e) => {
                  if (newStartDate) {
                    const [hours, minutes] = e.target.value.split(':');
                    const newDate = new Date(newStartDate);
                    newDate.setHours(parseInt(hours), parseInt(minutes));
                    setNewStartDate(newDate);
                  }
                }}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="endDate"
                    variant={"outline"}
                    className="justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newEndDate ? format(newEndDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={newEndDate}
                    onSelect={setNewEndDate}
                    initialFocus
                    disabled={(date) => {
                      const today = getTodayStart();
                      return date < today || (newStartDate ? date < newStartDate : false);
                    }}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={newEndDate ? format(newEndDate, "HH:mm") : ""}
                onChange={(e) => {
                  if (newEndDate) {
                    const [hours, minutes] = e.target.value.split(':');
                    const newDate = new Date(newEndDate);
                    newDate.setHours(parseInt(hours), parseInt(minutes));
                    setNewEndDate(newDate);
                  }
                }}
              />
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={handleUpdateTiming} disabled={!newStartDate || !newEndDate}>
              Update Timing
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default PollManagement;

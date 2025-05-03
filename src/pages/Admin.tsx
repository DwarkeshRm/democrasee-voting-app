
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { addCandidate, getCandidates, removeCandidate, resetVoting, exportCandidatesToJson } from '@/services/votingService';
import Layout from '@/components/layout/Layout';
import CandidateCard from '@/components/candidates/CandidateCard';
import { AlertCircle, Download, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Admin = () => {
  const { toast } = useToast();
  const [candidateName, setCandidateName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [candidates, setCandidates] = useState(() => getCandidates());

  const handleAddCandidate = () => {
    if (!candidateName.trim()) {
      toast({
        title: "Error",
        description: "Candidate name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      addCandidate({ name: candidateName, imageUrl });
      setCandidates(getCandidates());
      setCandidateName('');
      setImageUrl('');
      toast({
        title: "Success",
        description: "Candidate added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add candidate",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCandidate = (id: string) => {
    if (removeCandidate(id)) {
      setCandidates(getCandidates());
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

  const handleResetVoting = () => {
    if (resetVoting()) {
      setCandidates(getCandidates());
      toast({
        title: "Success",
        description: "Voting has been reset",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to reset voting",
        variant: "destructive",
      });
    }
  };

  const handleExportResults = () => {
    exportCandidatesToJson();
    toast({
      title: "Success",
      description: "Results exported successfully",
    });
  };

  return (
    <Layout>
      <h1 className="page-header">Admin Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <h2 className="text-xl font-bold">Add New Candidate</h2>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Candidate Name</Label>
                  <Input 
                    id="name" 
                    value={candidateName} 
                    onChange={(e) => setCandidateName(e.target.value)} 
                    placeholder="Enter candidate name"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input 
                    id="image" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    placeholder="Enter image URL (optional)"
                  />
                </div>
                
                <Button onClick={handleAddCandidate} className="w-full">
                  Add Candidate
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={handleResetVoting}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Reset All Votes
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportResults}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" /> Export Results (JSON)
            </Button>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Current Candidates</h2>
          {candidates.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No candidates</AlertTitle>
              <AlertDescription>
                Add a candidate to get started with the voting process.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
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
        </div>
      </div>
    </Layout>
  );
};

export default Admin;

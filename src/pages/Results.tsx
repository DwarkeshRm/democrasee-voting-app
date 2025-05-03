
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCurrentUser, 
  getPolls,
  getPollById,
  getCandidates, 
  exportPollResultsToJson
} from '@/services/votingService';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Poll, Candidate } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Results = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  
  useEffect(() => {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
      navigate('/');
      return;
    }
    
    const allPolls = getPolls();
    setPolls(allPolls);
    
    if (allPolls.length > 0) {
      setSelectedPollId(allPolls[0].id);
    }
  }, [navigate]);
  
  useEffect(() => {
    if (selectedPollId) {
      const poll = getPollById(selectedPollId);
      setSelectedPoll(poll);
      
      const pollCandidates = getCandidates(selectedPollId);
      setCandidates(pollCandidates);
      setTotalVotes(pollCandidates.reduce((sum, c) => sum + c.votes, 0));
    }
  }, [selectedPollId]);
  
  const handleExportToJson = () => {
    if (selectedPollId) {
      exportPollResultsToJson(selectedPollId);
    }
  };
  
  const handleExportToPdf = () => {
    if (!selectedPoll) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Election Results: ${selectedPoll.title}`, 14, 22);
    
    // Add description
    doc.setFontSize(12);
    doc.text(`${selectedPoll.description}`, 14, 32);
    
    // Add date information
    const startDate = new Date(selectedPoll.startDate).toLocaleString();
    const endDate = new Date(selectedPoll.endDate).toLocaleString();
    doc.setFontSize(10);
    doc.text(`Poll period: ${startDate} - ${endDate}`, 14, 42);
    doc.text(`Total votes: ${totalVotes}`, 14, 48);
    
    // Create the table
    const tableData = candidates.map(candidate => [
      candidate.name, 
      candidate.votes.toString(),
      totalVotes > 0 ? `${Math.round((candidate.votes / totalVotes) * 100)}%` : '0%'
    ]);
    
    autoTable(doc, {
      head: [['Candidate', 'Votes', 'Percentage']],
      body: tableData,
      startY: 55,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Add footer with timestamp
    const timestamp = new Date().toLocaleString();
    const pageCount = doc.internal.pages.length - 1;
    doc.setFontSize(8);
    doc.text(`Generated on: ${timestamp} - DemocraSee Voting System`, 14, doc.internal.pageSize.height - 10);
    
    // Save the PDF
    doc.save(`${selectedPoll.title}_results.pdf`);
  };
  
  const colors = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'];
  
  if (polls.length === 0) {
    return (
      <Layout>
        <h1 className="page-header">Election Results</h1>
        <div className="text-center p-10">
          <p>No polls available to show results.</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Election Results</h1>
        {selectedPollId && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportToJson}>
              <Download className="h-4 w-4 mr-2" /> Export to JSON
            </Button>
            <Button variant="outline" onClick={handleExportToPdf}>
              <FileText className="h-4 w-4 mr-2" /> Export to PDF
            </Button>
          </div>
        )}
      </div>
      
      <Tabs 
        value={selectedPollId || ""} 
        onValueChange={setSelectedPollId}
        className="w-full mb-8"
      >
        <TabsList className="mb-4 flex flex-wrap">
          {polls.map((poll) => (
            <TabsTrigger key={poll.id} value={poll.id}>
              {poll.title}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {polls.map((poll) => (
          <TabsContent key={poll.id} value={poll.id}>
            {selectedPoll && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold">{selectedPoll.title}</h2>
                <p className="text-gray-500">{selectedPoll.description}</p>
              </div>
            )}
            
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
        ))}
      </Tabs>
    </Layout>
  );
};

export default Results;

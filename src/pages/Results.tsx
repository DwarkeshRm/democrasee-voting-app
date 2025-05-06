
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  getCurrentUser, 
  getPolls,
  getPollById,
  getCandidates
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
  const [searchParams] = useSearchParams();
  const urlPollId = searchParams.get('pollId');
  
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
    
    // Filter polls that have ended or if user is admin
    const visiblePolls = allPolls.filter(poll => {
      const endDate = new Date(poll.endDate);
      return new Date() > endDate || user.isAdmin;
    });
    
    setPolls(visiblePolls);
    
    // Use pollId from URL if provided, otherwise use first poll
    if (urlPollId) {
      setSelectedPollId(urlPollId);
    } else if (visiblePolls.length > 0) {
      setSelectedPollId(visiblePolls[0].id);
    }
  }, [navigate, urlPollId]);
  
  useEffect(() => {
    if (selectedPollId) {
      const poll = getPollById(selectedPollId);
      setSelectedPoll(poll);
      
      const pollCandidates = getCandidates(selectedPollId);
      setCandidates(pollCandidates);
      setTotalVotes(pollCandidates.reduce((sum, c) => sum + c.votes, 0));
    }
  }, [selectedPollId]);
  
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
    const user = getCurrentUser();
    return (
      <Layout>
        <h1 className="page-header">Election Results</h1>
        <div className="text-center p-10">
          <p className="mb-4">No polls available to show results.</p>
          {user?.isAdmin && (
            <Button onClick={() => navigate('/admin')}>Go to Admin Panel</Button>
          )}
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Election Results</h1>
        {selectedPollId && (
          <div className="flex space-x-2">
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
        <TabsList className="mb-4 flex flex-wrap bg-blue-100/50 p-1 rounded-lg">
          {polls.map((poll) => (
            <TabsTrigger 
              key={poll.id} 
              value={poll.id}
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              {poll.title}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {polls.map((poll) => (
          <TabsContent key={poll.id} value={poll.id}>
            {selectedPoll && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 shadow-sm">
                <h2 className="text-xl font-semibold text-blue-800">{selectedPoll.title}</h2>
                <p className="text-gray-600">{selectedPoll.description}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="font-medium mr-1">Start:</span> 
                    {new Date(selectedPoll.startDate).toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">End:</span> 
                    {new Date(selectedPoll.endDate).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <Card className="border-2 border-blue-100 shadow-md">
                  <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100">
                    <h2 className="text-xl font-bold text-blue-800">Vote Distribution</h2>
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
                          <Bar dataKey="votes" name="Votes" radius={[4, 4, 0, 0]}>
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
                <Card className="border-2 border-blue-100 shadow-md">
                  <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100">
                    <h2 className="text-xl font-bold text-blue-800">Vote Counts</h2>
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
                            <div className="flex items-center">
                              {candidate.symbol ? (
                                <span className="text-lg mr-2">{candidate.symbol}</span>
                              ) : null}
                              {candidate.name}
                            </div>
                            <div className="text-right">
                              <span className="font-semibold">{candidate.votes}</span> 
                              <span className="text-gray-500 ml-1">
                                ({totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0}%)
                              </span>
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


import { useState, useEffect } from 'react';
import { getCandidates, exportCandidatesToJson } from '@/services/votingService';
import { Candidate } from '@/types';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Results = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  
  useEffect(() => {
    const loadedCandidates = getCandidates();
    setCandidates(loadedCandidates);
    setTotalVotes(loadedCandidates.reduce((sum, c) => sum + c.votes, 0));
  }, []);
  
  const handleExport = () => {
    exportCandidatesToJson();
  };
  
  const colors = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'];
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Election Results</h1>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export Results
        </Button>
      </div>
      
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
    </Layout>
  );
};

export default Results;


import { getPollById } from './pollService';
import { getCandidates } from './candidateService';

// Export results to JSON file
export const exportPollResultsToJson = (pollId: string): void => {
  const poll = getPollById(pollId);
  const candidates = getCandidates(pollId);
  
  const results = {
    poll,
    candidates,
    totalVotes: candidates.reduce((sum, c) => sum + c.votes, 0),
    exportedAt: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(results, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportFileDefaultName = `democrasee_results_${poll?.title || pollId}_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};


import { Candidate } from '@/types';

// Local storage keys
const CANDIDATES_KEY = 'democrasee_candidates';
const VOTED_KEY = 'democrasee_voted';

// Initialize default data if none exists
const initializeData = (): void => {
  if (!localStorage.getItem(CANDIDATES_KEY)) {
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify([]));
  }
};

// Get all candidates
export const getCandidates = (): Candidate[] => {
  initializeData();
  try {
    const data = localStorage.getItem(CANDIDATES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
};

// Add a candidate
export const addCandidate = (candidate: Omit<Candidate, 'id' | 'votes'>): Candidate => {
  try {
    const candidates = getCandidates();
    const newCandidate: Candidate = {
      ...candidate,
      id: Date.now().toString(),
      votes: 0
    };
    
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify([...candidates, newCandidate]));
    return newCandidate;
  } catch (error) {
    console.error('Error adding candidate:', error);
    throw new Error('Failed to add candidate');
  }
};

// Vote for a candidate
export const voteForCandidate = (candidateId: string): boolean => {
  try {
    // Check if user has already voted
    const hasVoted = localStorage.getItem(VOTED_KEY) === 'true';
    if (hasVoted) {
      return false;
    }
    
    const candidates = getCandidates();
    const updatedCandidates = candidates.map(candidate => 
      candidate.id === candidateId 
        ? { ...candidate, votes: candidate.votes + 1 } 
        : candidate
    );
    
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(updatedCandidates));
    localStorage.setItem(VOTED_KEY, 'true');
    
    return true;
  } catch (error) {
    console.error('Error voting for candidate:', error);
    return false;
  }
};

// Check if user has already voted
export const hasUserVoted = (): boolean => {
  return localStorage.getItem(VOTED_KEY) === 'true';
};

// Reset voting (admin function)
export const resetVoting = (): boolean => {
  try {
    const candidates = getCandidates();
    const resetCandidates = candidates.map(candidate => ({ ...candidate, votes: 0 }));
    
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(resetCandidates));
    localStorage.removeItem(VOTED_KEY);
    
    return true;
  } catch (error) {
    console.error('Error resetting votes:', error);
    return false;
  }
};

// Remove a candidate (admin function)
export const removeCandidate = (candidateId: string): boolean => {
  try {
    const candidates = getCandidates();
    const filteredCandidates = candidates.filter(candidate => candidate.id !== candidateId);
    
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(filteredCandidates));
    return true;
  } catch (error) {
    console.error('Error removing candidate:', error);
    return false;
  }
};

// Export candidates to JSON file
export const exportCandidatesToJson = (): void => {
  const candidates = getCandidates();
  const dataStr = JSON.stringify(candidates, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportFileDefaultName = `democrasee_results_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};


import { Vote, Candidate } from '@/types';
import { VOTES_KEY, CANDIDATES_KEY } from './localStorage/keys';
import { initializeData } from './localStorage/initialize';
import { getCurrentUser } from './userService';
import { getPollById } from './pollService';

// Vote management
export const getVotes = (): Vote[] => {
  initializeData();
  try {
    const data = localStorage.getItem(VOTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error fetching votes:', error);
    return [];
  }
};

export const hasUserVotedInPoll = (userId: string, pollId: string): boolean => {
  try {
    const votes = getVotes();
    return votes.some(vote => vote.userId === userId && vote.pollId === pollId);
  } catch (error) {
    console.error('Error checking if user voted:', error);
    return false;
  }
};

export const getUserVoteInPoll = (userId: string, pollId: string): string | undefined => {
  try {
    const votes = getVotes();
    const vote = votes.find(vote => vote.userId === userId && vote.pollId === pollId);
    return vote?.candidateId;
  } catch (error) {
    console.error('Error getting user vote:', error);
    return undefined;
  }
};

export const voteForCandidate = (pollId: string, candidateId: string): boolean => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    // Check if user has already voted in this poll
    if (hasUserVotedInPoll(currentUser.id, pollId)) {
      return false;
    }
    
    // Add vote record
    const votes = getVotes();
    const newVote: Vote = {
      userId: currentUser.id,
      pollId,
      candidateId,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(VOTES_KEY, JSON.stringify([...votes, newVote]));
    
    // Update candidate votes
    const candidates = getCandidates();
    const updatedCandidates = candidates.map(candidate => 
      candidate.id === candidateId 
        ? { ...candidate, votes: candidate.votes + 1 } 
        : candidate
    );
    
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(updatedCandidates));
    
    return true;
  } catch (error) {
    console.error('Error voting for candidate:', error);
    return false;
  }
};

// Helper function to get candidates (to avoid circular dependencies)
const getCandidates = (pollId?: string): Candidate[] => {
  try {
    const data = localStorage.getItem(CANDIDATES_KEY);
    const candidates = data ? JSON.parse(data) : [];
    
    if (pollId) {
      return candidates.filter((candidate: Candidate) => candidate.pollId === pollId);
    }
    
    return candidates;
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
};

// Reset voting (admin function)
export const resetVoting = (pollId: string): boolean => {
  try {
    const candidates = getCandidates();
    const resetCandidates = candidates.map(candidate => 
      candidate.pollId === pollId 
        ? { ...candidate, votes: 0 } 
        : candidate
    );
    
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(resetCandidates));
    
    // Remove votes for this poll
    const votes = getVotes();
    const filteredVotes = votes.filter(vote => vote.pollId !== pollId);
    localStorage.setItem(VOTES_KEY, JSON.stringify(filteredVotes));
    
    return true;
  } catch (error) {
    console.error('Error resetting votes:', error);
    return false;
  }
};

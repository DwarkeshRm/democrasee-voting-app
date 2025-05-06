
import { Poll } from '@/types';
import { POLLS_KEY } from './localStorage/keys';
import { initializeData } from './localStorage/initialize';
import { getCurrentUser } from './userService';

// Poll management
export const getPolls = (): Poll[] => {
  initializeData();
  try {
    const data = localStorage.getItem(POLLS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error fetching polls:', error);
    return [];
  }
};

export const createPoll = (poll: Omit<Poll, 'id' | 'isActive'>): Poll | null => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser?.isAdmin) {
      return null; // Only admins can create polls
    }

    const polls = getPolls();
    const newPoll: Poll = {
      ...poll,
      id: Date.now().toString(),
      isActive: false, // Polls start as inactive until start date
      createdBy: currentUser.id,
      showSymbols: poll.showSymbols || false // Add default value for showSymbols
    };
    
    localStorage.setItem(POLLS_KEY, JSON.stringify([...polls, newPoll]));
    return newPoll;
  } catch (error) {
    console.error('Error creating poll:', error);
    return null;
  }
};

export const deletePoll = (pollId: string): boolean => {
  try {
    const polls = getPolls();
    const filteredPolls = polls.filter(poll => poll.id !== pollId);
    
    if (filteredPolls.length === polls.length) {
      return false; // No poll was found to delete
    }
    
    localStorage.setItem(POLLS_KEY, JSON.stringify(filteredPolls));
    return true;
  } catch (error) {
    console.error('Error deleting poll:', error);
    return false;
  }
};

export const updatePollTiming = (pollId: string, startDate: string, endDate: string): boolean => {
  try {
    const polls = getPolls();
    const pollIndex = polls.findIndex(poll => poll.id === pollId);
    
    if (pollIndex === -1) {
      return false;
    }
    
    polls[pollIndex] = {
      ...polls[pollIndex],
      startDate,
      endDate
    };
    
    localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
    return true;
  } catch (error) {
    console.error('Error updating poll timing:', error);
    return false;
  }
};

export const updatePollStatus = (): void => {
  try {
    const polls = getPolls();
    const now = new Date().toISOString();
    
    const updatedPolls = polls.map(poll => {
      const startDate = new Date(poll.startDate).toISOString();
      const endDate = new Date(poll.endDate).toISOString();
      
      // If current time is between start and end dates, poll is active
      const isActive = now >= startDate && now <= endDate;
      
      return { ...poll, isActive };
    });
    
    localStorage.setItem(POLLS_KEY, JSON.stringify(updatedPolls));
  } catch (error) {
    console.error('Error updating poll status:', error);
  }
};

export const getPollById = (pollId: string): Poll | null => {
  try {
    const polls = getPolls();
    return polls.find(poll => poll.id === pollId) || null;
  } catch (error) {
    console.error('Error getting poll:', error);
    return null;
  }
};

// Cancel a poll (admin function)
export const cancelPoll = (pollId: string): boolean => {
  try {
    const poll = getPollById(pollId);
    if (!poll) return false;
    
    const now = new Date();
    const endDate = new Date(poll.endDate);
    
    // Can't cancel if poll has already ended
    if (now > endDate) return false;
    
    const polls = getPolls();
    const updatedPolls = polls.map(p => 
      p.id === pollId ? { ...p, isActive: false, endDate: new Date().toISOString() } : p
    );
    
    localStorage.setItem(POLLS_KEY, JSON.stringify(updatedPolls));
    return true;
  } catch (error) {
    console.error('Error canceling poll:', error);
    return false;
  }
};

// Check poll status (if it has candidates or is expired)
export const getPollStatus = (pollId: string): { 
  hasStarted: boolean, 
  hasEnded: boolean, 
  candidateCount: number 
} => {
  const poll = getPollById(pollId);
  const now = new Date();
  
  if (!poll) {
    return { hasStarted: false, hasEnded: true, candidateCount: 0 };
  }
  
  const startDate = new Date(poll.startDate);
  const endDate = new Date(poll.endDate);
  
  // Need to import candidateService to get candidate count, but to avoid circular dependencies
  // we'll load candidates directly here
  const CANDIDATES_KEY = 'democrasee_candidates';
  let candidates = [];
  try {
    const data = localStorage.getItem(CANDIDATES_KEY);
    candidates = data ? JSON.parse(data).filter((c: any) => c.pollId === pollId) : [];
  } catch (error) {
    console.error('Error loading candidates:', error);
  }
  
  return {
    hasStarted: now >= startDate,
    hasEnded: now > endDate,
    candidateCount: candidates.length
  };
};

// Generate shareable links for polls
export const generateShareableLink = (pollId: string, type: 'vote' | 'candidate' = 'vote'): string => {
  // Create clean URL without any AI service or internal names
  const baseUrl = window.location.origin;
  if (type === 'vote') {
    return `${baseUrl}/vote/${pollId}`;
  } else {
    return `${baseUrl}/candidate-registration?pollId=${pollId}`;
  }
};

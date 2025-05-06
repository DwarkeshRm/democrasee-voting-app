
import { User, Poll, Candidate, Vote } from '@/types';

// Local storage keys
const CANDIDATES_KEY = 'democrasee_candidates';
const USERS_KEY = 'democrasee_users';
const POLLS_KEY = 'democrasee_polls';
const VOTES_KEY = 'democrasee_votes';
const CURRENT_USER_KEY = 'democrasee_current_user';

// Initialize default data if none exists
const initializeData = (): void => {
  if (!localStorage.getItem(CANDIDATES_KEY)) {
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(USERS_KEY)) {
    // Create a default admin user
    const defaultAdmin: User = {
      id: 'admin1',
      username: 'admin',
      password: 'admin123', // In a real app, this would be hashed
      isAdmin: true
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
  }
  if (!localStorage.getItem(POLLS_KEY)) {
    localStorage.setItem(POLLS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(VOTES_KEY)) {
    localStorage.setItem(VOTES_KEY, JSON.stringify([]));
  }
};

// Reset all users (except admin)
export const resetAllUsers = (): void => {
  const defaultAdmin: User = {
    id: 'admin1',
    username: 'admin',
    password: 'admin123', // In a real app, this would be hashed
    isAdmin: true
  };
  localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
  logout(); // Logout current user to ensure clean state
};

// User management
export const getUsers = (): User[] => {
  initializeData();
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const registerUser = (username: string, password: string, isAdmin: boolean = false): User | null => {
  try {
    const users = getUsers();
    // Check if username already exists
    if (users.find(user => user.username === username)) {
      return null;
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password, // In a real app, this would be hashed
      isAdmin
    };
    
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    return newUser;
  } catch (error) {
    console.error('Error registering user:', error);
    return null;
  }
};

export const login = (username: string, password: string): User | null => {
  try {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      // Store current user in session
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      console.log("User logged in successfully:", user);
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem(CURRENT_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

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
    
    // Also delete all candidates and votes for this poll
    const candidates = getCandidates();
    const filteredCandidates = candidates.filter(candidate => candidate.pollId !== pollId);
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(filteredCandidates));
    
    const votes = getVotes();
    const filteredVotes = votes.filter(vote => vote.pollId !== pollId);
    localStorage.setItem(VOTES_KEY, JSON.stringify(filteredVotes));
    
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

// Candidate management
export const getCandidates = (pollId?: string): Candidate[] => {
  initializeData();
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

// Check if user has already registered as a candidate in this poll
export const hasUserRegisteredAsCandidate = (userId: string, pollId: string): boolean => {
  try {
    const candidates = getCandidates(pollId);
    return candidates.some(candidate => candidate.userId === userId);
  } catch (error) {
    console.error('Error checking candidate registration:', error);
    return false;
  }
};

export const addCandidate = (candidate: Omit<Candidate, 'id' | 'votes'>): Candidate | null => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    // Check if user has already registered as a candidate in this poll
    if (hasUserRegisteredAsCandidate(currentUser.id, candidate.pollId)) {
      console.error('User has already registered as a candidate in this poll');
      return null;
    }
    
    const candidates = getCandidates();
    const newCandidate: Candidate = {
      ...candidate,
      id: Date.now().toString(),
      votes: 0,
      userId: currentUser.id // Store the user ID who registered this candidate
    };
    
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify([...candidates, newCandidate]));
    return newCandidate;
  } catch (error) {
    console.error('Error adding candidate:', error);
    return null;
  }
};

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
  const candidates = getCandidates(pollId);
  const now = new Date();
  
  if (!poll) {
    return { hasStarted: false, hasEnded: true, candidateCount: 0 };
  }
  
  const startDate = new Date(poll.startDate);
  const endDate = new Date(poll.endDate);
  
  return {
    hasStarted: now >= startDate,
    hasEnded: now > endDate,
    candidateCount: candidates.length
  };
};

// Array of available candidate symbols
export const candidateSymbols = [
  { id: 'symbol-1', name: 'Star', icon: '⭐' },
  { id: 'symbol-2', name: 'Heart', icon: '❤️' },
  { id: 'symbol-3', name: 'Sun', icon: '☀️' },
  { id: 'symbol-4', name: 'Moon', icon: '🌙' },
  { id: 'symbol-5', name: 'Tree', icon: '🌳' },
  { id: 'symbol-6', name: 'Flower', icon: '🌸' },
  { id: 'symbol-7', name: 'Mountain', icon: '⛰️' },
  { id: 'symbol-8', name: 'Car', icon: '🚗' },
  { id: 'symbol-9', name: 'Plane', icon: '✈️' },
  { id: 'symbol-10', name: 'Ship', icon: '🚢' },
  { id: 'symbol-11', name: 'Book', icon: '📚' },
  { id: 'symbol-12', name: 'Check', icon: '✅' }
];

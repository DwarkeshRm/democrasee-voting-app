
import { Candidate } from '@/types';
import { CANDIDATES_KEY } from './localStorage/keys';
import { initializeData } from './localStorage/initialize';
import { getCurrentUser } from './userService';

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

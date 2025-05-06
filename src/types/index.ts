
export interface User {
  id: string;
  username: string;
  password: string;
  isAdmin: boolean;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: string;
  showSymbols?: boolean; // Option to show symbols for candidates instead of images
}

export interface Candidate {
  id: string;
  name: string;
  pollId: string;
  imageUrl?: string;
  symbol?: string; // Symbol for candidate if using symbols instead of images
  votes: number;
  userId: string; // Added to track which user created this candidate
}

export interface Vote {
  userId: string;
  pollId: string;
  candidateId: string;
  timestamp: string;
}

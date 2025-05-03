
export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this would be hashed
  isAdmin: boolean;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  isActive: boolean;
  createdBy: string; // admin id
}

export interface Candidate {
  id: string;
  name: string;
  imageUrl: string;
  votes: number;
  pollId: string; // which poll they're participating in
}

export interface Vote {
  userId: string;
  pollId: string;
  candidateId: string;
  timestamp: string; // ISO date string
}

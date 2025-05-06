
import { User } from '@/types';
import { CANDIDATES_KEY, POLLS_KEY, USERS_KEY, VOTES_KEY } from './keys';

// Initialize default data if none exists
export const initializeData = (): void => {
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

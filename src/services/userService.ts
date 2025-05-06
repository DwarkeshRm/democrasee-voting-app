
import { User } from '@/types';
import { CURRENT_USER_KEY, USERS_KEY } from './localStorage/keys';
import { initializeData } from './localStorage/initialize';

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

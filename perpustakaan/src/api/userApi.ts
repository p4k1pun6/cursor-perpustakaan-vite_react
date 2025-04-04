// User API service for user management and authentication
const USER_STORAGE_KEY = 'perpustakaan_users';
const CURRENT_USER_KEY = 'perpustakaan_current_user';
const BORROW_HISTORY_KEY = 'perpustakaan_borrow_history';

import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this would be hashed
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface BorrowRecord {
  id: string;
  userId: string;
  bookId: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  fine: number;
  status: 'active' | 'returned' | 'overdue';
}

// Get users from local storage
const getUsers = (): User[] => {
  const data = localStorage.getItem(USER_STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return [];
};

// Save users to local storage
const saveUsers = (users: User[]): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
};

// Get borrowed history
const getBorrowHistory = (): BorrowRecord[] => {
  const data = localStorage.getItem(BORROW_HISTORY_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return [];
};

// Save borrow history
const saveBorrowHistory = (history: BorrowRecord[]): void => {
  localStorage.setItem(BORROW_HISTORY_KEY, JSON.stringify(history));
};

// Mock database
const users: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    name: 'Admin Perpustakaan',
    email: 'admin@perpustakaan.com',
    phoneNumber: '081234567890',
    address: 'Jl. Perpustakaan No. 1',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'user',
    password: 'user123',
    name: 'Pengguna Biasa',
    email: 'user@example.com',
    phoneNumber: '089876543210',
    address: 'Jl. Pembaca No. 5',
    role: 'user',
    createdAt: new Date().toISOString()
  }
];

const borrowRecords: BorrowRecord[] = [
  {
    id: '1',
    userId: '2',
    bookId: '3', // Assume this book exists in the bookApi
    borrowDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    returnDate: null,
    fine: 0,
    status: 'active'
  }
];

// Helper functions
function omitPassword(user: User): Omit<User, 'password'> {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// API functions
export const loginUser = async (username: string, password: string): Promise<Omit<User, 'password'> | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    throw new Error('Username atau password salah');
  }
  
  return omitPassword(user);
};

export const logoutUser = (): void => {
  // In a real app, this would clear tokens, cookies, etc.
  console.log('User logged out');
};

export const registerUser = async (userData: Omit<User, 'id' | 'role' | 'createdAt'>): Promise<Omit<User, 'password'>> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Check if username already exists
  if (users.some(u => u.username === userData.username)) {
    throw new Error('Username sudah digunakan');
  }
  
  // Check if email already exists
  if (users.some(u => u.email === userData.email)) {
    throw new Error('Email sudah digunakan');
  }
  
  const newUser: User = {
    id: uuidv4(),
    ...userData,
    role: 'user',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  return omitPassword(newUser);
};

export const getUserById = async (userId: string): Promise<Omit<User, 'password'> | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return null;
  }
  
  return omitPassword(user);
};

export const updateUserProfile = async (
  userId: string, 
  profileData: Partial<Omit<User, 'id' | 'role' | 'createdAt' | 'password'>>
): Promise<Omit<User, 'password'>> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Pengguna tidak ditemukan');
  }
  
  // Check if updating username and if it's already taken
  if (profileData.username && 
      profileData.username !== users[userIndex].username && 
      users.some(u => u.username === profileData.username)) {
    throw new Error('Username sudah digunakan');
  }
  
  // Check if updating email and if it's already taken
  if (profileData.email && 
      profileData.email !== users[userIndex].email && 
      users.some(u => u.email === profileData.email)) {
    throw new Error('Email sudah digunakan');
  }
  
  // Update user data
  users[userIndex] = {
    ...users[userIndex],
    ...profileData
  };
  
  return omitPassword(users[userIndex]);
};

export const changeUserPassword = async (
  userId: string, 
  currentPassword: string, 
  newPassword: string
): Promise<boolean> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const userIndex = users.findIndex(u => u.id === userId && u.password === currentPassword);
  
  if (userIndex === -1) {
    throw new Error('Password saat ini salah');
  }
  
  // Update password
  users[userIndex].password = newPassword;
  
  return true;
};

// Borrow related functions
export const createBorrowRecord = async (userId: string, bookId: string): Promise<BorrowRecord> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Check if user exists
  const user = users.find(u => u.id === userId);
  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }
  
  // Check if user already has an active borrow for this book
  const existingBorrow = borrowRecords.find(
    record => record.userId === userId && record.bookId === bookId && record.status === 'active'
  );
  
  if (existingBorrow) {
    throw new Error('Anda sudah meminjam buku ini');
  }
  
  // Create new borrow record
  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(now.getDate() + 14); // 14 days borrow period
  
  const newRecord: BorrowRecord = {
    id: uuidv4(),
    userId,
    bookId,
    borrowDate: now.toISOString(),
    dueDate: dueDate.toISOString(),
    returnDate: null,
    fine: 0,
    status: 'active'
  };
  
  borrowRecords.push(newRecord);
  
  return newRecord;
};

export const returnBook = async (borrowId: string): Promise<BorrowRecord> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const recordIndex = borrowRecords.findIndex(record => record.id === borrowId);
  
  if (recordIndex === -1) {
    throw new Error('Catatan peminjaman tidak ditemukan');
  }
  
  const now = new Date();
  const dueDate = new Date(borrowRecords[recordIndex].dueDate);
  
  // Calculate fine if overdue (Rp. 5000 per day)
  let fine = 0;
  if (now > dueDate) {
    const diffTime = Math.abs(now.getTime() - dueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    fine = diffDays * 5000; // Rp. 5000 per day
  }
  
  // Update borrow record
  borrowRecords[recordIndex] = {
    ...borrowRecords[recordIndex],
    returnDate: now.toISOString(),
    fine,
    status: 'returned'
  };
  
  return borrowRecords[recordIndex];
};

export const getUserBorrowedBooks = (userId: string): BorrowRecord[] => {
  // Get all borrow records for the user
  return borrowRecords.filter(record => record.userId === userId);
};

export const getUserActiveBorrows = (userId: string): BorrowRecord[] => {
  // Get active borrow records for the user
  return borrowRecords.filter(record => record.userId === userId && record.status === 'active');
};

export const checkOverdueBorrows = (): void => {
  const now = new Date();
  
  // Check all active borrows
  borrowRecords.forEach(record => {
    if (record.status === 'active') {
      const dueDate = new Date(record.dueDate);
      
      if (now > dueDate) {
        record.status = 'overdue';
        // Calculate fine
        const diffTime = Math.abs(now.getTime() - dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        record.fine = diffDays * 5000; // Rp. 5000 per day
      }
    }
  });
};

// Initialize sample user data
export const initializeSampleUserData = (): void => {
  const users = getUsers();
  
  if (users.length === 0) {
    const sampleUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        password: 'admin123',
        name: 'Administrator',
        email: 'admin@perpustakaan.com',
        phoneNumber: '08123456789',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        username: 'pengguna',
        password: 'pengguna123',
        name: 'Pengguna Umum',
        email: 'pengguna@gmail.com',
        phoneNumber: '08987654321',
        address: 'Jl. Contoh No. 123, Jakarta',
        role: 'user',
        createdAt: new Date().toISOString()
      },
    ];
    
    saveUsers(sampleUsers);
  }
  
  const borrowHistory = getBorrowHistory();
  
  if (borrowHistory.length === 0) {
    // Create some sample borrow history
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);
    
    const sampleBorrowHistory: BorrowRecord[] = [
      {
        id: '1',
        userId: '2',
        bookId: '1',
        borrowDate: twoDaysAgo.toISOString(),
        dueDate: twoWeeksLater.toISOString(),
        returnDate: null,
        fine: 0,
        status: 'active'
      },
      {
        id: '2',
        userId: '2',
        bookId: '3',
        borrowDate: lastMonth.toISOString(),
        dueDate: twoWeeksAgo.toISOString(),
        returnDate: twoWeeksAgo.toISOString(),
        fine: 0,
        status: 'returned'
      },
    ];
    
    saveBorrowHistory(sampleBorrowHistory);
  }
}; 
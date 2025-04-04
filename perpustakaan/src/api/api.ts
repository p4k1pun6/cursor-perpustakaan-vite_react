import { v4 as uuidv4 } from 'uuid';
import { createBorrowRecord, getUserActiveBorrows } from './userApi';

// Book interface
export interface Buku {
  id: string;
  judul: string;
  penulis: string;
  deskripsi: string;
  tahunTerbit: number;
  penerbit: string;
  isbn: string;
  kategori: string;
  bahasa: string;
  jumlahHalaman: number;
  coverUrl?: string;
  tersedia: boolean;
}

// Mock books data
let bukuList: Buku[] = [
  {
    id: '1',
    judul: 'Laskar Pelangi',
    penulis: 'Andrea Hirata',
    deskripsi: 'Novel tentang perjuangan anak-anak dari Pulau Belitong untuk mendapatkan pendidikan yang layak.',
    tahunTerbit: 2005,
    penerbit: 'Bentang Pustaka',
    isbn: '9789793062792',
    kategori: 'Novel',
    bahasa: 'Indonesia',
    jumlahHalaman: 529,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/id/8/8e/Laskar_pelangi_sampul.jpg',
    tersedia: true
  },
  {
    id: '2',
    judul: 'Bumi Manusia',
    penulis: 'Pramoedya Ananta Toer',
    deskripsi: 'Novel sejarah yang berlatar belakang kehidupan pribumi pada masa kolonial Belanda.',
    tahunTerbit: 1980,
    penerbit: 'Hasta Mitra',
    isbn: '9789799731234',
    kategori: 'Novel Sejarah',
    bahasa: 'Indonesia',
    jumlahHalaman: 535,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/id/6/62/Bumi_Manusia_%28sampul%29.jpg',
    tersedia: true
  },
  {
    id: '3',
    judul: 'Filosofi Teras',
    penulis: 'Henry Manampiring',
    deskripsi: 'Buku yang membahas tentang filsafat Stoa dan bagaimana menerapkannya dalam kehidupan sehari-hari.',
    tahunTerbit: 2018,
    penerbit: 'Kompas',
    isbn: '9786024125189',
    kategori: 'Filsafat',
    bahasa: 'Indonesia',
    jumlahHalaman: 320,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/id/c/c3/Filosofi_Teras.jpg',
    tersedia: false
  },
  {
    id: '4',
    judul: 'Perahu Kertas',
    penulis: 'Dee Lestari',
    deskripsi: 'Novel tentang kisah cinta dan petualangan dua orang yang bercita-cita menjadi seniman.',
    tahunTerbit: 2009,
    penerbit: 'Bentang Pustaka',
    isbn: '9789791227780',
    kategori: 'Novel',
    bahasa: 'Indonesia',
    jumlahHalaman: 444,
    coverUrl: 'https://m.media-amazon.com/images/I/51nZxwQCj0L._SY291_BO1,204,203,200_QL40_FMwebp_.jpg',
    tersedia: true
  }
];

// API function to get all books
export const dapatkanSemuaBuku = async (): Promise<Buku[]> => {
  // Simulating API call with delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...bukuList];
};

// API function to get a book by ID
export const dapatkanBukuById = async (id: string): Promise<Buku | null> => {
  // Simulating API call with delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const buku = bukuList.find(b => b.id === id);
  return buku ? { ...buku } : null;
};

// API function to add a new book
export const tambahBuku = async (bukuData: Omit<Buku, 'id' | 'tersedia'>): Promise<Buku> => {
  // Simulating API call with delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newBuku: Buku = {
    id: uuidv4(),
    ...bukuData,
    tersedia: true
  };
  
  bukuList.push(newBuku);
  return { ...newBuku };
};

// API function to update a book
export const updateBuku = async (id: string, bukuData: Partial<Omit<Buku, 'id'>>): Promise<Buku | null> => {
  // Simulating API call with delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const index = bukuList.findIndex(b => b.id === id);
  if (index === -1) {
    return null;
  }
  
  bukuList[index] = {
    ...bukuList[index],
    ...bukuData
  };
  
  return { ...bukuList[index] };
};

// API function to delete a book
export const hapusBuku = async (id: string): Promise<boolean> => {
  // Simulating API call with delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const initialLength = bukuList.length;
  bukuList = bukuList.filter(b => b.id !== id);
  
  return bukuList.length !== initialLength;
};

// API function to search books
export const cariBuku = async (keyword: string): Promise<Buku[]> => {
  // Simulating API call with delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const lowercaseKeyword = keyword.toLowerCase();
  
  const hasil = bukuList.filter(
    buku => 
      buku.judul.toLowerCase().includes(lowercaseKeyword) ||
      buku.penulis.toLowerCase().includes(lowercaseKeyword) ||
      buku.deskripsi.toLowerCase().includes(lowercaseKeyword) ||
      buku.kategori.toLowerCase().includes(lowercaseKeyword)
  );
  
  return [...hasil];
};

// API function to borrow a book
export const pinjamBuku = async (userId: string, bookId: string): Promise<boolean> => {
  try {
    // Check if book exists and is available
    const book = await dapatkanBukuById(bookId);
    if (!book) {
      throw new Error('Buku tidak ditemukan');
    }
    
    if (!book.tersedia) {
      throw new Error('Buku tidak tersedia untuk dipinjam');
    }
    
    // Check if user has already borrowed this book
    const userBorrows = getUserActiveBorrows(userId);
    const alreadyBorrowed = userBorrows.some(borrow => borrow.bookId === bookId);
    
    if (alreadyBorrowed) {
      throw new Error('Anda sudah meminjam buku ini');
    }
    
    // Create borrow record
    await createBorrowRecord(userId, bookId);
    
    // Update book availability
    const index = bukuList.findIndex(b => b.id === bookId);
    if (index !== -1) {
      bukuList[index].tersedia = false;
    }
    
    return true;
  } catch (error) {
    console.error('Error borrowing book:', error);
    throw error;
  }
};

// API function to check if a book is borrowed by a specific user
export const cekBukuDipinjamOlehUser = (userId: string, bookId: string): boolean => {
  const userBorrows = getUserActiveBorrows(userId);
  return userBorrows.some(borrow => borrow.bookId === bookId);
}; 
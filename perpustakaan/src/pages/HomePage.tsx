import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dapatkanSemuaBuku, Buku } from '../api/api';
import BukuCard from '../components/BukuCard';
import { useAuth } from '../context/AuthContext';
import { getUserActiveBorrows } from '../api/userApi';

const HomePage = () => {
  const [featuredBooks, setFeaturedBooks] = useState<Buku[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, currentUser } = useAuth();
  const [userBorrowedBooks, setUserBorrowedBooks] = useState<string[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const books = await dapatkanSemuaBuku();
        // Get available books first, then sort by most recent (for demo we'll use a random sort)
        const availableBooks = books.filter(book => book.tersedia);
        const shuffled = [...availableBooks].sort(() => 0.5 - Math.random());
        setFeaturedBooks(shuffled.slice(0, 3));
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();

    // Check which books the user has already borrowed
    if (isAuthenticated && currentUser) {
      const userBorrows = getUserActiveBorrows(currentUser.id);
      const borrowedIds = userBorrows.map(record => record.bookId);
      setUserBorrowedBooks(borrowedIds);
    }
  }, [isAuthenticated, currentUser]);

  return (
    <div className="container mt-4">
      <div className="jumbotron bg-light p-5 rounded-3 mb-4">
        <div className="container-fluid py-4">
          <h1 className="display-5 fw-bold">Selamat Datang di Perpustakaan</h1>
          <p className="col-md-8 fs-4">
            Temukan berbagai buku bacaan menarik dan pinjam dengan mudah melalui aplikasi perpustakaan online kami.
          </p>
          <Link to="/buku" className="btn btn-primary btn-lg">
            Lihat Koleksi Buku
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-outline-primary btn-lg ms-2">
              Daftar Sekarang
            </Link>
          )}
        </div>
      </div>

      <h2 className="mb-4">Buku Unggulan</h2>
      
      {isLoading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat buku unggulan...</p>
        </div>
      ) : featuredBooks.length === 0 ? (
        <div className="alert alert-info">
          Tidak ada buku unggulan yang tersedia saat ini.
        </div>
      ) : (
        <div className="row">
          {featuredBooks.map(book => (
            <div className="col-md-4 mb-4" key={book.id}>
              <BukuCard 
                buku={book} 
                userBorrowedBooks={userBorrowedBooks}
              />
            </div>
          ))}
        </div>
      )}

      <div className="row mt-5">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="card-title">Cara Meminjam Buku</h3>
              <ol className="card-text">
                <li>Buat akun atau masuk ke akun Anda</li>
                <li>Cari buku yang ingin Anda pinjam</li>
                <li>Klik tombol "Pinjam" pada buku yang tersedia</li>
                <li>Buku akan tercatat dalam daftar peminjaman Anda</li>
                <li>Kembalikan buku sebelum tanggal jatuh tempo</li>
              </ol>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="card-title">Informasi Perpustakaan</h3>
              <p className="card-text">
                Perpustakaan kami menyediakan berbagai koleksi buku dari berbagai genre dan kategori.
                Dengan sistem peminjaman digital, Anda dapat dengan mudah meminjam dan mengembalikan buku.
              </p>
              <p className="card-text">
                <strong>Jam Operasional:</strong><br />
                Senin - Jumat: 08.00 - 20.00<br />
                Sabtu - Minggu: 09.00 - 18.00
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 
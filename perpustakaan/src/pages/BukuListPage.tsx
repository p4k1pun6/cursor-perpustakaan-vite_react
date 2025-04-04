import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dapatkanSemuaBuku, hapusBuku, cariBuku, pinjamBuku, Buku } from '../api/api';
import BukuCard from '../components/BukuCard';
import { useAuth } from '../context/AuthContext';
import { getUserActiveBorrows } from '../api/userApi';

const BukuListPage = () => {
  const [bukuList, setBukuList] = useState<Buku[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTersedia, setFilterTersedia] = useState<boolean | null>(null);
  const [borrowLoading, setBorrowLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Keep track of which books the user has already borrowed
  const [userBorrowedBooks, setUserBorrowedBooks] = useState<string[]>([]);

  const fetchBuku = async () => {
    setIsLoading(true);
    try {
      const data = await dapatkanSemuaBuku();
      setBukuList(data);
    } catch (error) {
      console.error('Error fetching buku:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuku();
    
    // Check which books the user has already borrowed
    if (isAuthenticated && currentUser) {
      const userBorrows = getUserActiveBorrows(currentUser.id);
      const borrowedIds = userBorrows.map(record => record.bookId);
      setUserBorrowedBooks(borrowedIds);
    }
  }, [isAuthenticated, currentUser]);

  const handleHapusBuku = async (id: string) => {
    if (!isAuthenticated || currentUser?.role !== 'admin') {
      setError('Anda tidak memiliki izin untuk menghapus buku');
      return;
    }
    
    if (window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      try {
        const berhasil = await hapusBuku(id);
        if (berhasil) {
          // Refresh daftar buku setelah menghapus
          fetchBuku();
          setSuccess('Buku berhasil dihapus');
        } else {
          setError('Gagal menghapus buku');
        }
      } catch (error) {
        console.error('Error deleting buku:', error);
        setError('Terjadi kesalahan saat menghapus buku');
      }
    }
  };
  
  const handleBorrowBook = async (id: string) => {
    if (!isAuthenticated || !currentUser) {
      navigate('/login', { state: { from: '/buku' } });
      return;
    }
    
    setBorrowLoading(prev => ({ ...prev, [id]: true }));
    setError('');
    setSuccess('');
    
    try {
      const result = await pinjamBuku(currentUser.id, id);
      if (result) {
        setSuccess('Buku berhasil dipinjam!');
        // Update the book in the list to show as not available
        setBukuList(prev => 
          prev.map(buku => buku.id === id ? { ...buku, tersedia: false } : buku)
        );
        // Add to user's borrowed books
        setUserBorrowedBooks(prev => [...prev, id]);
        // Optionally redirect to peminjaman page
        navigate('/peminjaman');
      } else {
        setError('Gagal meminjam buku');
      }
    } catch (err) {
      console.error('Error borrowing book:', err);
      setError(err instanceof Error ? err.message : 'Gagal meminjam buku');
    } finally {
      setBorrowLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchBuku();
      return;
    }

    setIsLoading(true);
    try {
      const hasil = await cariBuku(searchTerm);
      setBukuList(hasil);
    } catch (error) {
      console.error('Error searching buku:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      fetchBuku();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredBooks = filterTersedia !== null
    ? bukuList.filter(buku => buku.tersedia === filterTersedia)
    : bukuList;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Daftar Buku</h1>
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')} aria-label="Close"></button>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Cari judul atau penulis..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
            />
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleSearch}
            >
              Cari
            </button>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-outline-secondary ${filterTersedia === null ? 'active' : ''}`}
              onClick={() => setFilterTersedia(null)}
            >
              Semua
            </button>
            <button
              type="button"
              className={`btn btn-outline-success ${filterTersedia === true ? 'active' : ''}`}
              onClick={() => setFilterTersedia(true)}
            >
              Tersedia
            </button>
            <button
              type="button"
              className={`btn btn-outline-danger ${filterTersedia === false ? 'active' : ''}`}
              onClick={() => setFilterTersedia(false)}
            >
              Dipinjam
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat data buku...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="alert alert-info">
          {searchTerm 
            ? `Tidak ada buku yang cocok dengan pencarian "${searchTerm}"`
            : 'Tidak ada buku yang tersedia'}
        </div>
      ) : (
        <div className="row">
          {filteredBooks.map(buku => (
            <div className="col-md-6 col-lg-4 mb-4" key={buku.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-light">
                  <h5 className="card-title mb-0 text-truncate">{buku.judul}</h5>
                  <h6 className="card-subtitle text-muted mt-1 text-truncate">Oleh: {buku.penulis}</h6>
                </div>
                <div className="card-body d-flex flex-column">
                  <div className="mb-2">
                    {buku.coverUrl ? (
                      <img 
                        src={buku.coverUrl} 
                        alt={buku.judul} 
                        className="img-fluid rounded mx-auto d-block"
                        style={{ height: '180px', objectFit: 'contain' }}
                      />
                    ) : (
                      <div 
                        className="bg-light rounded d-flex align-items-center justify-content-center"
                        style={{ height: '180px' }}
                      >
                        <span className="text-muted">Tidak ada gambar</span>
                      </div>
                    )}
                  </div>
                  <p className="card-text">
                    <strong>Kategori:</strong> {buku.kategori}<br />
                    <strong>Tahun:</strong> {buku.tahunTerbit}<br />
                    <strong>Status:</strong>{' '}
                    <span className={`badge ${buku.tersedia ? 'bg-success' : 'bg-danger'}`}>
                      {buku.tersedia ? 'Tersedia' : 'Dipinjam'}
                    </span>
                  </p>
                  <div className="mt-auto d-flex gap-2 flex-wrap">
                    <Link to={`/detail/${buku.id}`} className="btn btn-primary btn-sm">
                      Detail
                    </Link>
                    
                    {isAuthenticated && currentUser?.role === 'admin' && (
                      <>
                        <Link to={`/edit/${buku.id}`} className="btn btn-warning btn-sm">
                          Edit
                        </Link>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleHapusBuku(buku.id)}
                        >
                          Hapus
                        </button>
                      </>
                    )}
                    
                    {isAuthenticated && buku.tersedia && !userBorrowedBooks.includes(buku.id) && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleBorrowBook(buku.id)}
                        disabled={borrowLoading[buku.id]}
                      >
                        {borrowLoading[buku.id] ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Memproses...
                          </>
                        ) : 'Pinjam'}
                      </button>
                    )}
                    
                    {isAuthenticated && userBorrowedBooks.includes(buku.id) && (
                      <Link to="/peminjaman" className="btn btn-sm btn-info">
                        Peminjaman Anda
                      </Link>
                    )}
                    
                    {!isAuthenticated && buku.tersedia && (
                      <Link to="/login" className="btn btn-sm btn-success" state={{ from: '/buku' }}>
                        Login untuk Pinjam
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BukuListPage; 
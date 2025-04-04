import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { dapatkanBukuById, hapusBuku, pinjamBuku } from '../api/api';
import { Buku } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { getUserActiveBorrows } from '../api/userApi';

const DetailBukuPage = () => {
  const { id } = useParams<{ id: string }>();
  const [buku, setBuku] = useState<Buku | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [borrowing, setBorrowing] = useState(false);
  const [alreadyBorrowed, setAlreadyBorrowed] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  
  useEffect(() => {
    const fetchBuku = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await dapatkanBukuById(id);
        if (data) {
          setBuku(data);
        } else {
          setError('Buku tidak ditemukan');
        }
      } catch (error) {
        console.error('Error fetching buku:', error);
        setError('Terjadi kesalahan saat memuat data buku');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuku();
    
    // Check if user already borrowed this book
    if (isAuthenticated && currentUser && id) {
      const userBorrows = getUserActiveBorrows(currentUser.id);
      const borrowed = userBorrows.some(record => record.bookId === id);
      setAlreadyBorrowed(borrowed);
    }
  }, [id, isAuthenticated, currentUser]);

  const handleHapusBuku = async () => {
    if (!id) return;
    
    if (window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      try {
        const berhasil = await hapusBuku(id);
        if (berhasil) {
          navigate('/buku');
        } else {
          alert('Gagal menghapus buku');
        }
      } catch (error) {
        console.error('Error deleting buku:', error);
        alert('Terjadi kesalahan saat menghapus buku');
      }
    }
  };
  
  const handleBorrowBook = async () => {
    if (!id || !isAuthenticated || !currentUser) {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: `/detail/${id}` } });
      }
      return;
    }
    
    setBorrowing(true);
    setError('');
    
    try {
      const result = await pinjamBuku(currentUser.id, id);
      if (result) {
        alert('Buku berhasil dipinjam!');
        if (buku) {
          setBuku({ ...buku, tersedia: false });
        }
        setAlreadyBorrowed(true);
        navigate('/peminjaman');
      } else {
        setError('Gagal meminjam buku');
      }
    } catch (err) {
      console.error('Error borrowing book:', err);
      setError(err instanceof Error ? err.message : 'Gagal meminjam buku');
    } finally {
      setBorrowing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-4 text-center">
        <p>Memuat data buku...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          {error}
        </div>
        <Link to="/buku" className="btn btn-primary">
          Kembali ke Daftar Buku
        </Link>
      </div>
    );
  }

  if (!buku) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Buku tidak ditemukan
        </div>
        <Link to="/buku" className="btn btn-primary">
          Kembali ke Daftar Buku
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h1 className="card-title h3">{buku.judul}</h1>
          <h6 className="card-subtitle">Oleh: {buku.penulis}</h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-4">
              {buku.coverUrl ? (
                <img 
                  src={buku.coverUrl} 
                  alt={buku.judul} 
                  className="img-fluid rounded shadow-sm"
                  style={{ maxHeight: '400px' }}
                />
              ) : (
                <div 
                  className="bg-light rounded d-flex align-items-center justify-content-center shadow-sm"
                  style={{ height: '400px' }}
                >
                  <span className="text-muted">Tidak ada gambar</span>
                </div>
              )}
            </div>
            <div className="col-md-8">
              <table className="table">
                <tbody>
                  <tr>
                    <th style={{ width: '200px' }}>Penerbit</th>
                    <td>{buku.penerbit}</td>
                  </tr>
                  <tr>
                    <th>Tahun Terbit</th>
                    <td>{buku.tahunTerbit}</td>
                  </tr>
                  <tr>
                    <th>Kategori</th>
                    <td>{buku.kategori}</td>
                  </tr>
                  <tr>
                    <th>Jumlah Halaman</th>
                    <td>{buku.jumlahHalaman}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>
                      <span className={`badge ${buku.tersedia ? 'bg-success' : 'bg-danger'}`}>
                        {buku.tersedia ? 'Tersedia' : 'Dipinjam'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div className="d-flex flex-wrap gap-2 mt-4">
                {isAuthenticated && (
                  <>
                    {buku.tersedia && !alreadyBorrowed && (
                      <button 
                        className="btn btn-success" 
                        onClick={handleBorrowBook}
                        disabled={borrowing}
                      >
                        {borrowing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Memproses...
                          </>
                        ) : 'Pinjam Buku'}
                      </button>
                    )}
                    
                    {alreadyBorrowed && (
                      <Link to="/peminjaman" className="btn btn-info">
                        Lihat Peminjaman Anda
                      </Link>
                    )}
                    
                    {currentUser?.role === 'admin' && (
                      <>
                        <Link to={`/edit/${buku.id}`} className="btn btn-warning">
                          Edit Buku
                        </Link>
                        <button
                          className="btn btn-danger"
                          onClick={handleHapusBuku}
                        >
                          Hapus Buku
                        </button>
                      </>
                    )}
                  </>
                )}
                
                {!isAuthenticated && buku.tersedia && (
                  <Link to="/login" className="btn btn-success" state={{ from: `/detail/${id}` }}>
                    Login untuk Meminjam
                  </Link>
                )}
                
                <Link to="/buku" className="btn btn-secondary">
                  Kembali ke Daftar Buku
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailBukuPage; 
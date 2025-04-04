import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Buku, pinjamBuku } from '../api/api';
import { useAuth } from '../context/AuthContext';

interface BukuCardProps {
  buku: Buku;
  onHapus?: (id: string) => Promise<void>;
  showDetailLink?: boolean;
  userBorrowedBooks?: string[];
}

const BukuCard = ({ buku, onHapus, showDetailLink = true, userBorrowedBooks = [] }: BukuCardProps) => {
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = isAuthenticated && currentUser?.role === 'admin';
  const hasUserBorrowed = userBorrowedBooks.includes(buku.id);

  const handleBorrowBook = async () => {
    if (!isAuthenticated || !currentUser) {
      navigate('/login', { state: { from: '/buku' } });
      return;
    }
    
    setBorrowLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await pinjamBuku(currentUser.id, buku.id);
      if (result) {
        setSuccess('Buku berhasil dipinjam!');
        // Redirect to peminjaman page after short delay
        setTimeout(() => {
          navigate('/peminjaman');
        }, 1500);
      }
    } catch (err) {
      console.error('Error borrowing book:', err);
      setError(err instanceof Error ? err.message : 'Gagal meminjam buku');
    } finally {
      setBorrowLoading(false);
    }
  };

  return (
    <div className="card h-100 shadow-sm">
      {(error || success) && (
        <div className={`alert alert-${error ? 'danger' : 'success'} alert-dismissible fade show m-2 p-2`} role="alert">
          {error || success}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => {
              setError('');
              setSuccess('');
            }}
            aria-label="Close"
          ></button>
        </div>
      )}
      
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
          {showDetailLink && (
            <Link to={`/detail/${buku.id}`} className="btn btn-primary btn-sm">
              Detail
            </Link>
          )}
          
          {isAdmin && (
            <>
              <Link to={`/edit/${buku.id}`} className="btn btn-warning btn-sm">
                Edit
              </Link>
              {onHapus && (
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => onHapus(buku.id)}
                >
                  Hapus
                </button>
              )}
            </>
          )}
          
          {isAuthenticated && buku.tersedia && !hasUserBorrowed && (
            <button
              className="btn btn-success btn-sm"
              onClick={handleBorrowBook}
              disabled={borrowLoading}
            >
              {borrowLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Memproses...
                </>
              ) : 'Pinjam'}
            </button>
          )}
          
          {isAuthenticated && hasUserBorrowed && (
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
  );
};

export default BukuCard; 
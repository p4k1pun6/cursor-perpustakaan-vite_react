import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserBorrowedBooks, BorrowRecord, returnBook } from '../api/userApi';
import { dapatkanBukuById } from '../api/api';

const PeminjamanPage = () => {
  const { currentUser } = useAuth();
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [returnLoading, setReturnLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    loadBorrowRecords();
  }, [currentUser]);
  
  const loadBorrowRecords = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const records = getUserBorrowedBooks(currentUser.id);
      setBorrowRecords(records);
    } catch (err) {
      console.error('Error loading borrow records:', err);
      setError('Gagal memuat data peminjaman');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReturnBook = async (borrowId: string) => {
    if (!currentUser) return;
    
    setReturnLoading(prev => ({ ...prev, [borrowId]: true }));
    setError('');
    setSuccess('');
    
    try {
      const result = await returnBook(borrowId);
      if (result) {
        setSuccess('Buku berhasil dikembalikan');
        loadBorrowRecords();
      } else {
        setError('Gagal mengembalikan buku');
      }
    } catch (err) {
      console.error('Error returning book:', err);
      setError(err instanceof Error ? err.message : 'Gagal mengembalikan buku');
    } finally {
      setReturnLoading(prev => ({ ...prev, [borrowId]: false }));
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };
  
  const isOverdue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    return now > due;
  };
  
  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    
    if (diffTime <= 0) {
      return { isOverdue: true, days: Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24)) };
    }
    
    return { isOverdue: false, days: Math.ceil(diffTime / (1000 * 60 * 60 * 24)) };
  };
  
  const activeRecords = borrowRecords.filter(record => record.status === 'active' || record.status === 'overdue');
  const historyRecords = borrowRecords.filter(record => record.status === 'returned');
  
  if (!currentUser) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Tidak ada pengguna yang login. Silakan login terlebih dahulu.
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mt-4 mb-5">
      <h1 className="mb-4">Peminjaman Buku</h1>
      
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
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Sedang Dipinjam
            {activeRecords.length > 0 && (
              <span className="badge bg-primary ms-2">
                {activeRecords.length}
              </span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Riwayat Peminjaman
            {historyRecords.length > 0 && (
              <span className="badge bg-secondary ms-2">
                {historyRecords.length}
              </span>
            )}
          </button>
        </li>
      </ul>
      
      {isLoading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat data peminjaman...</p>
        </div>
      ) : (
        <>
          {activeTab === 'active' && (
            <>
              {activeRecords.length === 0 ? (
                <div className="alert alert-info">
                  Anda tidak memiliki buku yang sedang dipinjam.
                  <div className="mt-3">
                    <Link to="/buku" className="btn btn-primary">
                      Pinjam Buku Sekarang
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="row">
                  {activeRecords.map(record => {
                    const { isOverdue: isLate, days } = getTimeRemaining(record.dueDate);
                    const isBookOverdue = record.status === 'overdue' || isLate;
                    
                    return (
                      <div className="col-md-6 mb-4" key={record.id}>
                        <div className={`card shadow-sm ${isBookOverdue ? 'border-danger' : ''}`}>
                          <div className={`card-header ${isBookOverdue ? 'bg-danger text-white' : 'bg-primary text-white'}`}>
                            <div className="d-flex justify-content-between align-items-center">
                              <h5 className="mb-0">ID Buku: {record.bookId}</h5>
                              {isBookOverdue && (
                                <span className="badge bg-white text-danger">
                                  Terlambat {days} hari
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="card-body">
                            <div className="mb-3">
                              <strong>Tanggal Peminjaman:</strong> {formatDate(record.borrowDate)}
                            </div>
                            <div className="mb-3">
                              <strong>Tanggal Jatuh Tempo:</strong> {formatDate(record.dueDate)}
                            </div>
                            
                            {!isBookOverdue && (
                              <div className="alert alert-info mb-3">
                                Sisa waktu peminjaman: <strong>{days} hari</strong>
                              </div>
                            )}
                            
                            {isBookOverdue && (
                              <div className="alert alert-danger mb-3">
                                <strong>Keterlambatan:</strong> {days} hari<br />
                                <strong>Denda:</strong> Rp {(days * 5000).toLocaleString('id-ID')}
                              </div>
                            )}
                            
                            <div className="d-flex gap-2">
                              <Link 
                                to={`/detail/${record.bookId}`} 
                                className="btn btn-outline-primary"
                              >
                                Detail Buku
                              </Link>
                              <button 
                                className="btn btn-success"
                                onClick={() => handleReturnBook(record.id)}
                                disabled={returnLoading[record.id]}
                              >
                                {returnLoading[record.id] ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Memproses...
                                  </>
                                ) : 'Kembalikan Buku'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
          
          {activeTab === 'history' && (
            <>
              {historyRecords.length === 0 ? (
                <div className="alert alert-info">
                  Anda belum memiliki riwayat peminjaman buku.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>ID Buku</th>
                        <th>Tanggal Peminjaman</th>
                        <th>Tanggal Pengembalian</th>
                        <th>Status</th>
                        <th>Denda</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyRecords.map(record => (
                        <tr key={record.id}>
                          <td>{record.bookId}</td>
                          <td>{formatDate(record.borrowDate)}</td>
                          <td>{record.returnDate ? formatDate(record.returnDate) : '-'}</td>
                          <td>
                            <span className="badge bg-success">Dikembalikan</span>
                          </td>
                          <td>
                            {record.fine ? `Rp ${record.fine.toLocaleString('id-ID')}` : 'Tidak ada'}
                          </td>
                          <td>
                            <Link 
                              to={`/detail/${record.bookId}`} 
                              className="btn btn-sm btn-outline-primary"
                            >
                              Detail Buku
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PeminjamanPage; 
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dapatkanBukuById, updateBuku, Buku } from '../api/api';
import BukuForm from '../components/BukuForm';

const EditBukuPage = () => {
  const { id } = useParams<{ id: string }>();
  const [buku, setBuku] = useState<Buku | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
  }, [id]);

  const handleSubmit = async (bukuData: Omit<Buku, 'id'>) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      const updatedBuku = await updateBuku(id, bukuData);
      if (updatedBuku) {
        alert('Buku berhasil diperbarui!');
        navigate(`/detail/${id}`);
      } else {
        setError('Gagal memperbarui buku');
      }
    } catch (error) {
      console.error('Error updating buku:', error);
      setError('Terjadi kesalahan saat memperbarui buku');
    } finally {
      setIsSaving(false);
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
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h2 className="card-title">Edit Buku</h2>
              <h6 className="card-subtitle">{buku?.judul}</h6>
            </div>
            <div className="card-body">
              {buku && (
                <BukuForm 
                  initialData={buku} 
                  onSubmit={handleSubmit} 
                  isLoading={isSaving} 
                />
              )}
            </div>
            <div className="card-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate(-1)}
                disabled={isSaving}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBukuPage; 
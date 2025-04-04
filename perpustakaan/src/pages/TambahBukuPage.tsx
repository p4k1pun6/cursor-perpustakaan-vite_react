import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tambahBuku, Buku } from '../api/api';
import BukuForm from '../components/BukuForm';

const TambahBukuPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (bukuData: Omit<Buku, 'id'>) => {
    setIsLoading(true);
    try {
      const bukuBaru = await tambahBuku(bukuData);
      alert('Buku berhasil ditambahkan!');
      navigate(`/detail/${bukuBaru.id}`);
    } catch (error) {
      console.error('Error adding buku:', error);
      alert('Terjadi kesalahan saat menambahkan buku.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h2 className="card-title">Tambah Buku Baru</h2>
            </div>
            <div className="card-body">
              <BukuForm 
                onSubmit={handleSubmit} 
                isLoading={isLoading} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TambahBukuPage; 
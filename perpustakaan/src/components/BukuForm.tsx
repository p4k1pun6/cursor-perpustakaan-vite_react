import { useState, useEffect } from 'react';
import { Buku } from '../api/api';

interface BukuFormProps {
  initialData?: Partial<Buku>;
  onSubmit: (data: Omit<Buku, 'id'>) => void;
  isLoading: boolean;
}

const BukuForm = ({ initialData, onSubmit, isLoading }: BukuFormProps) => {
  const [formData, setFormData] = useState<Omit<Buku, 'id'>>({
    judul: '',
    penulis: '',
    tahunTerbit: new Date().getFullYear(),
    penerbit: '',
    jumlahHalaman: 0,
    kategori: '',
    tersedia: true,
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prevData => ({
        ...prevData,
        ...initialData,
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseInt(value, 10) 
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="judul" className="form-label">Judul Buku</label>
        <input
          type="text"
          className="form-control"
          id="judul"
          name="judul"
          value={formData.judul}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="penulis" className="form-label">Penulis</label>
        <input
          type="text"
          className="form-control"
          id="penulis"
          name="penulis"
          value={formData.penulis}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="tahunTerbit" className="form-label">Tahun Terbit</label>
        <input
          type="number"
          className="form-control"
          id="tahunTerbit"
          name="tahunTerbit"
          min="1900"
          max={new Date().getFullYear()}
          value={formData.tahunTerbit}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="penerbit" className="form-label">Penerbit</label>
        <input
          type="text"
          className="form-control"
          id="penerbit"
          name="penerbit"
          value={formData.penerbit}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="jumlahHalaman" className="form-label">Jumlah Halaman</label>
        <input
          type="number"
          className="form-control"
          id="jumlahHalaman"
          name="jumlahHalaman"
          min="1"
          value={formData.jumlahHalaman}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="kategori" className="form-label">Kategori</label>
        <input
          type="text"
          className="form-control"
          id="kategori"
          name="kategori"
          value={formData.kategori}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3 form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="tersedia"
          name="tersedia"
          checked={formData.tersedia}
          onChange={handleChange}
        />
        <label className="form-check-label" htmlFor="tersedia">Tersedia</label>
      </div>

      <button type="submit" className="btn btn-primary" disabled={isLoading}>
        {isLoading ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  );
};

export default BukuForm; 
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container mt-5 text-center">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-body">
              <h1 className="display-1 text-danger">404</h1>
              <h2 className="mb-4">Halaman Tidak Ditemukan</h2>
              <p className="lead mb-4">
                Maaf, halaman yang Anda cari tidak ditemukan atau tidak tersedia.
              </p>
              <Link to="/" className="btn btn-primary btn-lg">
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 
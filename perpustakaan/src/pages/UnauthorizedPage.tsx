import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="container mt-5 text-center">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-body">
              <h1 className="display-1 text-danger">403</h1>
              <h2 className="mb-4">Akses Ditolak</h2>
              <p className="lead mb-4">
                Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
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

export default UnauthorizedPage; 
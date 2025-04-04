import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Perpustakaan
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/">
                Beranda
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/buku">
                Daftar Buku
              </NavLink>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/peminjaman">
                  Peminjaman
                </NavLink>
              </li>
            )}
            {isAuthenticated && currentUser?.role === 'admin' && (
              <li className="nav-item">
                <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/tambah">
                  Tambah Buku
                </NavLink>
              </li>
            )}
          </ul>

          <ul className="navbar-nav">
            {isAuthenticated ? (
              <>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {currentUser?.name || currentUser?.username}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i>Profil
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/peminjaman">
                        <i className="bi bi-book me-2"></i>Peminjaman
                      </Link>
                    </li>
                    {currentUser?.role === 'admin' && (
                      <li>
                        <Link className="dropdown-item" to="/tambah">
                          <i className="bi bi-plus-circle me-2"></i>Tambah Buku
                        </Link>
                      </li>
                    )}
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>Keluar
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Masuk
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/register">
                    <i className="bi bi-person-plus me-1"></i>
                    Daftar
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
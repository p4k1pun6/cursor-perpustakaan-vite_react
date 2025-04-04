import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import BukuListPage from './pages/BukuListPage';
import DetailBukuPage from './pages/DetailBukuPage';
import TambahBukuPage from './pages/TambahBukuPage';
import EditBukuPage from './pages/EditBukuPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PeminjamanPage from './pages/PeminjamanPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/buku" element={<BukuListPage />} />
            <Route path="/detail/:id" element={<DetailBukuPage />} />
            <Route path="/tambah" element={
              <ProtectedRoute requiredRole="admin">
                <TambahBukuPage />
              </ProtectedRoute>
            } />
            <Route path="/edit/:id" element={
              <ProtectedRoute requiredRole="admin">
                <EditBukuPage />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/peminjaman" element={
              <ProtectedRoute>
                <PeminjamanPage />
              </ProtectedRoute>
            } />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <footer className="bg-dark text-light py-3 text-center">
          <div className="container">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} Perpustakaan App
            </p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;

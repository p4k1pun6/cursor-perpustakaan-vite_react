import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, changeUserPassword } from '../api/userApi';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Load user data on component mount
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        address: currentUser.address || '',
      });
    }
  }, [currentUser]);
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      await updateUserProfile(currentUser.id, profileData);
      setSuccess('Profil berhasil diperbarui');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui profil');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Password baru dan konfirmasi password tidak cocok');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password baru harus minimal 6 karakter');
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');
    
    try {
      await changeUserPassword(
        currentUser.id,
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setPasswordSuccess('Password berhasil diperbarui');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Gagal memperbarui password');
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  if (!currentUser) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Anda harus login untuk melihat profil
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mt-4 mb-5">
      <h1 className="mb-4">Profil Pengguna</h1>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h4 className="card-title mb-0">Informasi Pribadi</h4>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setError('')} 
                    aria-label="Close"
                  ></button>
                </div>
              )}
              
              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {success}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setSuccess('')} 
                    aria-label="Close"
                  ></button>
                </div>
              )}
              
              <form onSubmit={handleProfileSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Nama Lengkap</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                    disabled={isUpdating}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    required
                    disabled={isUpdating}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                    disabled={isUpdating}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="phoneNumber" className="form-label">Nomor Telepon</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleProfileChange}
                    disabled={isUpdating}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Alamat</label>
                  <textarea
                    className="form-control"
                    id="address"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    rows={3}
                    disabled={isUpdating}
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Memproses...
                    </>
                  ) : 'Simpan Perubahan'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="card-title mb-0">Ubah Password</h4>
            </div>
            <div className="card-body">
              {passwordError && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {passwordError}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setPasswordError('')} 
                    aria-label="Close"
                  ></button>
                </div>
              )}
              
              {passwordSuccess && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {passwordSuccess}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setPasswordSuccess('')} 
                    aria-label="Close"
                  ></button>
                </div>
              )}
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">Password Saat Ini</label>
                  <input
                    type="password"
                    className="form-control"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={isChangingPassword}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">Password Baru</label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={isChangingPassword}
                    placeholder="Minimal 6 karakter"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={isChangingPassword}
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Memproses...
                    </>
                  ) : 'Ubah Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="card-title mb-0">Informasi Akun</h4>
            </div>
            <div className="card-body">
              <p>
                <strong>ID Pengguna:</strong> {currentUser.id}
              </p>
              <p>
                <strong>Peran:</strong> {currentUser.role === 'admin' ? 'Administrator' : 'Pengguna Biasa'}
              </p>
              <p>
                <strong>Tanggal Bergabung:</strong> {new Date(currentUser.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const location = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (email) {
      axios
        .get(`http://localhost:3001/user`, { params: { email } })
        .then((response) => {
          if (response.data) {
            console.log("Backend'den gelen userInfo:", response.data);
            setUserInfo(response.data);  // Veriyi doğrudan burada güncelliyoruz
            setFormData(response.data);  // Form verisini de güncelledik
            setLoading(false);
          } else {
            setError("Veri alınamadı.");
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Hata oluştu:", err);
          setError("Kullanıcı bilgileri alınamadı.");
          setLoading(false);
        });
    } else {
      setError("Email bilgisi eksik.");
      setLoading(false);
    }
  }, [email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = () => {
    axios
      .put(`http://localhost:3001/user/update`, formData)
      .then(() => {
        setUserInfo(formData); // Form verisini güncelliyoruz
        setEditing(false);
        navigate('/profil', { state: { email } });
      })
      .catch((err) => {
        console.error("Hata oluştu:", err);
        setError("Bilgiler güncellenemedi.");
      });
  };

  if (loading) {
    return <p className="text-center">Bilgiler yükleniyor...</p>;
  }

  if (error) {
    return <p className="text-center text-danger">{error}</p>;
  }

  return (
    <div style={{ backgroundImage: 'url(https://i.pinimg.com/originals/ef/37/81/ef37815019ae52354c7c5772f4e886d6.png)', backgroundSize: 'cover', minHeight: '100vh' }}>
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center">
        <h1 className="text-center mb-5" style={{ color: '#333' }}>Profil Bilgileri</h1>

        {/* Home Butonu */}
        <div className="d-flex justify-content-center p-3 w-100 mb-4">
          <button
            onClick={() => navigate('/home', { state: { email } })}
            className="btn btn-light"
            style={{
              borderRadius: '30px',
              padding: '10px 25px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              fontSize: '16px',
              transition: 'all 0.3s ease',
            }}
          >
            Home
          </button>
        </div>

        {userInfo ? (
          <div className="card shadow-lg p-4" style={{
            width: '60%',
            borderRadius: '15px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',  // Daha fazla şeffaflık eklendi
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',  // Hafif gölge eklenmiş
          }}>
            <h2 className="text-center mb-4" style={{ color: '#444', fontWeight: 'bold' }}>Kullanıcı Bilgileri</h2>

            {editing ? (
              <>
                <div className="mb-3">
                  <label className="form-label">Adı Soyadı</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Doğum Tarihi</label>
                  <input
                    type="date"
                    className="form-control"
                    name="dateOfBirth"
                    value={formData.dateOfBirth.split('T')[0]}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Cinsiyet</label>
                  <input
                    type="text"
                    className="form-control"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Telefon</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">İlgi Alanları</label>
                  <input
                    type="text"
                    className="form-control"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                  />
                </div>
                {/* Puan alanı kaldırıldı */}
                <button className="btn btn-primary" onClick={handleSave}>Kaydet</button>
                <button className="btn btn-secondary ms-2" onClick={() => setEditing(false)}>İptal</button>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <strong>Adı Soyadı:</strong> <span>{userInfo.name}</span>
                </div>
                <div className="mb-3">
                  <strong>Doğum Tarihi:</strong> <span>{new Date(userInfo.dateOfBirth).toLocaleDateString()}</span>
                </div>
                <div className="mb-3">
                  <strong>Cinsiyet:</strong> <span>{userInfo.gender}</span>
                </div>
                <div className="mb-3">
                  <strong>Telefon:</strong> <span>{userInfo.phone}</span>
                </div>
                <div className="mb-3">
                  <strong>İlgi Alanları:</strong> <span>{userInfo.interests}</span>
                </div>
                <div className="mb-3">
                  <strong>Puan:</strong> <span>{userInfo.points || 0}</span>  {/* Puan burada gösterilmeye devam eder */}
                </div>
                <button className="btn btn-warning" onClick={() => setEditing(true)}>Düzenle</button>
              </>
            )}
          </div>
        ) : (
          <p>Kullanıcı bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;

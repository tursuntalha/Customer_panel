import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // useNavigate hook'u eklendi
import { useLocation } from "react-router-dom";

const AdminProfil = () => {
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Yönlendirme için useNavigate hook'u

  const location = useLocation();
  const email = location.state?.email;  // email bilgisi location.state üzerinden alınır.

  useEffect(() => {
    // Kullanıcıları ve etkinlikleri çekmek için API isteği
    axios.all([
      axios.get('http://localhost:3001/users'),  // Kullanıcıları al
      axios.get('http://localhost:3001/events')  // Etkinlikleri al
    ])
    .then(axios.spread((userResponse, activityResponse) => {
      setUsers(userResponse.data);
      setActivities(activityResponse.data);
      setLoading(false);
    }))
    .catch(err => {
      console.error("Hata oluştu:", err);
      setError("Veriler yüklenemedi.");
      setLoading(false);
    });
  }, []);

  const handleEditUser = (user) => {
    // Kullanıcıyı email bilgisiyle düzenleme sayfasına yönlendiriyoruz
    navigate(`/profil`, { state: { email: user.email } });

  };
  
  const handleEditActivity = (activity) => {
    // navigate ile state parametresi gönderiyoruz
    navigate(`/admin/edit-event/${activity.name}`, { state: { eventName: activity.name } });
  };

  const handleDeleteUser = (username) => {
    // Kullanıcıyı silme
    if (window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      axios.delete(`http://localhost:3001/users/${username}`)
        .then(() => {
          setUsers(users.filter(user => user.name !== username)); // Kullanıcıyı listeden çıkar
        })
        .catch(err => {
          console.error("Kullanıcı silme hatası:", err);
          alert("Kullanıcı silinirken bir hata oluştu.");
        });
    }
  };

  const handleDeleteActivity = (activityName) => {
    // Etkinliği silme
    if (window.confirm("Bu etkinliği silmek istediğinizden emin misiniz?")) {
      axios.delete(`http://localhost:3001/events/${activityName}`)
        .then(() => {
          setActivities(activities.filter(activity => activity.name !== activityName)); // Etkinliği listeden çıkar
        })
        .catch(err => {
          console.error("Etkinlik silme hatası:", err);
          alert("Etkinlik silinirken bir hata oluştu.");
        });
    }
  };

  const handleGoHome = () => {
    // Kullanıcı email'ini state olarak geçiriyoruz
    navigate('/home', { state: {email} });
  };
  

  if (loading) {
    return <p className="text-center text-info">Veriler yükleniyor...</p>;
  }

  if (error) {
    return <p className="text-center text-danger">{error}</p>;
  }

  return (
    <div className="min-vh-100 bg-cover d-flex flex-column align-items-center justify-content-start py-4"
      style={{ backgroundImage: 'url(https://i.pinimg.com/originals/ef/37/81/ef37815019ae52354c7c5772f4e886d6.png)', backgroundPosition: 'center', backgroundSize: 'cover' }}
    >
      <h1 className="text-center mb-5 text-white" style={{ fontSize: '2.5rem' }}>Admin Paneli</h1>

      <div className="container">
        {/* Kullanıcılar Tablosu */}
        <h2 className="text-center mb-4 text-white" style={{ fontSize: '1.8rem' }}>Tüm Kullanıcılar</h2>
        <div className="card shadow-lg p-4 mb-5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Adı Soyadı</th>
                <th>Email</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.name}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.isActive ? 'Aktif' : 'Pasif'}</td>
                  <td>
                    <button
                      className="btn btn-warning"
                      onClick={() => handleEditUser(user)}
                    >
                      Düzenle
                    </button>
                    <button
                      className="btn btn-danger ml-2"
                      onClick={() => handleDeleteUser(user.name)} // Silme butonu
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Etkinlikler Tablosu */}
        <h2 className="text-center mb-4 text-white" style={{ fontSize: '1.8rem' }}>Tüm Etkinlikler</h2>
        <div className="card shadow-lg p-4 mb-5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Etkinlik Adı</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr key={activity.name}>
                  <td>{index + 1}</td>
                  <td>{activity.name}</td>
                  <td>{activity.isActive ? 'Aktif' : 'Pasif'}</td>
                  <td>{activity.date}</td>
                  <td>
                    <button
                      className="btn btn-warning"
                      onClick={() => handleEditActivity(activity)}
                    >
                      Düzenle
                    </button>
                    <button
                      className="btn btn-danger ml-2"
                      onClick={() => handleDeleteActivity(activity.name)} // Silme butonu
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ana Sayfaya Dön Butonu */}
        <div className="d-flex justify-content-center">
          <button className="btn btn-primary" onClick={handleGoHome}>Ana Sayfaya Dön</button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfil;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Login sayfasına yönlendirme için
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Yönlendirme için kullanılır

  const handleResetPassword = (e) => {
    e.preventDefault();
    console.log("Gönderilen veri:", { email, newPassword });

    axios
      .post("http://localhost:3001/reset-password", { email, newPassword })
      .then((response) => {
        setMessage(response.data);
        console.log("Başarı:", response.data);

        // Şifre sıfırlama başarılıysa login sayfasına yönlendir
        setTimeout(() => {
          navigate("/"); // Login sayfasına yönlendirme
        }, 2000); // 2 saniye bekle
      })
      .catch((err) => {
        setMessage("Hata oluştu. Tekrar deneyiniz.");
        console.error("Hata Detayı:", err);
      });
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        backgroundImage: 'url(https://i.pinimg.com/originals/ef/37/81/ef37815019ae52354c7c5772f4e886d6.png)',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="p-5 rounded shadow"
        style={{
          width: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.8)", // Şeffaflık için
        }}
      >
        <h3 className="text-center mb-4">Şifre Sıfırla</h3>
        <form onSubmit={handleResetPassword}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              E-posta
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">
              Yeni Şifre
            </label>
            <input
              type="password"
              id="newPassword"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Şifreyi Sıfırla
          </button>
        </form>
        {message && <div className="alert alert-info mt-3">{message}</div>}
      </div>
    </div>
  );
};

export default ForgotPassword;

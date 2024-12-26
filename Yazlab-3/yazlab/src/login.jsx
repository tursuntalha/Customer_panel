import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Error message state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/login", { email, password })
      .then((result) => {
        if (result.data === "Success") {
          navigate("/home", { state: { email } });
        } else {
          setError(result.data); // Set the error message
        }
      })
      .catch((err) => {
        setError("Bir hata oluştu.");
        console.error(err);
      });
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        backgroundImage: 'url(https://i.pinimg.com/originals/ef/37/81/ef37815019ae52354c7c5772f4e886d6.png)',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="bg-opacity-75 p-5 rounded shadow-lg w-75 w-md-50"
        style={{ backgroundColor: "rgba(0, 52, 89, 0.4)", border: "none" }}
      >
        <h2 className="text-center text-white mb-4">Giriş Yap</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label text-white">
              E-posta
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label text-white">
              Şifre
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          {error && (
            <div className="text-danger mb-3">
              {error}{" "}
              <button
                className="btn btn-link text-primary p-0"
                onClick={() => navigate("/forgot-password")}
              >
                Şifrenizi mi unuttunuz?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 mb-3"
            style={{ backgroundColor: "rgba(0, 52, 89)", border: "none" }}
          >
            Giriş Yap
          </button>
        </form>

        <div className="text-center text-white mt-3">
          <p>Henüz kayıt olmadınız mı?</p>
          <button
            className="btn btn-outline-light"
            onClick={() => navigate("/signup")}
          >
            Kayıt Ol
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

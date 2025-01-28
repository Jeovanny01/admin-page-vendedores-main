import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../features/auth/authActions";
import { Container, Form, Button, Alert } from "react-bootstrap";
import logo from '../assets/logocuadrado.png';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userToken, userInfo, error } = useSelector((state) => state.auth);

  const [user, setUser] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });

  useEffect(() => {
    if (userInfo) {
      navigate("/SellersPage", { replace: true });
    }
  }, [userInfo, navigate]);

  const onLoginPress = () => {
    dispatch(loginUser({ email: user.value, password: password.value }));
  };

  return (
    <div className="login-page">
      <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <img src={logo} alt="Logo" className="logo" />
        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}
        {user.error && (
          <Alert variant="danger">
            {user.error}
          </Alert>
        )}
        <Form className="login-form">
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Usuario</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={user.value}
              isInvalid={!!user.error}
              onChange={(e) => setUser({ value: e.target.value, error: "" })}
              className="custom-input"
            />
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password.value}
              isInvalid={!!password.error}
              onChange={(e) => setPassword({ value: e.target.value, error: "" })}
              className="custom-input"
            />
          </Form.Group>
          <Button variant="primary" onClick={onLoginPress} className="mt-3">
            Iniciar sesión
          </Button>
        </Form>
      </Container>
    </div>
  );
}

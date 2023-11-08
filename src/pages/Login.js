import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";


function Login() {
  const [loginId, setLoginId] = useState();
  const [password, setPassword] = useState();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      window.location.href = "/homepage";
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const loginObj = {
      username: loginId,
      password,
    };

    axios
      .post('https://dragdropapp-backend.onrender.com/user/login', loginObj)
      .then((res) => {
        if (res.data.status === 200) {
          localStorage.setItem("token", res.data.data.token);
          window.location.href = "/dashboard";
        } else {
          alert(res.data.message);
        }
      })
      .catch((err) => {
        alert(err);
      });
  };

  return (
    <>
      <div style={{ padding: "3rem" }}>
        <Form onSubmit={handleSubmit}>
          <h1
            style={{
              marginBottom: "40px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            Login into The App
          </h1>
          <Form.Group className="mb-3" controlId="loginId">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Username"
              onChange={(e) => setLoginId(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Button type="submit" style={{ marginTop: "20px" }}>
            Login
          </Button>
        </Form>
        <p>Don't have an account?, <a href="/">Register here</a></p>
      </div>
    </>
  );
}

export default Login;

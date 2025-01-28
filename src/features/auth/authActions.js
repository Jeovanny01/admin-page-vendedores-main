import { createAsyncThunk } from "@reduxjs/toolkit";

const apiUrl = "https://apitest.grupocarosa.com/ApiDatos/validarUsuarioApiWebMov";

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    console.log(`Soy el email ${email} y yo el password  ${password}`);
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: email,
          pass: password,
          empresa:"SVK"
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const data = await response.json();

      console.log(`Soy la data ${JSON.stringify(data)}`);

      if (!data || data.length === 0 || !data.ROL) {
        throw new Error("Invalid user credentials");
      }

      const user = data;
      const userInfo = {
        email: user.CORREO,
        state: user.ESTADO,
        name: user.NOMBRE,
        role: user.ROL,
        username: user.USUARIO,
      };

      // Save token and userInfo to localStorage
      localStorage.setItem("userToken", "mock-token");
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      return {
        userInfo,
        token: "mock-token",
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

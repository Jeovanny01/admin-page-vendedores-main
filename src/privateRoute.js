import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { userToken } = useSelector((state) => state.auth);

  return userToken ? children : <Navigate to="/" />;
};

export default PrivateRoute;

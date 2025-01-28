import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FaUser } from 'react-icons/fa';
import { logout } from '../features/auth/authSlice';
import './UserMenu.css';
import { redirect } from 'react-router-dom';

const UserMenu = ({ toggleSidebar, isSidebarOpen }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(isSidebarOpen);
  const dispatch = useDispatch();

  useEffect(() => {
    const savedPreference = localStorage.getItem('sidebarOpen') === 'true';
    setIsChecked(savedPreference);
  }, []);

  const handleCheckboxChange = () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    localStorage.setItem('sidebarOpen', newChecked);
    toggleSidebar();
  };

  const handleLogout = () => {
    dispatch(logout());
    redirect('/LoginPage');
  };

  return (
    <div className="user-menu-container">
      <FaUser size={24} onClick={() => setMenuOpen(!menuOpen)} className="user-icon" />
      {menuOpen && (
        <div className="user-menu">
          <div className="user-menu-item">
            <label style={{ color: 'black' }}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
               <span style={{ marginLeft: '10px' }}>Barra desplegada</span>
            </label>
          </div>
          <div className="user-menu-item">
            <button onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Header.css';
import logo from '../assets/logocuadrado.png';
import UserMenu from './../components/UserMenu';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  return (
    <Navbar className="header">
      <Container className="d-flex justify-content-between align-items-center head-container">
        <Navbar.Brand as={Link} to="/" className="logo-container">
          <img src={logo} alt="Logo" className="header-logo" />
        </Navbar.Brand>
        <UserMenu toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      </Container>
    </Navbar>
  );
};

export default Header;

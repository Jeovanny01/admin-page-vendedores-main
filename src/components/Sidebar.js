import React from "react";
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaMotorcycle,
  FaFileAlt,
  FaMapMarkerAlt,
  FaUserCircle
} from "react-icons/fa";
import "./Sidebar.css";
import { useSelector } from "react-redux";

const Sidebar = ({ isSidebarOpen }) => {
  const userInfo = useSelector((state) => state.auth.userInfo);

  return (
    <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
      <Nav defaultActiveKey="/CreateUserPage" className="flex-column">
        {userInfo && userInfo.role === 1 && (
          <Nav.Link as={Link} to="/CreateUserPage">
            <FaUser className="icon" />
            {isSidebarOpen && <span>Usuarios</span>}
          </Nav.Link>
        )}
        <Nav.Link as={Link} to="/DocsPage">
          <FaFileAlt className="icon" />
          {isSidebarOpen && <span>Visitas</span>}
        </Nav.Link>
        <Nav.Link as={Link} to="/SellersStatePage">
          <FaUserCircle className="icon" />
          {isSidebarOpen && <span>Estados</span>}
        </Nav.Link>
        <Nav.Link as={Link} to="/SellersPage">
          <FaMapMarkerAlt className="icon" />
          {isSidebarOpen && <span>Vendedores</span>}
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;

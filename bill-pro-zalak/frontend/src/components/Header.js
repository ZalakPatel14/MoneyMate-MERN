// frontend/src/components/Header.js
import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Header = ({ isLoggedIn, handleLogout }) => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" style={{ padding: '10px 20px' }}>
      <Navbar.Brand href="#">MONEYMATE</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          {isLoggedIn ? (
            <>
              <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/bill-splitter">Bill Splitter</Nav.Link>
              <Nav.Link as={Link} to="/expense-tracker">Expense Tracker</Nav.Link>
              <Button variant="outline-light" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : null}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;

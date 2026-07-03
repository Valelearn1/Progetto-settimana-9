import { Component } from "react";
import netflix_logo from "../assets/netflix_logo.jpg";
import { Container, Navbar, Nav, Form } from "react-bootstrap";

class Header extends Component {
  render() {
    return (
      <header className="d-flex align-items-start">
        <img src={netflix_logo} className="logo" alt="Logo Netflix" />
        <Navbar
          collapseOnSelect
          expand="lg"
          bg="dark"
          variant="dark"
          className="d-flex justify-content-between flex-grow-1"
        >
          <Container>
            <Navbar.Brand href="#home">Home</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="#">TV Shows</Nav.Link>
                <Nav.Link href="#">Movies</Nav.Link>
                <Nav.Link href="#">Recently Added</Nav.Link>
                <Nav.Link href="#">My List</Nav.Link>
              </Nav>
              <Form.Control
                type="text"
                placeholder="Search"
                className="search-input mx-3"
              />
              <Nav>
                <Nav.Link href="#">KIDS</Nav.Link>
                <Nav.Link href="#">🔔</Nav.Link>
                <Nav.Link href="#">👤</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>
    );
  }
}

export default Header;

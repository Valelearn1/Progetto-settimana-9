import { Component } from "react";
import netflixLogo from "./assets/netflix_logo.jpg";
import "./App.css";
import Header from "./components/Header";
import Cards from "./components/Cards";
import Footer from "./components/Footer";

class App extends Component {
  render() {
    return (
      <>
        <Header />
        <Cards />
        <Footer />
      </>
    );
  }
}

export default App;

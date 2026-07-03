import { Component } from "react";

const movies = [
  {
    Title: "Harry Potter and the Deathly Hallows: Part 2",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BOTA1Mzc2N2ItZWRiNS00MjQzLTlmZDQtMjU0NmY1YWRkMGQ4XkEyXkFqcGc@._V1_SX300.jpg",
  },
  {
    Title: "Harry Potter and the Sorcerer's Stone",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNTU1MzgyMDMtMzBlZS00YzczLThmYWEtMjU3YmFlOWEyMjE1XkEyXkFqcGc@._V1_SX300.jpg",
  },
  {
    Title: "Harry Potter and the Prisoner of Azkaban",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMTY4NTIwODg0N15BMl5BanBnXkFtZTcwOTc0MjEzMw@@._V1_SX300.jpg",
  },
  {
    Title: "Harry Potter and the Chamber of Secrets",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNGJhM2M2MWYtZjIzMC00MDZmLThkY2EtOWViMDhhYjRhMzk4XkEyXkFqcGc@._V1_SX300.jpg",
  },
];

class Cards extends Component {
  constructor(props) {
    super(props);
    this.state = {
      movies: movies,
    };
  }

  render() {
    const movieCards = this.state.movies.map((movie, index) => {
      return (
        <div key={index}>
          <img src={movie.Poster} alt={movie.Title} />
        </div>
      );
    });

    return <>{movieCards}</>;
  }
}

export default Cards;

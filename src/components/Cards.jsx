import { Component } from "react";

class Cards extends Component {
  constructor(props) {
    super(props);
    this.state = {
      movies: [],
    };
  }

  componentDidMount() {
    fetch("https://www.omdbapi.com/?apikey=24ad60e9&s=jurassic%20park")
      .then((res) => res.json())
      .then((data) => {
        this.setState({ movies: data.Search });
      });
  }

  render() {
    const movieCards = this.state.movies.map((movie, index) => {
      return (
        <div key={index}>
          <img
            src={movie.Poster}
            alt={movie.Title}
            onError={(e) =>
              (e.target.src = "https://placehold.co/300x445?text=No+Poster")
            }
          />
        </div>
      );
    });

    return <>{movieCards}</>;
  }
}

export default Cards;

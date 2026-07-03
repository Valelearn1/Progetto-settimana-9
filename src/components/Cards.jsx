import { Component } from "react";

const OMDB_API_KEY = "24ad60e9";

class Cards extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [
        { title: "Jurassic Park", query: "jurassic park", movies: [] },
        { title: "Harry Potter", query: "harry potter", movies: [] },
        { title: "Minions", query: "minions", movies: [] },
      ],
      error: null,
    };
  }

  componentDidMount() {
    this.state.categories.forEach((category, catIndex) => {
      fetch(
        `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(
          category.query
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          this.setState((prevState) => {
            const categories = [...prevState.categories];
            categories[catIndex] = {
              ...categories[catIndex],
              movies: data.Search || [],
            };
            return { categories };
          });
        })
        .catch((error) => {
          console.error(error);
          this.setState({ error: "Unable to load the movies" });
        });
    });
  }

  render() {
    if (this.state.error) {
      return <p className="cards-error">{this.state.error}</p>;
    }

    return (
      <div className="rows-container">
        {this.state.categories.map((category, catIndex) => (
          <div className="movie-row" key={catIndex}>
            <h2 className="row-title">{category.title}</h2>
            <div className="row-scroll">
              {category.movies.map((movie, index) => (
                <div className="movie-card" key={index}>
                  <img
                    src={movie.Poster}
                    alt={movie.Title}
                    onError={(e) =>
                      (e.target.src =
                        "https://placehold.co/300x445?text=No+Poster")
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default Cards;

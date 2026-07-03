import { Component } from "react";
import { Modal, Spinner } from "react-bootstrap";

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
      selectedMovie: null,
      loading: true,
    };
  }

  // Commento per me: componentDidMount è un metodo del ciclo di vita dei componenti
  //  a classe in React: viene chiamato automaticamente da React una sola volta,
  // subito dopo che il componente è stato "montato" (cioè renderizzato per la
  // prima volta nel DOM). È il punto giusto per fare chiamate di rete,
  // perché a quel punto il componente esiste già e puoi aggiornarne lo stato in sicurezza.
  componentDidMount() {
    this.state.categories.forEach((category, catIndex) => {
      fetch(
        `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(
          category.query,
        )}`,
      )
        .then((res) => res.json())
        .then((data) => {
          this.setState((prevState) => {
            const categories = [...prevState.categories];
            categories[catIndex] = {
              ...categories[catIndex],
              movies: data.Search || [],
              loading: false,
            };
            // true solo quando TUTTE le categorie hanno finito la fetch (loading === false su ognuna)
            const allLoaded =
              categories.filter((category) => {
                return category.loading === false;
              }).length === categories.length;
            return { categories, loading: !allLoaded };
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
      <>
        <div className="rows-container">
          {this.state.loading && (
            // componente spinner
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          )}
          {!this.state.loading &&
            this.state.categories.map((category, catIndex) => (
              <div className="movie-row" key={catIndex}>
                <h2 className="row-title">{category.title}</h2>
                <div className="row-scroll">
                  {category.movies.map((movie, index) => (
                    <div
                      className="movie-card"
                      key={index}
                      onClick={() => this.setState({ selectedMovie: movie })}
                    >
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
        <div></div>
      </>
    );
  }
}

export default Cards;

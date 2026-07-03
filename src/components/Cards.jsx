import { Component } from "react";
import { Modal, Spinner, Form, Button } from "react-bootstrap";

const OMDB_API_KEY = "24ad60e9";
const COMMENTS_API_URL = "https://striveschool-api.herokuapp.com/api/comments";
const COMMENTS_TOKEN = import.meta.env.VITE_COMMENTS_TOKEN;

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
      comments: [], // recensioni già esistenti per il film aperto nella modale
      commentsLoading: false, // true mentre stiamo scaricando i commenti esistenti
      commentText: "", // valore del textarea, aggiornato ad ogni carattere digitato (input controllato)
      commentRate: "", // valore del campo numero (voto)
      commentError: null, // messaggio d'errore se il salvataggio della review fallisce
    };
  }

  // Commento per me: si chiama quando clicco su una card. Apre la modale (mettendo
  // selectedMovie diverso da null) e fa una GET verso l'API delle review passando
  // l'imdbID del film, per recuperare le recensioni già scritte da altri.
  openMovie(movie) {
    this.setState({
      selectedMovie: movie,
      comments: [],
      commentsLoading: true,
      commentText: "",
      commentRate: "",
      commentError: null,
    });
    fetch(`${COMMENTS_API_URL}/${movie.imdbID}`, {
      headers: { Authorization: `Bearer ${COMMENTS_TOKEN}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // l'API restituisce direttamente un array di commenti (non un oggetto che li contiene)
        this.setState({
          comments: Array.isArray(data) ? data : [],
          commentsLoading: false,
        });
      })
      .catch((error) => {
        console.error(error);
        this.setState({ commentsLoading: false });
      });
  }

  // Commento per me: chiude la modale e resetta tutto lo stato collegato ad essa,
  // così la prossima volta che apro una card diversa non vedo dati vecchi.
  closeMovie() {
    this.setState({
      selectedMovie: null,
      comments: [],
      commentText: "",
      commentRate: "",
      commentError: null,
    });
  }

  // Commento per me: gestisce il submit del form della review. e.preventDefault()
  // impedisce il comportamento di default del form (che ricaricherebbe la pagina).
  // Faccio una POST con il commento, l'id del film e il voto; se va a buon fine,
  // aggiungo il nuovo commento a quelli già mostrati e svuoto i campi del form.
  submitComment(e) {
    e.preventDefault();
    const { selectedMovie, commentText, commentRate } = this.state;

    fetch(COMMENTS_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COMMENTS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: commentText,
        elementId: selectedMovie.imdbID,
        rate: Number(commentRate),
      }),
    })
      .then((res) => res.json())
      .then((newComment) => {
        this.setState((prevState) => ({
          comments: [...prevState.comments, newComment],
          commentText: "",
          commentRate: "",
        }));
      })
      .catch((error) => {
        console.error(error);
        this.setState({ commentError: "Unable to save the review" });
      });
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
                      onClick={() => this.openMovie(movie)}
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

        {/* Commento per me: la modale è controllata da selectedMovie. Quando è null
            (nessuna card cliccata) show={false} e React non la mostra. */}
        <Modal
          show={this.state.selectedMovie !== null}
          onHide={() => this.closeMovie()}
        >
          <Modal.Header closeButton>
            <Modal.Title>{this.state.selectedMovie?.Title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h6>Reviews</h6>
            {this.state.commentsLoading && <p>Reviews loading...</p>}
            {!this.state.commentsLoading &&
              this.state.comments.length === 0 && (
                <p>No reviews yet. Be the first to add one.</p>
              )}
            {!this.state.commentsLoading &&
              this.state.comments.map((c) => (
                <div key={c._id} className="comment-item">
                  <strong>{c.author}</strong> — Score: {c.rate}
                  <p>{c.comment}</p>
                </div>
              ))}

            <hr />

            <h6>Add a review</h6>
            {this.state.commentError && (
              <p className="cards-error">{this.state.commentError}</p>
            )}
            <Form onSubmit={(e) => this.submitComment(e)}>
              <Form.Group className="mb-3">
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={this.state.commentText}
                  onChange={(e) =>
                    this.setState({ commentText: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Score (1 to 5)</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="5"
                  value={this.state.commentRate}
                  onChange={(e) =>
                    this.setState({ commentRate: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Button type="submit">Send review</Button>
            </Form>
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

export default Cards;

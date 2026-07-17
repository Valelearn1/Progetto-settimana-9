import { Component } from "react";
import { Modal, Spinner, Form, Button } from "react-bootstrap";

const OMDB_API_KEY = "24ad60e9";
const COMMENTS_API_URL = "https://striveschool-api.herokuapp.com/api/comments";
const COMMENTS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YTQ2NTNlY2E0NjE0NDAwMTVlMDVjZjMiLCJpYXQiOjE3ODI5OTM5MDAsImV4cCI6MTc4NDIwMzUwMH0.BfZqaFoCGBdXZSZRNKmGHKCm2T8TxxdiDYjh6rzXXb8";

class Cards extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [
        { title: "Jurassic Park", query: "jurassic park", movies: [] },
        { title: "Harry Potter", query: "harry potter", movies: [] },
        { title: "Minions", query: "minions", movies: [] },
      ],
      selectedMovie: null,
      loading: true,
      comments: [], // recensioni già esistenti per il film aperto nella modale
      commentsLoading: false, // true mentre stiamo scaricando i commenti esistenti
      commentText: "", // valore del textarea, aggiornato ad ogni carattere digitato (input controllato)
      commentRate: 0, // numero di stelle scelte (0 = nessuna stella cliccata ancora)
      commentError: null, // messaggio d'errore se il salvataggio della review fallisce
    };
    // Commento per me: qui salvo i riferimenti ai veri elementi DOM <div class="row-scroll">
    // (uno per ogni categoria/riga di film), per poterci chiamare sopra scrollBy()
    // quando clicco le frecce. Non è this.state perché non è un dato da mostrare
    // o che deve far ripartire un render: è solo un "aggancio" all'elemento DOM,
    // per questo si chiama "ref" (reference) e vive fuori dallo state.
    this.rowRefs = {};
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
      commentRate: 0,
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
      commentRate: 0,
      commentError: null,
    });
  }

  // Commento per me: prendo il div "row-scroll" della categoria catIndex (salvato
  // in this.rowRefs) e lo faccio scorrere orizzontalmente. clientWidth è quanto
  // è largo il div che vediamo a schermo: scorrendo dell'80% di quella larghezza
  // avanzo "quasi una schermata" di card, lasciandone un pezzo visibile come
  // indizio che c'è altro dopo. Il segno (+ o -) decide la direzione.
  scrollRow(catIndex, direction) {
    const row = this.rowRefs[catIndex];
    if (!row) return;
    const amount = row.clientWidth * 0.8;
    row.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  }

  // Commento per me: piccola utility che disegna N icone stella, usata per
  // mostrare il voto di una recensione GIÀ scritta (sola lettura, niente
  // onClick/onKeyDown come nel selettore interattivo del form più sotto).
  renderStars(rating) {
    return [1, 2, 3, 4, 5].map((star) => (
      <i
        key={star}
        className={`bi ${star <= rating ? "bi-star-fill" : "bi-star"}`}
      ></i>
    ));
  }

  // Commento per me: gestisce il submit del form della review. e.preventDefault()
  // impedisce il comportamento di default del form (che ricaricherebbe la pagina).
  // Faccio una POST con il commento, l'id del film e il voto; se va a buon fine,
  // aggiungo il nuovo commento a quelli già mostrati e svuoto i campi del form.
  submitComment(e) {
    e.preventDefault();
    const { selectedMovie, commentText, commentRate } = this.state;

    // Commento per me: con le stelline commentRate è sempre un numero intero
    // tra 0 e 5 (0 = nessuna stella ancora cliccata), non serve più controllare
    // decimali o testo non numerico come col vecchio input number. L'unico caso
    // da bloccare è "utente non ha scelto nessuna stella".
    if (commentRate < 1) {
      this.setState({
        commentError: "Please select a score from 1 to 5 stars",
      });
      return;
    }

    fetch(COMMENTS_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COMMENTS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: commentText,
        elementId: selectedMovie.imdbID,
        rate: commentRate,
      }),
    })
      .then((res) => res.json())
      .then((newComment) => {
        this.setState((prevState) => ({
          comments: [...prevState.comments, newComment],
          commentText: "",
          commentRate: 0,
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
          // Commento per me: prima qui settavo un errore GLOBALE (this.state.error),
          // quindi se falliva anche una sola categoria, il render() interrompeva
          // TUTTO e mostrava solo il messaggio d'errore, nascondendo pure le
          // categorie che invece erano state caricate bene. Ora invece salvo
          // l'errore dentro alla categoria specifica che ha fallito (categories[catIndex]),
          // così le altre righe di film restano visibili normalmente.
          this.setState((prevState) => {
            const categories = [...prevState.categories];
            categories[catIndex] = {
              ...categories[catIndex],
              error: "Unable to load this category",
              // loading: false anche in caso di errore, altrimenti "allLoaded"
              // qui sotto non diventerebbe mai true e lo spinner globale
              // girerebbe all'infinito aspettando una categoria che non arriverà mai.
              loading: false,
            };
            const allLoaded = categories.every(
              (category) => category.loading === false,
            );
            return { categories, loading: !allLoaded };
          });
        });
    });
  }

  render() {
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
                {/* Commento per me: se QUESTA categoria ha un campo "error" (impostato
                    nel catch di componentDidMount), mostro il messaggio al posto
                    della fila di locandine, ma solo per lei. Le altre categorie,
                    che non hanno "error", continuano a mostrare "row-scroll" come sempre. */}
                {category.error ? (
                  <p className="cards-error">{category.error}</p>
                ) : (
                  // Commento per me: "row-scroll-wrapper" serve solo a poter
                  // posizionare le due frecce con position:absolute sopra la
                  // riga di card, senza che influenzino lo scroll orizzontale.
                  <div className="row-scroll-wrapper">
                    <button
                      type="button"
                      className="scroll-arrow scroll-arrow-left"
                      aria-label={`Scroll ${category.title} left`}
                      onClick={() => this.scrollRow(catIndex, "left")}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    <div
                      className="row-scroll"
                      // Commento per me: ref è una funzione che React chiama con
                      // il vero nodo DOM appena viene creato (o null quando viene
                      // rimosso). Lo salvo in this.rowRefs[catIndex] così scrollRow()
                      // può poi chiamarci sopra .scrollBy() direttamente.
                      ref={(el) => (this.rowRefs[catIndex] = el)}
                    >
                      {category.movies.map((movie) => (
                        <div
                          className="movie-card"
                          key={movie.imdbID}
                          role="button"
                          tabIndex={0}
                          onClick={() => this.openMovie(movie)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              this.openMovie(movie);
                            }
                          }}
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
                    <button
                      type="button"
                      className="scroll-arrow scroll-arrow-right"
                      aria-label={`Scroll ${category.title} right`}
                      onClick={() => this.scrollRow(catIndex, "right")}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                )}
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
                  <strong>{c.author}</strong> —{" "}
                  <span className="star-rating star-rating-sm">
                    {this.renderStars(c.rate)}
                  </span>
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
                {/* Commento per me: niente <input>, sono 5 icone "stella" che
                    disegno a mano con un map su [1,2,3,4,5]. Per ogni stella
                    confronto il suo numero con commentRate: se è <= commentRate
                    la disegno piena (bi-star-fill), altrimenti vuota (bi-star).
                    Cliccarne una imposta commentRate = numero di quella stella,
                    esattamente come succedeva prima scrivendo un numero nell'input. */}
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      role="button"
                      tabIndex={0}
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      className={`bi ${
                        star <= this.state.commentRate
                          ? "bi-star-fill"
                          : "bi-star"
                      }`}
                      onClick={() => this.setState({ commentRate: star })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          this.setState({ commentRate: star });
                        }
                      }}
                    ></i>
                  ))}
                </div>
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

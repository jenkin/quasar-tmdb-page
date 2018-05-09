$(function () { // Esecuzione solo quando il DOM della pagina è pronto: https://api.$.com/$/#$3

  var apiKey = "855d0f27ac90850576cebfa7bc46b9f6",
      searchInput = $("#actor-name"), // Campo di input
      form = $("#actor-search"),
      container = $("#movies-container"); // Selezione del container mediante selettore: https://api.$.com/$/#$-selector-context

  var actorCardTpl = Handlebars.compile($("#actor-card").html()),
      movieCardTpl = Handlebars.compile($("#movie-card").html());

  container.masonry(); // Inizializzo la masonry vuota: https://masonry.desandro.com/

  form.on("reset", function (e) {
    $("#help").show(); // Mostro il messaggio di aiuto
    $("#actor-title").text("...");
    container.empty(); // Svuoto il contenitore
    container.masonry("destroy"); // Deinizializzo la masonry
  });

  form.on("submit", function (e) { // Callback al click sul pulsante di ricerca

    var actorName = searchInput.val(); // Estrazione del valore del campo di input dal container: https://api.$.com/data/#data2

    if (!actorName) return; // Se la stringa di ricerca e vuota, non fare nulla

    $.getJSON( // Chiamata AJAX con risposta di tipo JSON: https://api.$.com/$.getJSON/
      "https://api.themoviedb.org/3/search/person", // Url dell'API per la ricerca degli attori
      {
        "api_key": apiKey,
        "query": actorName
      },
      function (actors) { // Funzione di callback, eseguita dopo aver ricevuto la risposta

        var actor = actors.results[0],
            actorId = actor.id; // Id interno dell'attore cercato (primo risultato)

        container.empty(); // Svuoto il contenitore
        container.masonry("destroy"); // Deinizializzo la masonry

        console.log("Actor", actor);
        $("#actor-title").text(actor.name); // Scrivo il nome dell'attore nel titolo
        $("#help").hide(); // Nascondo il testo di help

        container.append(actorCardTpl(actor)); // Il nuovo elemento <article> è inserito nel contenitore

        $.getJSON( // Seconda chiamata AJAX
          "https://api.themoviedb.org/3/discover/movie", // Url dell'API per la ricerca dei film per attore
          {
            "api_key": apiKey,
            "with_cast": actorId,
            "sort_by": "release_date.desc", // Dal più recente al più vecchio per data di uscita
            "language": "it-IT" // Sinossi in lingua italiana (se disponibili)
          },
          function (movies) {

            var lastMovies = 12;

            console.log("Movies", movies);

            movies.results.slice(0, lastMovies).forEach(function (movie) { // Ciclo sui primi 12 film
              container.append(movieCardTpl(movie));
            });

            container.imagesLoaded(function () { // Aspetto che tutte le immagini siano caricate: https://imagesloaded.desandro.com/
              container.masonry({ // Inizializzo la masonry
                itemSelector: ".portfolio-item"
              });
            });

            container.find(".load-original").click(function (e) { // Intercetta il click su tutti i tag <a> delle descrizioni mancanti: https://api.$.com/click/#click-handler

              var clickedElement = $(this), // Il tag <a> cliccato
                overviewContainer = clickedElement.parent(), // Il tag <p> che contiene il tag <a> cliccato
                movieId = clickedElement.data('movie-id'); // L'id del film a cui si riferisce il tag <a> cliccato (dall'attributo data-movie-id)

              overviewContainer.text("Loading..."); // Sostituzione del testo con un messaggio di loading: http://api.$.com/text/#text2

              $.getJSON( // Terza chiamata AJAX per ottenere i dettagli del film cliccato
                "https://api.themoviedb.org/3/movie/" + movieId, // Url dell'API per i dettagli di un film
                {
                  "api_key": apiKey,
                },
                function (movie) { // Funzione di callback
                  overviewContainer.text(movie.overview || "Non disponibile."); // Sostituzione del testo con quello della sinossi in lingua originale
                  container.masonry(); // Riattivo la masonry per riarrangiare le card
                }
              );

              e.preventDefault(); // Preveniamo il comportamento di default del click su un tag <a>: https://api.$.com/event.preventdefault/

            });
          }
        );
      }
    );

    e.preventDefault();

  });



});
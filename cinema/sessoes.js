// Função para criar o elemento do filme
function createMovieElement(movieId, movieData) {
  const movieElement = document.createElement('div');
  movieElement.classList.add('card', 'top-level');
  

  // Adicione a imagem do filme, se disponível
  if (movieData.images && movieData.images.length > 0) {
    const movieImageLink = document.createElement('a'); // Cria um elemento de link
    movieImageLink.href = movieData.siteURL; // Define o atributo href para a URL da página de detalhes do filme
    movieImageLink.target = '_blank'; // Adiciona o atributo target


    const movieImage = document.createElement('img');
    movieImage.src = movieData.images[0].url;
    movieImage.alt = movieData.title;
    movieImage.style.width = '350px'; // Define a largura da imagem
    movieImage.classList.add('card-img-top'); // Adiciona a classe do Bootstrap

    movieImageLink.appendChild(movieImage); // Adiciona a imagem ao link
    movieElement.appendChild(movieImageLink); // Adiciona o link ao elemento do filme
  }

  
// Cria o corpo do card
const cardBody = document.createElement('div');
cardBody.classList.add('card-body');
movieElement.appendChild(cardBody);

// Detalhes do filme
const movieTitle = document.createElement('h5');
movieTitle.textContent = movieData.title;
movieTitle.classList.add('card-title'); // Adiciona a classe do Bootstrap
cardBody.appendChild(movieTitle);

  // Adicione detalhes adicionais do filme
  const movieDetails = document.createElement('p');
  movieDetails.textContent = ``;
  movieDetails.classList.add('card-text'); // Adiciona a classe do Bootstrap
  cardBody.appendChild(movieDetails);


  function getBadgeColor(rating) {
    switch (rating) {
      case 'Livre':
        return 'badge-success';
      case '10 anos':
        return 'badge-primary';        
      case '12 anos':
        return 'badge-warning';
      case '14 anos':
        return 'badge-orange';
      case '16 anos':
        return 'badge-danger';
      case '18 anos':
        return 'badge-dark';
      default:
        return 'badge-secondary'; // Cor padrão para classificações desconhecidas
    }
  }
  

// Adicione a classificação como um badge
const movieRating = document.createElement('span');
movieRating.textContent = movieData.contentRating;
movieRating.classList.add('badge', getBadgeColor(movieData.contentRating)); // Adiciona as classes do Bootstrap
movieDetails.appendChild(movieRating);

movieDetails.appendChild(document.createTextNode(` ${movieData.genres.join(', ')} - ${movieData.duration} min.`));

// Adicione o botão de trailer, se a URL do trailer estiver disponível
if (movieData.trailers && movieData.trailers.length > 0) {
  const trailerButton = document.createElement('button');
  trailerButton.innerHTML = '<i class="fa-solid fa-play"></i> Trailer';
  trailerButton.classList.add('btn', 'btn-primary'); // Adiciona as classes do Bootstrap

  var trailerUrl = movieData.trailers[0].embeddedUrl;
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    // Se estiver em um dispositivo móvel, defina o botão para redirecionar para a URL do trailer
    trailerButton.onclick = function() {
      window.location.href = trailerUrl;
    };
  } else {
    // Se não estiver em um dispositivo móvel, defina o botão para abrir o modal
    trailerButton.dataset.toggle = 'modal';
    trailerButton.dataset.target = '#trailerModal';
    trailerButton.dataset.trailer = trailerUrl;
  }

  trailerButton.style.marginBottom = '20px'; // Adiciona uma margem inferior de 20px
  cardBody.appendChild(trailerButton);
}




// Cria o acordeão para as sessões
const accordion = document.createElement('div');
accordion.classList.add('accordion');
accordion.id = `accordion${movieId}`;
cardBody.appendChild(accordion);

// Loop através dos cinemas e exibir detalhes
let cinemaId = 0;
for (let cinema in movieData.cinemas) {
  const cinemaCard = document.createElement('div');
  cinemaCard.classList.add('card');
  accordion.appendChild(cinemaCard);


    const cinemaHeader = document.createElement('div');
    cinemaHeader.classList.add('card-header');
    cinemaHeader.id = `heading${movieId}${cinemaId}`;
    cinemaCard.appendChild(cinemaHeader);

    const cinemaButton = document.createElement('button');
    cinemaButton.classList.add('btn', 'btn-link');
    cinemaButton.type = 'button';
    cinemaButton.dataset.toggle = 'collapse';
    cinemaButton.dataset.target = `#collapse${movieId}${cinemaId}`;
    cinemaButton.textContent = cinema;
    cinemaHeader.appendChild(cinemaButton);

    const cinemaCollapse = document.createElement('div');
    cinemaCollapse.id = `collapse${movieId}${cinemaId}`;
    cinemaCollapse.classList.add('collapse');
    cinemaCollapse.dataset.parent = `#accordion${movieId}`;
    cinemaCard.appendChild(cinemaCollapse);

    const cinemaBody = document.createElement('div');
    cinemaBody.classList.add('card-body');
    cinemaCollapse.appendChild(cinemaBody);

    movieData.cinemas[cinema].forEach(room => {
      const roomName = document.createElement('h5');
      roomName.textContent = room.name;
      cinemaBody.appendChild(roomName);

      room.sessions.forEach(session => {
        const sessionDetails = document.createElement('p');
        sessionDetails.classList.add('session-details');
        sessionDetails.textContent = `${session.date} - ${session.time} - ${session.type}`;
        cinemaBody.appendChild(sessionDetails);
      });
    });

    cinemaId++;
  }

  return movieElement;
}

const cityId = 32; // Substitua pelo ID da cidade real
const urlCinemas = `https://cors.mosaicoworkers.workers.dev/api-content.ingresso.com/v0/theaters/city/${cityId}?partnership=marcotulio`;

// Objeto para armazenar os filmes e suas sessões
let movies = {};

fetch(urlCinemas)
  .then(response => response.json())
  .then(data => {
    console.log("Dados recebidos:", data);

    if (data) {
      let promises = data.map(cinema => {
        const theaterId = cinema.id;
        const urlSessions = `https://cors.mosaicoworkers.workers.dev/api-content.ingresso.com/v0/sessions/city/${cityId}/theater/${theaterId}?partnership=marcotulio`;
        return fetch(urlSessions)
          .then(response => response.json())
          .then(sessionData => {
            if (sessionData && sessionData[0] && sessionData[0].movies) {
              sessionData[0].movies.forEach(movie => {
                // Se o filme ainda não está no objeto movies, adicione-o
                if (!movies[movie.id]) {
                  movies[movie.id] = {
                    title: movie.title,
                    images: movie.images, // Adicione esta linha
                    duration: movie.duration,
                    contentRating: movie.contentRating,
                    genres: movie.genres,
                    siteURL: movie.siteURL, // Adicione esta linha
                    trailers: movie.trailers, // Adicione esta linha
                    cinemas: {}
                  };
                }
                // Adicione o cinema e as sessões ao filme
                movies[movie.id].cinemas[cinema.name] = movie.rooms.map(room => ({
                  name: room.name,
                  sessions: room.sessions.map(session => ({
                    date: session.date.dayAndMonth,
                    time: session.time,
                    type: session.types[0].name,
                  }))
                }));
              });
            } else {
              console.error('Dados de sessão não encontrados');
            }
          })
          .catch(error => console.error('Erro ao obter dados da API:', error));
      });

      // Aguarde todas as promessas serem resolvidas
      Promise.all(promises).then(() => {
        const sessionsContainer = document.querySelector('.sessions-container');
        for (let movieId in movies) {
          const movieElement = createMovieElement(movieId, movies[movieId]);
          sessionsContainer.appendChild(movieElement);
        }
      });
    } else {
      console.error('Dados de cinema não encontrados');
    }
  })
  .catch(error => console.error('Erro ao obter dados da API:', error));


  



  $(document).ready(function() {
    var player;
  
    $('#trailerModal').on('show.bs.modal', function (event) {
      var button = $(event.relatedTarget); // Botão que acionou o modal
      var trailerUrl = 'https:' + button.data('trailer'); // Extrai a URL do trailer dos dados do botão
  
      var modal = $(this);
      var trailerIframe = modal.find('#trailer');
      trailerIframe.attr('src', trailerUrl);
  
      // Inicializa o Plyr
      player = Plyr.setup(trailerIframe.get(0));
    });
  
    $('#trailerModal').on('hide.bs.modal', function (event) {
      var modal = $(this);
      modal.find('#trailer').attr('src', ''); // Limpa a URL do trailer quando o modal é fechado
  
      if (player) {
        player.destroy(); // Destroi o Plyr quando o modal é fechado
      }
    });
  });
  
 
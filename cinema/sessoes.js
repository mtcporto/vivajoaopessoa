// Função para criar o elemento do filme
function createMovieElement(movieId, movieData) {
  const movieElement = document.createElement('div');
  movieElement.classList.add('movie-container');

  // Detalhes do filme
  const movieTitle = document.createElement('h3');
  movieTitle.textContent = movieData.title;
  movieElement.appendChild(movieTitle);

  // Adicione a imagem do filme, se disponível
  if (movieData.images && movieData.images.length > 0) {
    const movieImage = document.createElement('img');
    movieImage.src = movieData.images[0].url;
    movieImage.alt = movieData.title;
    movieElement.appendChild(movieImage);
  }

  // Adicione detalhes adicionais do filme
  const movieDetails = document.createElement('p');
  movieDetails.textContent = `Duração: ${movieData.duration}, Classificação: ${movieData.contentRating}, Gêneros: ${movieData.genres.join(', ')}`;
  movieElement.appendChild(movieDetails);

  // Loop através dos cinemas e exibir detalhes
  for (let cinema in movieData.cinemas) {
    const cinemaName = document.createElement('h4');
    cinemaName.textContent = cinema;
    movieElement.appendChild(cinemaName);

    movieData.cinemas[cinema].forEach(room => {
      const roomName = document.createElement('h5');
      roomName.textContent = room.name;
      movieElement.appendChild(roomName);

      room.sessions.forEach(session => {
        const sessionDetails = document.createElement('p');
        sessionDetails.classList.add('session-details');
        sessionDetails.textContent = `${session.date} - ${session.time} - ${session.type} - ${session.language} - R$${session.price}`;
        movieElement.appendChild(sessionDetails);
      });
    });
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
                    language: session.language,
                    price: session.price
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

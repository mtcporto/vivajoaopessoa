// cinema-home.js - Script para carregar filmes na página inicial
// Constantes para cache de cinema
const CINEMA_CACHE_KEY = 'cinemaData';
const CINEMA_CACHE_DATE_KEY = 'cinemaDataDate';

// Função para obter a cor do badge de classificação
function getRatingClass(rating) {
  switch (rating) {
    case 'Livre': return 'rating-livre';
    case '10 anos': return 'rating-10';
    case '12 anos': return 'rating-12';
    case '14 anos': return 'rating-14';
    case '16 anos': return 'rating-16';
    case '18 anos': return 'rating-18';
    default: return 'rating-livre';
  }
}

// Função para carregar os filmes
async function loadFilmes() {
  const filmesGrid = document.getElementById('filmes-grid');
  if (!filmesGrid) return;
  
  // Limpar conteúdo atual e mostrar loading
  filmesGrid.innerHTML = '<div class="loading-placeholder"><i class="fas fa-film"></i><p>Carregando filmes em cartaz...</p></div>';
  
  let cinemaData;
  
  // Tenta usar o cache primeiro
  if (localStorage.getItem(CINEMA_CACHE_DATE_KEY) === getTodayDateString()) {
    try {
      cinemaData = JSON.parse(localStorage.getItem(CINEMA_CACHE_KEY));
      // console.log('Usando cache dos dados de cinema');
    } catch (error) {
      // console.error('Erro ao carregar dados do cache:', error);
      // Se houver erro no cache, tenta buscar dados novos
      cinemaData = null;
    }
  }
  
  // Se não temos dados em cache ou o cache falhou, buscar dados novos
  if (!cinemaData) {
    try {
      // URL da API de filmes (usando o mesmo endpoint do cinema/index.html)
      const cityId = 32; // João Pessoa
      const urlNowPlaying = `https://cors.mosaicoworkers.workers.dev/api-content.ingresso.com/v0/templates/nowplaying/${cityId}?partnership=marcotulio`;
      
      const response = await fetch(urlNowPlaying);
      if (!response.ok) {
        throw new Error(`Erro na resposta da API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Salvar no cache
      localStorage.setItem(CINEMA_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CINEMA_CACHE_DATE_KEY, getTodayDateString());
      
      cinemaData = data;
      // console.log('Dados de cinema buscados e salvos em cache');
    } catch (error) {
      // console.error('Erro ao buscar dados de cinema:', error);
      filmesGrid.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Não foi possível carregar os filmes no momento.</div>';
      return;
    }
  }
  
  // Limpar o placeholder
  filmesGrid.innerHTML = '';
  
  // Verificar se temos itens para mostrar
  let moviesArray = [];
  if (cinemaData && cinemaData.items) {
    moviesArray = cinemaData.items;
  } else if (cinemaData && Array.isArray(cinemaData)) {
    moviesArray = cinemaData;
  } else {
    filmesGrid.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Nenhum filme encontrado.</div>';
    return;
  }
  
  // Verificar se temos filmes
  if (moviesArray.length === 0) {
    filmesGrid.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Nenhum filme em exibição no momento.</div>';
    return;
  }
  
  // Vamos filtrar apenas filmes que não estão em pré-venda
  const today = new Date();
  // console.log('Total de filmes recebidos da API:', moviesArray.length);
  
  // Filtrar excluindo os filmes em pré-venda
  const moviesWithSessions = moviesArray.filter(movie => !movie.inPreSale);
  
  // console.log('Filmes disponíveis para exibição (excluindo pré-venda):', moviesWithSessions.length);
  
  // Verificar se temos filmes disponíveis após a filtragem
  if (moviesWithSessions.length === 0) {
    filmesGrid.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Nenhum filme em cartaz no momento (excluindo pré-vendas).</div>';
    return;
  }
  
  // Selecionar apenas 4 filmes aleatoriamente dos que já estão em cartaz
  const selectedMovies = [...moviesWithSessions]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
  
  // Criar os cards para os filmes selecionados
  selectedMovies.forEach(movie => {
    // Verificar se temos uma imagem para mostrar
    const posterImage = movie.images?.find(img => img.type === "PosterPortrait");
    
    // Imagem padrão caso não tenha imagem do filme
    let imgSrc = '/imagens/cinema.jpeg';
    if (posterImage && posterImage.url) {
      imgSrc = posterImage.url;
    }
    
    const card = document.createElement('div');
    card.className = 'filme-card';
    
    // Container para a imagem (para poder adicionar o badge de estreia)
    const imgContainer = document.createElement('div');
    imgContainer.className = 'filme-img-container';
    
    // Imagem do filme
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = movie.title;
    img.className = 'filme-img';
    img.onerror = function() {
      this.onerror = null;
      this.src = '/imagens/cinema.jpeg';
    };
    imgContainer.appendChild(img);
    
    // Verificar se é filme em pré-venda
    if (movie.inPreSale === true) {
      const preVendaBadge = document.createElement('div');
      preVendaBadge.className = 'estreia-badge';
      preVendaBadge.style.backgroundColor = '#007bff';
      preVendaBadge.innerHTML = '<i class="fas fa-ticket-alt"></i> Pré-venda';
      imgContainer.appendChild(preVendaBadge);
    }
    // Verificar se é estreia recente (7 dias)
    else if (movie.premiereDate) {
      const premiereDate = new Date(movie.premiereDate);
      const today = new Date();
      const diffTime = Math.abs(today - premiereDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7 && premiereDate <= today) {
        const estreiaBadge = document.createElement('div');
        estreiaBadge.className = 'estreia-badge';
        estreiaBadge.innerHTML = '<i class="fas fa-star"></i> Estreia';
        imgContainer.appendChild(estreiaBadge);
      }
    }
    
    card.appendChild(imgContainer);
    
    // Informações do filme
    const infoDiv = document.createElement('div');
    infoDiv.className = 'filme-info';
    
    // Título do filme
    const title = document.createElement('h4');
    title.textContent = movie.title || 'Título não disponível';
    infoDiv.appendChild(title);
    
    // Classificação e gênero
    const details = document.createElement('p');
    
    // Classificação
    if (movie.contentRating) {
      const rating = document.createElement('span');
      rating.className = 'filme-rating ' + getRatingClass(movie.contentRating);
      rating.textContent = movie.contentRating;
      details.appendChild(rating);
    }
    
    // Gêneros
    if (movie.genres && movie.genres.length > 0) {
      details.appendChild(document.createTextNode(movie.genres.join(', ')));
    }
    
    infoDiv.appendChild(details);
    card.appendChild(infoDiv);
    
    // Tornar o cartão clicável
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      window.location.href = '/cinema/';
    });
    
    filmesGrid.appendChild(card);
  });
  
  // Se não conseguimos mostrar nenhum filme, exibir mensagem
  if (filmesGrid.children.length === 0) {
    filmesGrid.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Não foi possível carregar os filmes no momento.</div>';
  }
}

// Função para obter a data atual no formato "YYYY-MM-DD"
function getTodayDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// artistas-home.js - Script para carregar artistas na página inicial

// Constantes para cache
const ARTISTAS_CACHE_KEY = 'artistasData';
const ARTISTAS_CACHE_DATE_KEY = 'artistasDataDate';

// Constantes para API do Spotify
const CLIENT_ID = "81fe610cb0784b629af48e2ae0b30fdf";
const CLIENT_SECRET = "b6cbe5ba48584b458bb334242b912bb5";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1/artists/";

// Funções para API do Spotify
async function getSpotifyToken() {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
  });
  const data = await response.json();
  return data.access_token;
}

// Extrair ID do artista da URL do Spotify
function extractSpotifyArtistId(url) {
  try {
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];
    const artistId = lastPart.split("?")[0];
    return artistId;
  } catch (e) {
    return null;
  }
}

// Buscar imagem do artista no Spotify
async function fetchArtistImage(artistId, token) {
  console.log(`Buscando imagem do Spotify para artista ID: ${artistId}`);
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}${artistId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error(`Erro na resposta do Spotify: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extrair imagem
    if (data.images && data.images.length > 0) {
      console.log(`Imagem encontrada para ${artistId}:`, data.images[0].url);
      return data.images[0].url;
    } else {
      console.log(`Nenhuma imagem encontrada para ${artistId}`);
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar imagem do artista:', error);
    return null;
  }
}

// Carregar dados dos artistas
async function loadArtistas() {
  console.log('Carregando artistas...');
  const artistasGrid = document.getElementById('artistas-grid');
  if (!artistasGrid) {
    console.error('Elemento artistasGrid não encontrado');
    return;
  }
  
  // Limpar conteúdo atual e mostrar loading
  artistasGrid.innerHTML = '<div class="loading-placeholder"><i class="fas fa-music"></i><p>Carregando artistas locais...</p></div>';
  
  let artistasData;
  
  // Tenta usar cache para o data.json
  if (localStorage.getItem(ARTISTAS_CACHE_DATE_KEY) === getTodayDateString()) {
    artistasData = JSON.parse(localStorage.getItem(ARTISTAS_CACHE_KEY));
    console.log('Usando cache dos dados de artistas');
  } else {
    try {
      // Busca os dados do arquivo data.json
      const response = await fetch('/artistas/data.json');
      artistasData = await response.json();
      
      // Salva no cache
      localStorage.setItem(ARTISTAS_CACHE_KEY, JSON.stringify(artistasData));
      localStorage.setItem(ARTISTAS_CACHE_DATE_KEY, getTodayDateString());
      
      console.log('Dados de artistas buscados e salvos em cache');
    } catch (error) {
      console.error('Erro ao buscar dados de artistas:', error);
      artistasGrid.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Não foi possível carregar os artistas no momento.</div>';
      return;
    }
  }

  // Limpar o conteúdo atual
  artistasGrid.innerHTML = '';
  
  // Selecionar artistas que possuem perfil no Spotify
  const artistasComSpotify = artistasData.artistas.filter(artista => 
    artista.canais && artista.canais.spotify
  );
  
  // Selecionar 4 artistas aleatoriamente, priorizando aqueles com Spotify
  let selectedArtistas;
  if (artistasComSpotify.length >= 4) {
    selectedArtistas = [...artistasComSpotify]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  } else {
    // Se não temos 4 artistas com Spotify, complementar com outros
    const artistasComSpotifyIds = artistasComSpotify.map(a => a.nome);
    const artistasSemSpotify = artistasData.artistas.filter(
      artista => !artistasComSpotifyIds.includes(artista.nome)
    );
    
    const complemento = [...artistasSemSpotify]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4 - artistasComSpotify.length);
    
    selectedArtistas = [...artistasComSpotify, ...complemento];
  }
  
  console.log(`Artistas selecionados: ${selectedArtistas.map(a => a.nome).join(', ')}`);
  
  // Obter token do Spotify para buscar imagens
  let spotifyToken;
  try {
    spotifyToken = await getSpotifyToken();
  } catch (error) {
    console.error('Erro ao obter token do Spotify:', error);
  }
  
  // Criar cards para os artistas selecionados
  for (const artista of selectedArtistas) {
    const card = document.createElement('div');
    card.className = 'artista-card';
    
    // Placeholder para a imagem enquanto carrega
    let imagePath = '/imagens/artistas.jpeg';
    
    // Se o artista tem Spotify, tenta buscar a imagem de lá
    if (spotifyToken && artista.canais && artista.canais.spotify) {
      const artistId = extractSpotifyArtistId(artista.canais.spotify);
      if (artistId) {
        try {
          console.log(`Buscando imagem para artista ${artista.nome} com ID: ${artistId}`);
          
          // Obter diretamente a imagem do artista 
          const response = await fetch(`${SPOTIFY_API_BASE}${artistId}`, {
            headers: { "Authorization": `Bearer ${spotifyToken}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.images && data.images.length > 0) {
              imagePath = data.images[0].url;
              console.log(`Imagem do Spotify obtida para ${artista.nome}: ${imagePath}`);
            }
          } else {
            console.warn(`Erro ao buscar imagem do Spotify: ${response.status}`);
          }
        } catch (error) {
          console.warn(`Não foi possível buscar imagem do Spotify para ${artista.nome}:`, error);
        }
      }
    }
    
    // Se não conseguimos imagem do Spotify e o artista tem imagem definida, usa a imagem local
    if (!imagePath.startsWith('http') && artista.imagem) {
      // Corrigir caminho da imagem para adicionar o prefixo /artistas/ se necessário
      if (artista.imagem.startsWith('http')) {
        imagePath = artista.imagem;
      } else if (artista.imagem.startsWith('/')) {
        imagePath = artista.imagem;
      } else {
        imagePath = '/artistas/' + artista.imagem;
      }
      console.log(`Usando caminho local da imagem para ${artista.nome}: ${imagePath}`);
    }
    
    // Container para a imagem como link para o Spotify ou página do artista 
    const imageLink = document.createElement('a');
    if (artista.canais && artista.canais.spotify) {
      imageLink.href = artista.canais.spotify;
      imageLink.target = "_blank";
    } else if (artista.canais && artista.canais.instagram) {
      imageLink.href = artista.canais.instagram;
      imageLink.target = "_blank";
    } else {
      imageLink.href = `/artistas/#${artista.id || encodeURIComponent(artista.nome)}`;
    }
    
    // Imagem do artista
    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = artista.nome;
    img.className = 'artista-img';
    img.onerror = function() {
      this.onerror = null;
      this.src = '/imagens/artistas.jpeg';
    };
    
    imageLink.appendChild(img);
    card.appendChild(imageLink);
    
    // Informações do artista
    const infoDiv = document.createElement('div');
    infoDiv.className = 'artista-info';
    
    // Nome do artista
    const nome = document.createElement('h4');
    nome.textContent = artista.nome;
    infoDiv.appendChild(nome);
    
    card.appendChild(infoDiv);
    artistasGrid.appendChild(card);
  }
  
  // Se não conseguimos mostrar nenhum artista, exibir mensagem
  if (artistasGrid.children.length === 0) {
    artistasGrid.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Não foi possível carregar os artistas no momento.</div>';
  }
}

// Função genérica para buscar e cachear dados
function getCachedData(cacheKey, cacheDateKey, fetchFn) {
  if (localStorage.getItem(cacheDateKey) === getTodayDateString()) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return Promise.resolve(JSON.parse(cached));
    }
  }
  return fetchFn().then(data => {
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(cacheDateKey, getTodayDateString());
    return data;
  });
}

// Função para obter a data atual no formato "YYYY-MM-DD"
function getTodayDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

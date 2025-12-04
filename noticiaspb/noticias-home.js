// Script para carregar notícias na página inicial
function loadNoticias() {
  const noticiasGrid = document.getElementById('noticias-grid');
  if (!noticiasGrid) return;
  
  // Limpa o conteúdo existente (placeholder)
  noticiasGrid.innerHTML = '';
  
  // Temos que garantir que as funções de carregamento existem
  const g1Function = typeof loadG1News === 'function' ? loadG1News : (callback) => callback([]);
  const clickpbFunction = typeof loadClickPBNews === 'function' ? loadClickPBNews : (callback) => callback([]);
  const wscomFunction = typeof loadWSCOMNews === 'function' ? loadWSCOMNews : (callback) => callback([]);
  
  // Array com todas as promessas (fontes de notícias)
  const promises = [
    new Promise(resolve => g1Function(resolve)),
    new Promise(resolve => clickpbFunction(resolve)),
    new Promise(resolve => wscomFunction(resolve))
  ];
  
  let processedNews = [];
  let newsPerSource = { 'G1': [], 'ClickPB': [], 'WSCOM': [] };
  
  // Processa cada fonte assim que estiver disponível
  promises.forEach(promise => {
    promise.then(news => {
      if (news && news.length > 0) {
        // Classificar notícias por fonte em vez de combinar
        news.forEach(item => {
          if (item.source && newsPerSource[item.source]) {
            newsPerSource[item.source].push(item);
          }
        });
        
        // Atualizar processedNews para compatibilidade
        processedNews = [
          ...newsPerSource['G1'], 
          ...newsPerSource['ClickPB'], 
          ...newsPerSource['WSCOM']
        ];
        
        // Renderiza apenas uma vez após atualizar
        renderNoticias(newsPerSource);
      }
    });
  });
  
  // Quando todas estiverem prontas (ou após timeout), faz a atualização final
  Promise.race([
    Promise.all(promises),
    new Promise(resolve => setTimeout(() => resolve([]), 5000)) // Timeout de 5s
  ])
    .then(() => {
      // Verifica se temos alguma notícia de qualquer fonte
      if (Object.values(newsPerSource).every(arr => arr.length === 0)) {
        renderError();
        return;
      }
      
      // Ordena cada fonte por data para garantir notícias mais recentes
      Object.keys(newsPerSource).forEach(source => {
        if (newsPerSource[source].length > 0) {
          newsPerSource[source].sort((a, b) => new Date(b.date) - new Date(a.date));
        }
      });
      
      // Renderiza uma vez com os dados organizados por fonte
      renderNoticias(newsPerSource);
    })
    .catch(error => {
      // console.error('Erro ao carregar notícias:', error);
      renderError();
    });
  
  function renderNoticias(noticiasPerSource) {
    // Limpa o grid antes de renderizar
    noticiasGrid.innerHTML = '';
    
    // Selecionar exatamente uma notícia de cada fonte
    const selectedNews = [];
    const fontes = ['G1', 'ClickPB', 'WSCOM'];
    
    // console.log('Status das notícias por fonte:', {
    //   'G1': noticiasPerSource['G1'].length,
    //   'ClickPB': noticiasPerSource['ClickPB'].length,
    //   'WSCOM': noticiasPerSource['WSCOM'].length
    // });
    
    // Pega exatamente uma notícia de cada fonte disponível
    fontes.forEach(fonte => {
      if (noticiasPerSource[fonte] && noticiasPerSource[fonte].length > 0) {
        // Pegue a primeira (mais recente) notícia desta fonte
        selectedNews.push(noticiasPerSource[fonte][0]);
        // console.log(`Adicionou notícia de ${fonte}:`, noticiasPerSource[fonte][0].title);
      }
    });
    
    // Se tivermos menos de 3 notícias, mostra apenas o que temos
    // console.log('Total de notícias selecionadas:', selectedNews.length);
    
    if (selectedNews.length === 0) {
      renderError();
      return;
    }
    
    // Para cada notícia selecionada, cria um card
    selectedNews.forEach(noticia => {
      // Garante que temos uma imagem válida
      const imgSrc = noticia.image && !noticia.image.includes('placeholder') ? 
                    noticia.image : 'imagens/noticias.jpeg';
      
      // Formata a data para exibição
      let dateDisplay = '';
      if (noticia.date) {
        try {
          // Verifica se a data já está formatada como string DD/MM/YYYY
          if (noticia.date.includes('/')) {
            // Use só dia e mês se já for string formatada
            dateDisplay = noticia.date.split(' ')[0]; // Pega só a parte da data, não a hora
          } else {
            // Tente converter para Data e formatar
            const date = new Date(noticia.date);
            if (!isNaN(date.getTime())) {
              dateDisplay = date.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});
            } else {
              dateDisplay = ''; // Se não conseguir formatar, deixa vazio
            }
          }
        } catch (e) {
          dateDisplay = '';
        }
      }
      
      // Limitar o título para evitar cards muito grandes
      const tituloLimitado = noticia.title.length > 80 ? 
                           noticia.title.substring(0, 77) + '...' : 
                           noticia.title;
      
      const noticiaHTML = `
        <a href="/noticiaspb/" class="noticia-card-link">
          <div class="noticia-card">
            <div class="noticia-img-container">
              <img src="${imgSrc}" alt="${noticia.title}" class="noticia-img" onerror="this.src='imagens/noticias.jpeg'">
              <span class="fonte-badge badge ${getBadgeClass(noticia.source)}">
                ${noticia.source || 'Notícia'}
              </span>
            </div>
            <div class="noticia-info">
              <h4 title="${noticia.title}" class="noticia-titulo">${tituloLimitado}</h4>
              <div class="noticia-data">${dateDisplay}</div>
            </div>
          </div>
        </a>
      `;
      noticiasGrid.innerHTML += noticiaHTML;
    });
  }
  
  // Helper para definir a cor do badge por fonte
  function getBadgeClass(source) {
    switch(source) {
      case 'G1': return 'bg-danger badge-danger';  // vermelho
      case 'ClickPB': return 'bg-warning badge-warning';  // amarelo
      case 'WSCOM': return 'bg-primary badge-primary';  // azul
      default: return 'bg-secondary badge-secondary';
    }
  }
  
  function renderError() {
    noticiasGrid.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        Não foi possível carregar as notícias no momento. Tente novamente mais tarde.
      </div>
    `;
  }
}  // A função será chamada a partir do script principal
// Auto-executar para teste
document.addEventListener('DOMContentLoaded', loadNoticias);

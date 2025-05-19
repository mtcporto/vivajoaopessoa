// shows-home.js - Script para carregar shows e eventos na página inicial
// Constantes para cache de eventos
const EVENTOS_CACHE_KEY = 'eventosData';
const EVENTOS_CACHE_DATE_KEY = 'eventosDataDate';
const EVENTOS_CACHE_DURATION = 1; // 1 dia

// Função para analisar a data do evento
function parseEventDate(dateStr) {
  if (!dateStr) return null;
  
  // Normaliza a string de data
  dateStr = dateStr.trim().toLowerCase().replace(/\s+/g, ' ');
  
  // Se for uma data ISO padrão ou já um objeto Date
  if (dateStr instanceof Date) return dateStr;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateStr)) {
    try {
      return new Date(dateStr);
    } catch (e) {
      console.log('Erro ao converter data ISO:', e);
    }
  }
  
  // Mapeamento dos meses em português
  const months = {
      'janeiro': 0, 'jan': 0, 'janeiro.': 0, 'jan.': 0,
      'fevereiro': 1, 'fev': 1, 'fevereiro.': 1, 'fev.': 1,
      'março': 2, 'mar': 2, 'março.': 2, 'mar.': 2,
      'abril': 3, 'abr': 3, 'abril.': 3, 'abr.': 3,
      'maio': 4, 'mai': 4, 'maio.': 4, 'mai.': 4,
      'junho': 5, 'jun': 5, 'junho.': 5, 'jun.': 5,
      'julho': 6, 'jul': 6, 'julho.': 6, 'jul.': 6,
      'agosto': 7, 'ago': 7, 'agosto.': 7, 'ago.': 7,
      'setembro': 8, 'set': 8, 'setembro.': 8, 'set.': 8,
      'outubro': 9, 'out': 9, 'outubro.': 9, 'out.': 9,
      'novembro': 10, 'nov': 10, 'novembro.': 10, 'nov.': 10,
      'dezembro': 11, 'dez': 11, 'dezembro.': 11, 'dez.': 11
  };
  
  // Dias da semana
  const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  
  // Ano atual para datas sem ano especificado
  const currentYear = new Date().getFullYear();
  
  let match;
  
  // Tentar formatos nativos de data do navegador
  try {
    // Tenta converter a data usando o próprio Date
    // Pode funcionar para alguns formatos como "18/05/2025, 15:30"
    const nativeDate = new Date(dateStr.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$2-$1'));
    if (nativeDate && !isNaN(nativeDate) && nativeDate.getFullYear() > 2000) {
      console.log('Analisada data em formato nativo:', nativeDate);
      return nativeDate;
    }
  } catch (e) {
    // Ignora e continua com outros métodos
  }
  
  // Lista de expressões regulares para diferentes formatos de data
  const regexPatterns = [
      // "8 de fevereiro" ou "8 de fevereiro de 2025"
      {
          regex: /(\d{1,2})\s+de\s+([\wÀ-ÖØ-öø-ÿ]+)(?:\s+de\s+(\d{4}))?/i,
          parse: (match) => {
              const day = parseInt(match[1], 10);
              const monthName = match[2].toLowerCase();
              const month = months[monthName];
              if (month === undefined) return null;
              const year = match[3] ? parseInt(match[3], 10) : currentYear;
              return new Date(year, month, day);
          }
      },
      
      // "24/03/2025, 20:00" ou "24/03/2025 às 20:00"
      {
          regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,|\s+às)?\s*(\d{1,2}):(\d{2})/i,
          parse: (match) => {
              const day = parseInt(match[1], 10);
              const month = parseInt(match[2], 10) - 1;
              const year = parseInt(match[3], 10);
              const hours = parseInt(match[4], 10);
              const minutes = parseInt(match[5], 10);
              return new Date(year, month, day, hours, minutes);
          }
      },
      
      // "24/03/2025"
      {
          regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
          parse: (match) => {
              const day = parseInt(match[1], 10);
              const month = parseInt(match[2], 10) - 1;
              const year = parseInt(match[3], 10);
              return new Date(year, month, day);
          }
      },
      
      // "04/04 21:00" (sem ano)
      {
          regex: /(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/,
          parse: (match) => {
              const day = parseInt(match[1], 10);
              const month = parseInt(match[2], 10) - 1;
              const hours = parseInt(match[3], 10);
              const minutes = parseInt(match[4], 10);
              return new Date(currentYear, month, day, hours, minutes);
          }
      },
      
      // "04/04" (sem ano, sem hora)
      {
          regex: /(\d{1,2})\/(\d{1,2})/,
          parse: (match) => {
              const day = parseInt(match[1], 10);
              const month = parseInt(match[2], 10) - 1;
              return new Date(currentYear, month, day);
          }
      },
      
      // "18/05, 20:30" formato do Shotgun
      {
          regex: /(\d{1,2})\/(\d{1,2}),\s*(\d{1,2}):(\d{2})/,
          parse: (match) => {
              const day = parseInt(match[1], 10);
              const month = parseInt(match[2], 10) - 1;
              const hours = parseInt(match[3], 10);
              const minutes = parseInt(match[4], 10);
              return new Date(currentYear, month, day, hours, minutes);
          }
      },
      
      // "Sexta, 24 Mar" ou "Sex, 24 Mar"
      {
          regex: /(?:[a-zÀ-ÖØ-öø-ÿ]+,)?\s*(\d{1,2})\s+([a-zÀ-ÖØ-öø-ÿ]{3,})/i,
          parse: (match) => {
              const day = parseInt(match[1], 10);
              const monthName = match[2].toLowerCase().substring(0, 3);
              const month = months[monthName];
              if (month === undefined) return null;
              return new Date(currentYear, month, day);
          }
      },
      
      // Múltiplos formatos como "26/09, 27/09" (pega o primeiro)
      {
          regex: /(\d{1,2})\/(\d{1,2})(?:,|$)/,
          parse: (match) => {
              const day = parseInt(match[1], 10);
              const month = parseInt(match[2], 10) - 1;
              return new Date(currentYear, month, day);
          }
      },
      
      // "Hoje" ou "Amanhã"
      {
          regex: /\b(hoje|amanhã|amanha)\b/i,
          parse: (match) => {
              const now = new Date();
              if (match[1].startsWith('a')) { // amanhã
                  now.setDate(now.getDate() + 1);
              }
              return now;
          }
      }
  ];
  
  // Tenta cada padrão de expressão regular
  for (const pattern of regexPatterns) {
      match = dateStr.match(pattern.regex);
      if (match) {
          const parsedDate = pattern.parse(match);
          if (parsedDate && !isNaN(parsedDate)) {
              console.log(`Data analisada: ${dateStr} => ${parsedDate.toLocaleString('pt-BR')}`);
              return parsedDate;
          }
      }
  }
  
  // Tentativa final: extrair qualquer data formatada como dd/mm
  match = dateStr.match(/(\d{1,2})\/(\d{1,2})/);
  if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      if (day > 0 && day <= 31 && month >= 0 && month <= 11) {
          const date = new Date(currentYear, month, day);
          console.log(`Data extraída com regex simplificado: ${dateStr} => ${date.toLocaleString('pt-BR')}`);
          return date;
      }
  }
  
  // Se chegou aqui, não conseguiu analisar o formato da data
  console.log('Formato de data não reconhecido:', dateStr);
  return null;
}

// Função para verificar se um evento está dentro do período desejado (hoje, amanhã, esta semana)
function isEventInRelevantPeriod(dateStr) {
  // Se for um objeto de evento com a data já parseada, use-a diretamente
  if (dateStr && typeof dateStr === 'object' && dateStr.parsedDate) {
    const eventDate = dateStr.parsedDate;
    if (eventDate instanceof Date && !isNaN(eventDate)) {
      // O resto do código de verificação...
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      const nextWeekEnd = new Date(now);
      nextWeekEnd.setDate(now.getDate() + 7);
      
      const eventDateNormalized = new Date(eventDate);
      eventDateNormalized.setHours(0, 0, 0, 0);
      
      return eventDateNormalized >= now && eventDateNormalized <= nextWeekEnd;
    }
  }

  // Para strings de data
  const eventDate = parseEventDate(dateStr);
  if (!eventDate) {
    console.log('Data não pôde ser analisada:', dateStr);
    return true; // Mantemos eventos sem data reconhecida para não perder potenciais eventos válidos
  }
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const nextWeekEnd = new Date(now);
  nextWeekEnd.setDate(now.getDate() + 7);
  
  // Normaliza a data do evento para comparação (apenas data, sem hora)
  const eventDateNormalized = new Date(eventDate);
  eventDateNormalized.setHours(0, 0, 0, 0);
  
  // Verifica se o evento é hoje, amanhã ou esta semana
  const isValid = eventDateNormalized >= now && eventDateNormalized <= nextWeekEnd;
  
  if (isValid) {
    console.log('Evento relevante incluído:', dateStr, '- Data analisada:', eventDateNormalized.toLocaleDateString());
  } else {
    console.log('Evento fora do período relevante:', dateStr, '- Data analisada:', eventDateNormalized.toLocaleDateString());
  }
  
  return isValid;
}

// Função para buscar eventos do Sympla para a página inicial
async function fetchSymplaEvents() {
  try {
    // URL do Sympla para eventos em João Pessoa esta semana
    const url = 'https://www.sympla.com.br/eventos/joao-pessoa-pb?cl=17-festas-e-shows';
    
    const response = await fetch(url);
    const html = await response.text();
    
    // Limpa o HTML para evitar problemas de parsing
    const cleanedHtml = html.replace(/<link[^>]+rel=["']preload["'][^>]*\/_next\/static\/[^>]*>/gi, '')
                            .replace(/<link[^>]+\/_next\/static\/[^>]*>/gi, '')
                            .replace(/<script[^>]+src=["'][^"']*\/_next\/static\/[^"']*["'][^>]*><\/script>/gi, '')
                            .replace(/<style[^>]*>[\s\S]*?\/_next\/static\/[\s\S]*?<\/style>/gi, '')
                            .replace(/https:\/\/cors\.mosaicoworkers\.workers\.dev\/_next\/static\//g, '');
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanedHtml, 'text/html');
    const eventos = doc.querySelectorAll('a.sympla-card');
    
    console.log(`Sympla: encontrados ${eventos.length} eventos inicialmente`);
    
    // Mapear todos eventos encontrados
    const todosEventos = Array.from(eventos)
      .map(evento => {
        try {
          const dateElement = evento.querySelector('.qtfy413');
          const date = dateElement ? dateElement.textContent : 'Data não informada';
          const locationElement = evento.querySelector('.pn67h1a');
          const location = locationElement ? locationElement.textContent : 'Local não informado';
          
          return {
            title: evento.getAttribute('data-name'),
            link: evento.getAttribute('href'),
            image: evento.querySelector('img')?.src || '/imagens/shows.jpeg',
            location: location,
            date: date,
            parsedDate: parseEventDate(date), // Adiciona a data parseada para ordenação
            source: 'Sympla'
          };
        } catch (error) {
          console.error('Erro ao processar evento Sympla:', error);
          return null;
        }
      })
      .filter(Boolean); // Remove eventos nulos
    
    console.log(`Sympla: ${todosEventos.length} eventos processados`);
    
    // Filtra apenas eventos em João Pessoa e dentro do período relevante
    const eventosRelevantes = todosEventos
      .filter(evento => {
        const isJoaoPessoa = evento.location && evento.location.includes('João Pessoa');
        const isRelevantPeriod = evento.parsedDate && isEventInRelevantPeriod(evento.date);
        
        return isJoaoPessoa && isRelevantPeriod;
      });
    
    console.log(`Sympla: ${eventosRelevantes.length} eventos relevantes em João Pessoa esta semana`);
    
    // Ordenar por data (eventos mais próximos primeiro)
    eventosRelevantes.sort((a, b) => {
      if (a.parsedDate && b.parsedDate) {
        return a.parsedDate - b.parsedDate;
      }
      return 0;
    });
    
    // Retorna até 20 eventos após filtragem (aumentamos para ter mais opções)
    return eventosRelevantes.slice(0, 20);
  } catch (error) {
    console.error('Erro ao carregar eventos Sympla:', error);
    return [];
  }
}

// Função para buscar eventos do Eventim para a página inicial
async function fetchEventimEvents() {
  try {
    const url = 'https://cors-eventim.mosaicoworkers.workers.dev/api/city/joao-pessoa-1816/';
    
    const response = await fetch(url);
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    console.log(`Eventim: processando eventos...`);
    
    // Mapear todos os eventos encontrados
    const todosEventos = Array.from(doc.querySelectorAll('product-group-item'))
      .map(evento => {
        try {
          const script = evento.querySelector('script[type="application/ld+json"]');
          if (!script) return null;
          
          const data = JSON.parse(script.textContent);
          
          const startDate = new Date(data['startDate']);
          const options = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          };
          
          // Formata a data para exibição
          const formattedDate = startDate.toLocaleDateString('pt-BR', options);
          
          return {
            title: data['name'],
            date: formattedDate,
            parsedDate: startDate, // Data já parseada para ordenação
            image: data['image']?.[0] || '/imagens/shows.jpeg',
            link: data['url'],
            location: data['location']['address']['addressLocality'],
            source: 'Eventim'
          };
        } catch (error) {
          console.error('Erro ao processar evento Eventim:', error);
          return null;
        }
      })
      .filter(Boolean); // Remove eventos nulos
    
    console.log(`Eventim: ${todosEventos.length} eventos processados`);
    
    // Filtrar eventos dentro do período relevante (hoje, amanhã, esta semana)
    const eventosRelevantes = todosEventos.filter(evento => {
      // Se já temos a data parseada, podemos verificar diretamente
      if (evento.parsedDate) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        const nextWeekEnd = new Date(now);
        nextWeekEnd.setDate(now.getDate() + 7);
        
        // Compare apenas as datas, sem as horas
        const eventDateOnly = new Date(evento.parsedDate);
        eventDateOnly.setHours(0, 0, 0, 0);
        
        const isRelevant = eventDateOnly >= now && eventDateOnly <= nextWeekEnd;
        
        if (isRelevant) {
          console.log(`Eventim: incluindo evento relevante: ${evento.title} - ${evento.date}`);
        }
        
        return isRelevant;
      }
      return false;
    });
    
    console.log(`Eventim: ${eventosRelevantes.length} eventos relevantes esta semana`);
    
    // Ordenar por data (eventos mais próximos primeiro)
    eventosRelevantes.sort((a, b) => {
      if (a.parsedDate && b.parsedDate) {
        return a.parsedDate - b.parsedDate;
      }
      return 0;
    });
    
    // Retorna até 15 eventos após a filtragem
    return eventosRelevantes.slice(0, 15);
  } catch (error) {
    console.error('Erro ao carregar eventos Eventim:', error);
    return [];
  }
}

// Função para obter a cor do badge baseado na fonte do evento
function getEventBadgeClass(source) {
  const badgeClasses = {
    'Sympla': 'bg-info',
    'Eventim': 'bg-success',
    'Bilheteria Digital': 'bg-warning',
    'Outgo': 'bg-danger',
    'Ingresso Digital': 'bg-dark'
  };
  return badgeClasses[source] || 'bg-secondary';
}

// Função para criar um card de evento
function createEventCard(event) {
  const card = document.createElement('div');
  card.className = 'evento-card';
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    // Redirecionar para a página local de shows em vez de abrir link externo
    window.location.href = "/shows/";
    
    // Armazenar o link original como atributo para uso futuro na página de shows,
    // permitindo que a página de detalhes mostre informações de compra, se necessário
    if (event.link) {
      sessionStorage.setItem('evento-link-original', event.link);
    }
  });
  
  // Armazenar o link original como atributo de dados
  if (event.link) {
    card.setAttribute('data-event-link', event.link);
  }
  
  // Container para a imagem
  const imgContainer = document.createElement('div');
  imgContainer.className = 'evento-img-container';
  
  // Imagem do evento
  const img = document.createElement('img');
  img.src = event.image;
  img.alt = event.title;
  img.className = 'evento-img';
  img.onerror = function() {
    this.onerror = null;
    this.src = '/imagens/shows.jpeg';
  };
  imgContainer.appendChild(img);
  
  // Badge da fonte
  const badge = document.createElement('div');
  badge.className = `evento-badge ${getEventBadgeClass(event.source)}`;
  badge.textContent = event.source;
  imgContainer.appendChild(badge);
  
  // Badge especial para eventos que acontecem hoje ou amanhã
  if (event.timeLabel) {
    const timeBadge = document.createElement('div');
    timeBadge.className = 'evento-badge';
    
    if (event.timeLabel === 'Hoje') {
      timeBadge.style.backgroundColor = '#28a745'; // verde
      timeBadge.innerHTML = '<i class="fas fa-clock"></i> Hoje';
    } else if (event.timeLabel === 'Amanhã') {
      timeBadge.style.backgroundColor = '#17a2b8'; // azul turquesa
      timeBadge.innerHTML = '<i class="fas fa-clock"></i> Amanhã';
    }
    
    // Posicionar no lado oposto do badge de fonte
    timeBadge.style.left = '10px';
    timeBadge.style.right = 'auto';
    
    imgContainer.appendChild(timeBadge);
  }
  
  card.appendChild(imgContainer);
  
  // Informações do evento
  const infoDiv = document.createElement('div');
  infoDiv.className = 'evento-info';
  
  // Título
  const title = document.createElement('h4');
  title.textContent = event.title || 'Evento sem título';
  title.title = event.title; // Para tooltip quando nome é longo
  infoDiv.appendChild(title);
  
  // Data
  const dataP = document.createElement('p');
  dataP.className = 'evento-data';
  
  // Se temos um rótulo temporal (hoje/amanhã), destacamos na exibição da data
  if (event.timeLabel) {
    dataP.innerHTML = `<i class="far fa-calendar-alt"></i> <strong>${event.timeLabel}:</strong> ${event.date}`;
  } else {
    dataP.innerHTML = `<i class="far fa-calendar-alt"></i> ${event.date}`;
  }
  
  infoDiv.appendChild(dataP);
  
  // Local
  const localP = document.createElement('p');
  localP.className = 'evento-local';
  localP.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${event.location}`;
  infoDiv.appendChild(localP);
  
  card.appendChild(infoDiv);
  
  return card;
}

// Importar os scripts das diferentes fontes de eventos
function addEventSourceScript(src) {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve(); // Script já carregado
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.body.appendChild(script);
  });
}

// Função principal para carregar eventos
async function loadEventos() {
  const eventosGrid = document.getElementById('eventos-grid');
  if (!eventosGrid) return;
  
  // Limpar conteúdo atual e mostrar loading
  eventosGrid.innerHTML = '<div class="loading-placeholder"><i class="fas fa-ticket-alt"></i><p>Carregando shows e eventos...</p></div>';
  
  let eventosData;
  
  // Tenta usar o cache primeiro, mas apenas se for do mesmo dia
  // Reduzimos o tempo de cache para ter eventos mais atualizados
  if (localStorage.getItem(EVENTOS_CACHE_DATE_KEY) === getTodayDateString()) {
    try {
      eventosData = getCache(EVENTOS_CACHE_KEY);
      console.log('Usando cache dos dados de eventos do dia atual');
    } catch (error) {
      console.error('Erro ao carregar eventos do cache:', error);
      eventosData = null;
    }
  }
  
  // Se não temos dados em cache ou o cache falhou, buscar dados novos
  if (!eventosData) {
    try {
      console.log('Buscando novos dados de eventos...');
      
      // Carregar os scripts das fontes adicionais se necessário
      await Promise.all([
        addEventSourceScript('/shows/bilheteriadigital.js'),
        addEventSourceScript('/shows/outgo.js'),
        addEventSourceScript('/shows/ingressodigital.js'),
        addEventSourceScript('/shows/shotgun.js')
      ]);
      
      // Buscar dados de múltiplas fontes em paralelo
      const eventPromises = [
        fetchSymplaEvents(),
        fetchEventimEvents(),
        new Promise(resolve => {
          // Verifica se a função foi carregada antes de chamar
          if (typeof loadBilheteriaDigitalEvents === 'function') {
            loadBilheteriaDigitalEvents(events => resolve(events.filter(e => isEventInRelevantPeriod(e.date))));
          } else {
            console.log('BilheteriaDigital não disponível');
            resolve([]);
          }
        }),
        new Promise(resolve => {
          if (typeof loadOutgoEvents === 'function') {
            loadOutgoEvents(events => resolve(events.filter(e => isEventInRelevantPeriod(e.date))));
          } else {
            console.log('Outgo não disponível');
            resolve([]);
          }
        }),
        new Promise(resolve => {
          if (typeof loadIngressoDigitalEvents === 'function') {
            loadIngressoDigitalEvents(events => resolve(events.filter(e => isEventInRelevantPeriod(e.date))));
          } else {
            console.log('IngressoDigital não disponível');
            resolve([]);
          }
        }),
        new Promise(resolve => {
          if (typeof loadShotgunEvents === 'function') {
            loadShotgunEvents(events => resolve(events.filter(e => isEventInRelevantPeriod(e.date))));
          } else {
            console.log('Shotgun não disponível');
            resolve([]);
          }
        })
      ];
      
      // Aguarda todas as promessas e combina os resultados
      const results = await Promise.all(eventPromises);
      
      // Combinar eventos de diferentes fontes
      eventosData = results.flat().filter(Boolean);
      console.log(`Total de eventos encontrados: ${eventosData.length}`);
      
      // Salvar no cache com duração menor (apenas para o dia atual)
      saveCache(EVENTOS_CACHE_KEY, eventosData, EVENTOS_CACHE_DATE_KEY);
      console.log('Dados de eventos buscados e salvos em cache');
    } catch (error) {
      console.error('Erro ao buscar dados de eventos:', error);
      eventosGrid.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Não foi possível carregar os eventos no momento.</div>';
      return;
    }
  }
  
  // Limpar o placeholder
  eventosGrid.innerHTML = '';
  
  // Verificar se temos eventos para mostrar
  if (!eventosData || eventosData.length === 0) {
    eventosGrid.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Nenhum evento encontrado para os próximos dias.</div>';
    return;
  }
  
  console.log('Total de eventos disponíveis após filtragem:', eventosData.length);
  
  // Classificar eventos por proximidade da data (hoje, amanhã, esta semana)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  // Categorizar eventos por data
  const todayEvents = [];
  const tomorrowEvents = [];
  const thisWeekEvents = [];
  
  eventosData.forEach(event => {
    // Usar a data parseada se disponível ou tentar analisar a data
    const eventDate = event.parsedDate || parseEventDate(event.date);
    
    if (!eventDate) return;
    
    // Criar cópia da data para comparação sem horas
    const eventDateOnly = new Date(eventDate);
    eventDateOnly.setHours(0, 0, 0, 0);
    
    if (eventDateOnly.getTime() === today.getTime()) {
      todayEvents.push({...event, priority: 1}); // Prioridade máxima
    } else if (eventDateOnly.getTime() === tomorrow.getTime()) {
      tomorrowEvents.push({...event, priority: 2}); // Segunda prioridade
    } else {
      thisWeekEvents.push({...event, priority: 3}); // Terceira prioridade
    }
  });
  
  console.log(`Eventos categorizados: ${todayEvents.length} hoje, ${tomorrowEvents.length} amanhã, ${thisWeekEvents.length} esta semana`);
  
  // Ordenar cada categoria por data (se houver múltiplos eventos no mesmo dia)
  [todayEvents, tomorrowEvents, thisWeekEvents].forEach(eventList => {
    eventList.sort((a, b) => {
      const dateA = a.parsedDate || parseEventDate(a.date);
      const dateB = b.parsedDate || parseEventDate(b.date);
      if (dateA && dateB) return dateA - dateB;
      return 0;
    });
  });
  
  // Combinar as categorias em ordem de prioridade
  const prioritizedEvents = [...todayEvents, ...tomorrowEvents, ...thisWeekEvents];
  
  // Selecionar os 4 primeiros eventos prioritários
  const selectedEvents = prioritizedEvents.slice(0, 4);
  
  // Se não temos eventos suficientes, mostrar mensagem explicativa
  if (selectedEvents.length === 0) {
    eventosGrid.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Não há eventos nos próximos dias em João Pessoa.</div>';
    return;
  }
  
  // Adicionar rótulos para indicar quando o evento acontece
  selectedEvents.forEach(event => {
    if (event.priority === 1) {
      event.timeLabel = 'Hoje';
    } else if (event.priority === 2) {
      event.timeLabel = 'Amanhã';
    }
    
    // Criar e adicionar o card do evento
    const eventCard = createEventCard(event);
    eventosGrid.appendChild(eventCard);
  });
}

// Função auxiliar para obter a data atual no formato "YYYY-MM-DD"
function getTodayDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Funções auxiliares de cache
function isCacheValid(cacheDateKey, durationInDays) {
  const cachedDate = localStorage.getItem(cacheDateKey);
  if (!cachedDate) return false;
  
  const cachedTime = new Date(cachedDate).getTime();
  const now = new Date().getTime();
  const diffDays = Math.floor((now - cachedTime) / (1000 * 60 * 60 * 24));
  
  return diffDays < durationInDays;
}

function saveCache(cacheKey, data, cacheDateKey) {
  localStorage.setItem(cacheKey, JSON.stringify(data));
  localStorage.setItem(cacheDateKey, new Date().toISOString());
}

function getCache(cacheKey) {
  const data = localStorage.getItem(cacheKey);
  return data ? JSON.parse(data) : null;
}

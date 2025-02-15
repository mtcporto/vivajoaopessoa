function parsePortugueseDate(dateStr) {
  // Exemplo: "Sábado, 8 de fevereiro" ou "8 de fevereiro"
  const regex = /(\d{1,2})\s+de\s+(\w+)/i;
  const match = dateStr.match(regex);
  if(match) {
    const day = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase();
    const months = {
      'janeiro': 0,
      'fevereiro': 1,
      'março': 2,
      'abril': 3,
      'maio': 4,
      'junho': 5,
      'julho': 6,
      'agosto': 7,
      'setembro': 8,
      'outubro': 9,
      'novembro': 10,
      'dezembro': 11,
    };
    const month = months[monthName];
    if (month === undefined) return null;
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, month, day);
  }
  return null;
}

function loadOutgoEvents() {
  const url = 'https://cors.mosaicoworkers.workers.dev/www.outgo.com.br/eventos/PB';
  let eventosCount = 0;

  fetch(url)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const eventosDiv = document.getElementById('eventos');

      // Seleciona todos os eventos na página
      const eventos = doc.querySelectorAll('card-event');

      eventos.forEach((evento, index) => {
        if (index >= eventosCount && index < eventosCount + 9) {
          try {
            const titleElement = evento.querySelector('.cardEvent-title');
            if (!titleElement) {
              console.error('Elemento .cardEvent-title não encontrado', evento);
              return;
            }
            const nomeOriginal = titleElement.textContent.trim();
            const nome = nomeOriginal
              .toLowerCase()
              .replace(/\s/g, '-')
              .replace(/[áàãâä]/g, 'a')
              .replace(/[éèêë]/g, 'e')
              .replace(/[íìîï]/g, 'i')
              .replace(/[óòõôö]/g, 'o')
              .replace(/[úùûü]/g, 'u')
              .replace(/[ç]/g, 'c');

            const linkElement = evento.querySelector('.card-link');
            if (!linkElement) {
              console.error('Elemento .card-link não encontrado', evento);
              return;
            }
            const href = linkElement.getAttribute('href');
            const idEvento = href.split('/').pop();
            const link = `https://www.outgo.com.br/${idEvento}`;

            const imgElement = evento.querySelector('.cardEvent-coverpage');
            if (!imgElement) {
              console.error('Elemento .cardEvent-coverpage não encontrado', evento);
              return;
            }
            const foto = imgElement.getAttribute('src');

            const subtitleElements = evento.querySelectorAll('.cardEvent-subtitle');
            let data = '';
            let local = '';

            if (subtitleElements.length >= 1) {
              const timeElement = subtitleElements[0].querySelector('time');
              data = timeElement ? timeElement.textContent.trim() : subtitleElements[0].textContent.trim();
            }
            if (subtitleElements.length >= 2) {
              local = subtitleElements[1].textContent.trim();
            }

            // Filtra somente eventos de João Pessoa
            if (!local.includes('João Pessoa')) {
              return;
            }

            // Filtra eventos passados
            const eventDate = parsePortugueseDate(data);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (eventDate && eventDate < today) {
              console.log(`Evento "${nomeOriginal}" ignorado por ser passado.`);
              return;
            }

            const eventoDiv = document.createElement('div');
            eventoDiv.className = 'col-md-4 col-sm-6 mb-4';
            eventoDiv.innerHTML = `
              <div class="card">
                <a href="${link}" target="_blank" class="card-link">
                  <img src="${foto}" class="card-img-top" alt="${nome}">
                </a>
                <div class="card-body">
                  <p class="fonte">
                    <span class="badge badge-danger">Fonte: Outgo</span>
                  </p>                    
                  <h5 class="card-title">${nomeOriginal}</h5>
                  <p class="card-text">${data}</p>
                  <p class="card-text">${local}</p>
                </div>
              </div><br>
            `;
            eventosDiv.appendChild(eventoDiv);
          } catch (error) {
            console.error(`Erro ao processar o evento: ${error}`);
          }
        }
      });

      eventosCount += 50;
      document.querySelector("#loadMore").style.display = (eventosCount < eventos.length) ? 'block' : 'none';
    })
    .catch(console.error);
}

function loadOutgoEvents() {
  const url = 'https://cors.mosaicoworkers.workers.dev/www.outgo.com.br/eventos/PB';
  let eventosCount = 0;

  fetch(url)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const eventosDiv = document.getElementById('eventos');

      // Seleciona os cards com a tag <card-event>
      const eventos = doc.querySelectorAll('card-event');

      eventos.forEach((evento, index) => {
        if (index >= eventosCount && index < eventosCount + 9) {
          try {
            // Título do evento (agora dentro de <h3 class="cardEvent-title">)
            const titleElement = evento.querySelector('.cardEvent-title');
            if (!titleElement) {
              console.error('Elemento .cardEvent-title não encontrado', evento);
              return;
            }
            const nome = titleElement.textContent
              .toLowerCase()
              .replace(/\s/g, '-')
              .replace(/[áàãâä]/g, 'a')
              .replace(/[éèêë]/g, 'e')
              .replace(/[íìîï]/g, 'i')
              .replace(/[óòõôö]/g, 'o')
              .replace(/[úùûü]/g, 'u')
              .replace(/[ç]/g, 'c');

            // Link do evento (a partir do atributo href do <a class="card-link">)
            const linkElement = evento.querySelector('.card-link');
            if (!linkElement) {
              console.error('Elemento .card-link não encontrado', evento);
              return;
            }
            const href = linkElement.getAttribute('href');
            // Extraindo o id ou slug do evento da URL
            const idEvento = href.split('/').pop();
            const link = `https://www.outgo.com.br/${idEvento}`;

            // Imagem do evento
            const imgElement = evento.querySelector('.cardEvent-coverpage');
            if (!imgElement) {
              console.error('Elemento .cardEvent-coverpage não encontrado', evento);
              return;
            }
            const foto = imgElement.getAttribute('src');

            // Data e local do evento: agora os dados estão nos <p class="cardEvent-subtitle">
            const subtitleElements = evento.querySelectorAll('.cardEvent-subtitle');
            let data = '';
            let local = '';

            if (subtitleElements.length >= 1) {
              // O primeiro <p> contém a data (com um <time> dentro)
              const timeElement = subtitleElements[0].querySelector('time');
              data = timeElement ? timeElement.textContent : subtitleElements[0].textContent;
            }
            if (subtitleElements.length >= 2) {
              // O segundo <p> contém o local
              local = subtitleElements[1].textContent;
            }

            // Filtra somente eventos que são de João Pessoa
            if (local.includes('João Pessoa')) {
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
                    <h5 class="card-title">${nome.replace(/-/g, ' ')}</h5>
                    <p class="card-text">${data}</p>
                    <p class="card-text">${local}</p>
                  </div>
                </div><br>
              `;
              eventosDiv.appendChild(eventoDiv);
            }
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

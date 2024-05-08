function loadOutgoEvents() {
    const url = 'https://cors.mosaicoworkers.workers.dev/www.outgo.com.br/eventos/PB';

    let eventosCount = 0;

      fetch(url)      
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const eventosDiv = document.getElementById('eventos');

          // Substitua os seletores abaixo pelos corretos para a página que você quer raspar
          const eventos = doc.querySelectorAll('card-event');

          eventos.forEach((evento, index) => {
            if (index >= eventosCount && index < eventosCount + 9) {
              try {
                const nome = evento.querySelector('.cardEvent-title').textContent.toLowerCase().replace(/\s/g, '-').replace(/[áàãâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i').replace(/[óòõôö]/g, 'o').replace(/[úùûü]/g, 'u').replace(/[ç]/g, 'c');
                const idEvento = evento.querySelector('.card-link').getAttribute('href').split('/').pop();
                const link = `https://www.outgo.com.br/${idEvento}`;

                const foto = evento.querySelector('.cardEvent-coverpage').getAttribute('src');
                const local = evento.querySelector('.cardEvent-place').textContent;
                const data = evento.querySelector('.cardEvent-date time').textContent;

                // Verifica se o evento é em João Pessoa, PB
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
          if (eventosCount < eventos.length) {
            document.querySelector("#loadMore").style.display = 'block';
          } else {
            document.querySelector("#loadMore").style.display = 'none';
          }
        })
        .catch(console.error);
    

  }

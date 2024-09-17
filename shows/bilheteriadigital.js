function loadBilheteriaDigitalEvents() {
    const url = 'https://cors.mosaicoworkers.workers.dev/www.bilheteriadigital.com/PB';

    let eventosCount = 0;

      fetch(url)

        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const eventosDiv = document.getElementById('eventos');

          // Substitua os seletores abaixo pelos corretos para a página que você quer raspar
          const eventos = doc.querySelectorAll('.box-li-evento');

          eventos.forEach((evento, index) => {
            if (index >= eventosCount && index < eventosCount + 9) {
              try {
                const titulo = evento.querySelector('.titulo-evento-thumb').textContent;
                const link = evento.querySelector('a').getAttribute('href');
                const linkCompleto = `https://www.bilheteriadigital.com${link}`;
                const diaElement = evento.querySelector('.dia-box-evento');
                const mesElement = evento.querySelector('.mes-box-evento');
                const dia = diaElement.textContent;
                const mes = mesElement.textContent;
                const data = `${dia} de ${mes}`;
                const cidade = evento.querySelector('.cidade-box-evento').textContent;
                const imagemURL = evento.querySelector('img').getAttribute('data-src') || evento.querySelector('img').getAttribute('src');

                if (cidade.includes('João Pessoa - PB')) {
                const eventoDiv = document.createElement('div');
                eventoDiv.className = 'col-md-4 col-sm-6 mb-4';
                eventoDiv.innerHTML = `
                  <div class="card">
                    <a href="${linkCompleto}" class="card-link" target="_blank">
                    <img src="${imagemURL}" class="card-img-top" alt="${titulo} ">
                    </a>
                    <div class="card-body">
                    <p class="fonte">
                    <span class="badge badge-warning">Fonte: Bilheteria Digital</span>
                  </p>
                      <h5 class="card-title">${titulo}</h5>
                      <p class="card-text">${data}</p>
                      <p class="card-text">${cidade}</p>
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
        })
        .catch(console.error);
    

  }

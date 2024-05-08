function loadSymplaEvents() {

    // URL da página que você quer raspar
    const url = 'https://www.sympla.com.br/eventos/joao-pessoa-pb/show-musica-festa/esta-semana';
    
    let eventosCount = 0;

      fetch(url)
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const eventosDiv = document.getElementById('eventos');

          // Substitua os seletores abaixo pelos corretos para a página que você quer raspar
          const eventos = doc.querySelectorAll('.CustomGridstyle__CustomGridCardType-sc-1ce1n9e-2 a');

          eventos.forEach((evento, index) => {
            if (index >= eventosCount && index < eventosCount + 9) {
              try {
                const nome = evento.querySelector('.EventCardstyle__EventTitle-sc-1rkzctc-7').textContent.toLowerCase().replace(/\s/g, '-').replace(/[áàãâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i').replace(/[óòõôö]/g, 'o').replace(/[úùûü]/g, 'u').replace(/[ç]/g, 'c');
                const idEvento = evento.getAttribute('id');
                const linkElement = evento.querySelector('.EventCardstyle__CardLink-sc-1rkzctc-3');
                const link = evento.getAttribute('href');
                const title = evento.getAttribute('title');

                const foto = evento.querySelector('.EventCardstyle__ImageContainer-sc-1rkzctc-1 img').src;
                const local = evento.querySelector('.EventCardstyle__EventLocation-sc-1rkzctc-8').textContent;

                // Verifica se o evento é em João Pessoa, PB
                if (local.includes('João Pessoa, PB')) {
                  const datas = Array.from(evento.querySelectorAll('.sc-1sp59be-1.fZlvlB')).map(el => el.textContent);
                  const data = datas.join(' - ');
                  const eventoDiv = document.createElement('div');
                  eventoDiv.className = 'col-md-4 col-sm-6 mb-4';
                  eventoDiv.innerHTML = `
                    <div class="card">
                      <a href="${link}" target="_blank" class="card-link">
                        <img src="${foto}" class="card-img-top" alt="${nome}">
                      </a>
                      <div class="card-body">
                      <p class="fonte">
                      <span class="badge badge-info">Fonte: Sympla</span>
                      </p>                        
                        <h5 class="card-title">${title}</h5>
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

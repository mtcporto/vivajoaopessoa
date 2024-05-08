function loadEventimEvents() {

  const url = 'https://cors-eventim.mosaicoworkers.workers.dev/api/city/joao-pessoa-1816/';

  let eventosCount = 0;

    fetch(url) 
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const eventosDiv = document.getElementById('eventos');

        const eventos = doc.querySelectorAll('product-group-item');

        eventos.forEach((evento, index) => {
if (index >= eventosCount && index < eventosCount + 9) {
  try {
    const script = evento.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script.textContent);

    const nome = data['name'];
    const startDate = data['startDate']; // Get startDate here

    const startDateObj = new Date(startDate); // Create startDateObj inside the loop

    // Options for formatting (adjust as needed)
    const options = {
weekday: 'short',
day: 'numeric',
month: 'numeric', // Use 'numeric' to display month as 08
year: 'numeric',
hour: 'numeric',
minute: 'numeric',
timeZone: 'America/Sao_Paulo'
};

              
  const formattedStartDate = startDateObj.toLocaleDateString('pt-BR', options);

              const local = data['location']['address']['addressLocality'];
              
              const foto = data['image'][0];
              const link = data['url'];

              const eventoDiv = document.createElement('div');
              eventoDiv.className = 'col-md-4 col-sm-6 mb-4';
              eventoDiv.innerHTML = `
                <div class="card">
                  <a href="${link}" target="_blank" class="card-link">
                    <img src="${foto}" class="card-img-top" alt="${nome}">
                  </a>
                  <div class="card-body">
                  <p class="fonte">
                  <span class="badge badge-success">Fonte: Eventim</span>
                </p>
                    <h5 class="card-title">${nome}</h5>
                    <p class="card-text">${formattedStartDate}</p>
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
        if (eventosCount < eventos.length) {
          document.querySelector("#loadMore").style.display = 'block';
        } else {
          document.querySelector("#loadMore").style.display = 'none';
        }
      })
      .catch(console.error);
  

    }

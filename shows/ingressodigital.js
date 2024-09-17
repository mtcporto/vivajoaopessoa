function loadIngressoDigitalEvents() {
    // URL of the page to scrape
   const url = 'https://cors.mosaicoworkers.workers.dev/ingressodigital.com/list.php?busca=S&txt_busca=joao+pessoa&txt_busca_m=';
   let eventosCount = 0;

   function loadEvents() {
     fetch(url)
       .then(response => response.text())
       .then(html => {
         // console.log(html);  // Imprime os dados brutos
         const parser = new DOMParser();
         const doc = parser.parseFromString(html, 'text/html');
         const eventosDiv = document.getElementById('eventos');

         // Select events from the Ingresso Digital page
         const eventos = doc.querySelectorAll('.item-content');

         eventos.forEach((evento, index) => {
           if (index >= eventosCount && index < eventosCount + 9) {
             try {
               // Extract the event image
               const imgElement = evento.querySelector('.item-content__img');
               let foto = '';
               if (imgElement) {
                 let style = imgElement.getAttribute('style');
                 let match = style.match(/url\((.*?)\)/i);
               if (match) {
                 foto = match[1].replace(/['"]/g, '');
               }

               }

               // Extract the event link (remove unnecessary parts)
               const link = evento.querySelector('a').getAttribute('href').replace('./evento/', 'https://ingressodigital.com/evento/');

               // Extract the title of the event (remove unnecessary elements)
               const titulo = evento.querySelector('h2 a').textContent.trim();

               // Extract the date(s) of the event (may need adjustments based on structure)
               const dataElement = evento.querySelector('.d-flex');
               let data = "";
               if (dataElement) {
                 const dataItems = dataElement.querySelectorAll('li a');
                 dataItems.forEach((item, index) => {
                   let itemText = item.textContent.trim();
                   // Remove o "+" do final, se houver
                   if (itemText.endsWith('+')) {
                     itemText = itemText.slice(0, -1);
                   }
                   data += itemText + (index < dataItems.length - 1 ? ", " : "");
                 });
                 // Remove a última vírgula, se houver
                 if (data.endsWith(', ')) {
                   data = data.slice(0, -2);
                 }
               }

               // Check if the event is in João Pessoa
               const localElement = evento.querySelector('.id-location span');
               if (localElement && localElement.textContent.includes('João Pessoa, PB')) {
                 // Create the event card element
                 const eventoDiv = document.createElement('div');
                 eventoDiv.className = 'col-md-4 col-sm-6 mb-4';
                 eventoDiv.innerHTML = `
                   <div class="card">
                     <a href="${link}" target="_blank" class="card-link">
                       <img src="${foto}" class="card-img-top" alt="${titulo}">
                     </a>
                     <div class="card-body">
                     <p class="fonte">
                     <span class="badge badge-dark">Fonte: Ingresso Digital</span>
                     </p>
                       <h5 class="card-title">${titulo}</h5>
                       <p class="card-text">${data}</p>
                       <p class="card-text">${localElement.textContent}</p>
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

         eventosCount += 9;
       })
       .catch(console.error);
   }

   loadEvents();
}

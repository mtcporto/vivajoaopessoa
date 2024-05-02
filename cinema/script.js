document.addEventListener('DOMContentLoaded', function () {
    const url = 'https://cors.mosaicoworkers.workers.dev/api-content.ingresso.com/v0/events/city/32/partnership/marcotulio';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Filtrando os eventos que não são do Festival Varilux
            const nonVariluxEvents = data.items.filter(event => !event.tags.includes('Festival Varilux 2023'));
            // Chamando a função para preencher a página com os eventos
            populatePage(nonVariluxEvents);
        })
        .catch(error => console.error('Erro ao obter dados da API:', error));
});

function populatePage(data) {
    // Obtendo a referência do contêiner de eventos
    var eventContainer = document.getElementById('eventContainer');
    // Loop através dos eventos
    data.forEach(event => {
        // Criando um elemento de div para cada evento
        var eventDiv = document.createElement('div');
        eventDiv.classList.add('event-container');
        // Adicionando a imagem do evento (se houver)
        if (event.images && event.images.length > 0) {
            var imageElement = document.createElement('img');
            imageElement.src = event.images[0].url; // Usando a primeira imagem como exemplo
            imageElement.alt = event.title + ' Poster';
            imageElement.classList.add('event-image');
            imageElement.addEventListener('click', function () {
                window.open(event.siteURL, '_blank');
            });
            eventDiv.appendChild(imageElement);
        }
        // // Adicionando o score do Rotten Tomatoes usando ícones simplificados
        // if (event.rottenTomatoe) {
        //     var rottenTomatoesElement = document.createElement('div');
        //     rottenTomatoesElement.classList.add('icons-container');
        //     // Ícone de tomate
        //     var tomatoIcon = document.createElement('img');
        //     tomatoIcon.src = 'link-para-o-icone-do-tomate';
        //     tomatoIcon.alt = 'Tomate';
        //     tomatoIcon.classList.add('icon');
        //     rottenTomatoesElement.appendChild(tomatoIcon);
        //     // Percentual de críticos
        //     var criticsPercent = document.createElement('span');
        //     criticsPercent.classList.add('text-xs', 'text-white');
        //     criticsPercent.textContent = event.rottenTomatoe.criticsScore + '%';
        //     rottenTomatoesElement.appendChild(criticsPercent);
        //     // Ícone de pipoca
        //     var popcornIcon = document.createElement('img');
        //     popcornIcon.src = 'link-para-o-icone-da-pipoca';
        //     popcornIcon.alt = 'Pipoca';
        //     popcornIcon.classList.add('icon');
        //     rottenTomatoesElement.appendChild(popcornIcon);
        //     // Percentual de audiência
        //     var audiencePercent = document.createElement('span');
        //     audiencePercent.classList.add('text-xs', 'text-white');
        //     audiencePercent.textContent = event.rottenTomatoe.audienceScore + '%';
        //     rottenTomatoesElement.appendChild(audiencePercent);
        //     eventDiv.appendChild(rottenTomatoesElement);
        // }
        // Adicionando o título do evento
        var titleElement = document.createElement('h2');
        titleElement.classList.add('event-title');
        titleElement.textContent = event.title;
        eventDiv.appendChild(titleElement);
        // Adicionando o evento ao contêiner principal
        eventContainer.appendChild(eventDiv);
    });
}
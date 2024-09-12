function loadCNNBrasilNews() {
    const url = 'https://cors.mosaicoworkers.workers.dev/www.cnnbrasil.com.br/feed/';
    
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "application/xml");

            // Seleciona todos os itens do feed
            const items = xml.querySelectorAll("item");

            items.forEach(item => {
                const title = item.querySelector("title").textContent;
                const link = item.querySelector("link").textContent;
                const description = item.querySelector("description").textContent;

                // Busca por imagens no conteúdo da descrição ou em media:content
                const imgElement = item.querySelector("media\\:content, img");
                const imageUrl = imgElement ? imgElement.getAttribute('url') || imgElement.getAttribute('src') : null;

                // Exibe as notícias
                const newsContainer = document.getElementById("news-container");
                const newsItem = document.createElement("div");
                newsItem.classList.add("news-item");

                newsItem.innerHTML = `
                    <h2>${title}</h2>
                    <a href="${link}" target="_blank">Leia mais</a>
                    ${imageUrl ? `<img src="${imageUrl}" alt="${title}">` : ''}
                    <p>${description}</p>
                `;

                newsContainer.appendChild(newsItem);
            });
        })
        .catch(error => console.error('Erro ao carregar o feed RSS:', error));
}

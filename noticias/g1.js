function loadG1News(callback) {
    const url = 'https://cors.mosaicoworkers.workers.dev/g1.globo.com/rss/g1/';
    const MAX_NEWS = 25;
    
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            const items = Array.from(xmlDoc.querySelectorAll('item'))
                .slice(0, MAX_NEWS); // Limita antes do processamento
            
            const news = items
                .map(item => {
                    try {
                        const title = item.querySelector('title')?.textContent || '';
                        const link = item.querySelector('link')?.textContent || '#';
                        const pubDate = item.querySelector('pubDate') ? new Date(item.querySelector('pubDate').textContent) : new Date();
                        const description = item.querySelector('description')?.textContent || '';
                        
                        // Extrai a imagem da descrição
                        const imgMatch = description.match(/<img.*?src="(.*?)"/);
                        // Se não encontrou imagem, retorna null
                        if (!imgMatch) return null;
                        const image = imgMatch[1];
                        // Se a URL da imagem é inválida, retorna null
                        if (!image || image === 'placeholder.jpg') return null;

                        // Formata a data
                        const formattedDate = pubDate.toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        return {
                            title,
                            link,
                            date: formattedDate,
                            image,
                            source: 'G1'
                        };
                    } catch (error) {
                        console.error('Erro ao processar notícia do G1:', error);
                        return null;
                    }
                })
                .filter(Boolean); // Remove itens nulos/undefined

            console.log(`G1: Processadas ${news.length} notícias de ${items.length} encontradas`);
            callback(news);
        })
        .catch(error => {
            console.error('Erro ao carregar notícias do G1:', error);
            callback([]);
        });
}

function displayNews(news) {
    news.forEach(item => {
        const html = `
            <div class="col-md-4">
                <div class="card mb-4 shadow-sm">
                    <img src="${item.image}" class="bd-placeholder-img card-img-top" width="100%" height="225" alt="${item.title}">
                    <div class="card-body">
                        <p class="fonte">
                            <span class="badge badge-danger">Fonte: ${item.source}</span>
                        </p>
                        <h5 class="card-title">${item.title}</h5>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="btn-group">
                                <a href="${item.link}" target="_blank" class="btn btn-sm btn-outline-secondary">Ver Notícia</a>
                            </div>
                            <small class="text-muted">${item.date}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.querySelector("#newsCards").innerHTML += html;
    });
}

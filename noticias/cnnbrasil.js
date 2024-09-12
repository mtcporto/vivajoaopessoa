function loadCNNBrasilNews() {
    const url = 'https://cors.mosaicoworkers.workers.dev/www.cnnbrasil.com.br/feed/';
    
    fetch(url)
        .then(response => response.text())
        .then(data => {
            // Parse o XML
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, 'application/xml');
            
            // Pegue todos os itens
            const items = xml.querySelectorAll('item');
            
            items.forEach(item => {
                const title = item.querySelector('title').textContent;
                const link = item.querySelector('link').textContent;
                const description = item.querySelector('description').textContent;
                
                // Capturando a imagem dentro do conteúdo (media:content)
                const mediaContent = item.querySelector('media\\:content');
                const imgUrl = mediaContent ? mediaContent.getAttribute('url') : null;
                
                // Verifica se a imagem existe
                if (imgUrl) {
                    console.log(`Title: ${title}`);
                    console.log(`Image: ${imgUrl}`);
                    console.log(`Link: ${link}`);
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar as notícias:', error);
        });
}

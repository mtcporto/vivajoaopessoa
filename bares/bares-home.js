// bares-home.js - Script para carregar bares e restaurantes na página inicial

// Constantes para cache
const BARES_CACHE_KEY = 'baresData';
const BARES_CACHE_DATE_KEY = 'baresDataDate';
const BARES_CACHE_DURATION = 1; // 1 dia

// Função para verificar se uma imagem existe em um determinado caminho
// Útil para diagnosticar problemas de caminho de imagem
function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ exists: true, url });
    img.onerror = () => resolve({ exists: false, url });
    img.src = url;
  });
}

// Função simplificada para verificar caminhos de imagens
// Só verifica os caminhos que realmente importam
async function diagnoseImagePaths() {
  const hostname = window.location.hostname;
  if (hostname !== 'mosaico.vivajoaopessoa.com') return;
  
  // console.log('🔍 Verificando caminhos de imagens...');
  
  // Verifica apenas o caminho que deve estar correto
  const testImage = 'nau.jpg';
  const correctPath = `/vivajoaopessoa/bares/imagens/${testImage}`;
  const wrongPath = `/vivajoaopessoa/imagens/${testImage}`;
  
  try {
    const correctResponse = await fetch(correctPath, { method: 'HEAD' });
    // console.log(`${correctResponse.ok ? '✅' : '❌'} Caminho correto: ${correctPath} (${correctResponse.ok ? 'EXISTE' : 'NÃO EXISTE'})`);
    
    const wrongResponse = await fetch(wrongPath, { method: 'HEAD' });
    // console.log(`${wrongResponse.ok ? '⚠️' : '✓'} Caminho errado: ${wrongPath} (${wrongResponse.ok ? 'EXISTE' : 'NÃO EXISTE'})`);
  } catch (error) {
    // console.error('❌ Erro ao verificar caminhos:', error.message);
  }
}

// Função para obter cor baseada no tipo de culinária
function getTipoCozinhaClass(tipo) {
  const tipoLower = tipo.toLowerCase();
  
  if (tipoLower.includes('italiana') || tipoLower.includes('pizza')) {
    return 'tipo-italiana';
  } else if (tipoLower.includes('japonesa') || tipoLower.includes('sushi')) {
    return 'tipo-japonesa';
  } else if (tipoLower.includes('brasileira')) {
    return 'tipo-brasileira';
  } else if (tipoLower.includes('hamburguer') || tipoLower.includes('hamburger')) {
    return 'tipo-hamburger';
  } else if (tipoLower.includes('francesa')) {
    return 'tipo-francesa';
  } else if (tipoLower.includes('bar') || tipoLower.includes('petisco')) {
    return 'tipo-bar';
  } else if (tipoLower.includes('regional') || tipoLower.includes('nordestina')) {
    return 'tipo-regional';
  } else if (tipoLower.includes('frutos do mar')) {
    return 'tipo-frutos-do-mar';
  } else if (tipoLower.includes('contemporânea')) {
    return 'tipo-contemporânea';
  } else if (tipoLower.includes('internacional')) {
    return 'tipo-internacional';
  } else if (tipoLower.includes('mexicana')) {
    return 'tipo-mexicana';
  } else if (tipoLower.includes('café') || tipoLower.includes('cafe')) {
    return 'tipo-café';
  } else {
    return 'tipo-outros';
  }
}

// Função para carregar os bares e restaurantes
async function loadBares() {
  const baresGrid = document.getElementById('bares-grid');
  if (!baresGrid) return;
  
  // Limpar conteúdo atual e mostrar loading
  baresGrid.innerHTML = '<div class="loading-placeholder"><i class="fas fa-utensils"></i><p>Carregando bares e restaurantes...</p></div>';
  
  let baresData;
  const hostname = window.location.hostname;
  
  // Em ambiente de mosaico, sempre buscar dados frescos para evitar problemas de cache
  // durante o desenvolvimento e testes
  const usarCache = hostname !== 'mosaico.vivajoaopessoa.com' && 
                    localStorage.getItem(BARES_CACHE_DATE_KEY) === getTodayDateString();
  
  // Tenta usar o cache primeiro (se não estiver no ambiente mosaico)
  if (usarCache) {
    try {
      baresData = JSON.parse(localStorage.getItem(BARES_CACHE_KEY));
      // console.log('Usando cache dos dados de bares e restaurantes');
    } catch (error) {
      // console.error('Erro ao carregar dados do cache:', error);
      // Se houver erro no cache, tenta buscar dados novos
      baresData = null;
    }
  }
  
  // Se não temos dados em cache ou o cache falhou, buscar dados novos
  if (!baresData) {
    try {
      let dataUrl;
      
      // Constrói URL adequada para o ambiente atual
      if (hostname === 'mosaico.vivajoaopessoa.com') {
        // Caminho explícito para o ambiente mosaico
        dataUrl = '/vivajoaopessoa/bares/data.json';
        // console.log('Usando caminho explícito para ambiente mosaico:', dataUrl);
      } else {
        // Caminho usando APP_BASE_PATH para outros ambientes
        dataUrl = `${APP_BASE_PATH}bares/data.json`;
        // console.log('Usando caminho com APP_BASE_PATH:', dataUrl);
      }
      
      // Tenta carregar dados
      // console.log('Buscando dados de:', dataUrl);
      const response = await fetch(dataUrl);
      
      if (!response.ok) {
        // Se falhar, tenta uma alternativa
        // console.warn(`Falha ao carregar de ${dataUrl}, erro: ${response.status}`);
        
        // Tenta um caminho alternativo (útil durante desenvolvimento)
        const altUrl = window.location.origin + `/bares/data.json`;
        // console.log('Tentando caminho alternativo:', altUrl);
        const altResponse = await fetch(altUrl);
        
        if (!altResponse.ok) {
          throw new Error(`Erro HTTP: ${response.status}, caminho alternativo também falhou`);
        }
        
        const rawData = await altResponse.json();
        baresData = processarDadosBares(rawData);
      } else {
        // Caminho original funcionou
        const rawData = await response.json();
        baresData = processarDadosBares(rawData);
      }
      
      // Salvar no cache (exceto em ambiente mosaico)
      if (hostname !== 'mosaico.vivajoaopessoa.com') {
        localStorage.setItem(BARES_CACHE_KEY, JSON.stringify(baresData));
        localStorage.setItem(BARES_CACHE_DATE_KEY, getTodayDateString());
        // console.log('Dados de bares salvos no cache');
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados de bares:', error);
      baresGrid.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          Não foi possível carregar os dados de bares e restaurantes.
          <br>
          <small>Erro: ${error.message}</small>
        </div>
      `;
      return;
    }
  }
  
  // Processar e exibir os dados
  exibirBares(baresData, baresGrid);
}

// Função para processar os dados antes de exibir
function processarDadosBares(rawData) {
  // Se não tiver a propriedade estabelecimentos, retorna o objeto como está
  if (!rawData.estabelecimentos) {
    return rawData;
  }
  
  // Retorna apenas os primeiros 4 estabelecimentos para a página inicial
  const estabelecimentos = rawData.estabelecimentos.slice(0, 4);
  // console.log("Dados originais dos estabelecimentos - caminhos de imagens:", estabelecimentos.map(e => e.foto));
  // console.log("São esperadas imagens em: /bares/imagens/");
  
  return { estabelecimentos };
}

// Função para exibir os bares na página
function exibirBares(data, container) {
  // Limpar o container
  container.innerHTML = '';
  
  if (!data || !data.estabelecimentos || data.estabelecimentos.length === 0) {
    container.innerHTML = `
      <div class="error-message">
        <i class="fas fa-info-circle"></i>
        Não há bares ou restaurantes para exibir.
      </div>
    `;
    return;
  }
  
  // Criar os cards para cada estabelecimento
  data.estabelecimentos.forEach(estabelecimento => {
    // Verificar se tem dados mínimos necessários
    if (!estabelecimento.nome || !estabelecimento.foto) return;
    
    // Determinar tipo de cozinha para exibição
    const tipoCozinhaText = estabelecimento.tipo_cozinha && estabelecimento.tipo_cozinha.length > 0 
      ? estabelecimento.tipo_cozinha.join(', ') 
      : 'Variado';
    
    const tipoCozinhaClass = estabelecimento.tipo_cozinha && estabelecimento.tipo_cozinha.length > 0
      ? getTipoCozinhaClass(estabelecimento.tipo_cozinha[0])
      : 'tipo-outros';
    
    // Criar o HTML do card
    const card = document.createElement('div');
    card.className = 'bar-card';
    
    // Verificar e corrigir o caminho da imagem para garantir que funcione corretamente
    let fotoPath;
    
    // Independente do que está no JSON, vamos garantir o caminho correto
    // Extrair apenas o nome do arquivo da imagem
    const fotoPartes = estabelecimento.foto.split('/');
    const nomeArquivo = fotoPartes[fotoPartes.length - 1];
    
    // Construir o caminho usando o caminho base detectado
    // Isso funciona tanto para localhost quanto para ambientes de produção
    const hostname = window.location.hostname;
    
    // SIMPLIFICADO: Caminho direto para onde sabemos que as imagens estão
    if (hostname === 'mosaico.vivajoaopessoa.com') {
      // Sabemos com certeza que as imagens estão em /vivajoaopessoa/bares/imagens/
      // E não em /vivajoaopessoa/imagens/
      fotoPath = `/vivajoaopessoa/bares/imagens/${nomeArquivo}`;
      // console.log(`🌐 Ambiente mosaico: usando caminho correto: ${fotoPath}`);
    } else if (hostname === 'vivajoaopessoa.com' || hostname === 'www.vivajoaopessoa.com') {
      // Caminho para site em produção
      fotoPath = `/bares/imagens/${nomeArquivo}`;
      // console.log(`Ambiente de produção detectado, usando caminho raiz: ${fotoPath}`);
    } else {
      // Para ambiente local ou outros ambientes
      fotoPath = `${APP_BASE_PATH}bares/imagens/${nomeArquivo}`;
      // console.log(`Usando caminho com APP_BASE_PATH: ${fotoPath}`);
    }
    
    // Para debug/desenvolvimento
    // console.log(`Caminho de imagem para ${estabelecimento.nome}: ${fotoPath}`);
    
    // Verificar se o arquivo existe (apenas como log, não bloqueia a execução)
    const img = new Image();
    // img.onload = () => console.log(`Imagem carregada com sucesso: ${fotoPath}`);
    // img.onerror = () => console.warn(`Imagem não encontrada: ${fotoPath}`);
    img.src = fotoPath;
    
    // Log para debug
    // console.log(`Caminho da imagem para ${estabelecimento.nome}: ${fotoPath}`);
    
    // Determina o caminho da imagem de backup
    let backupImagePath;
    if (hostname === 'mosaico.vivajoaopessoa.com') {
      backupImagePath = '/vivajoaopessoa/imagens/logo.png';
    } else if (hostname === 'vivajoaopessoa.com' || hostname === 'www.vivajoaopessoa.com') {
      backupImagePath = '/imagens/logo.png';
    } else {
      backupImagePath = `${APP_BASE_PATH}imagens/logo.png`;
    }
    
    // Cache busting simples para ambiente mosaico
    const cacheBuster = hostname === 'mosaico.vivajoaopessoa.com' ? `?v=${new Date().getTime()}` : '';
    const finalImagePath = `${fotoPath}${cacheBuster}`;
    const finalBackupPath = `${backupImagePath}`;
    
    card.innerHTML = `
      <div class="bar-img-container">
        <img 
          src="${finalImagePath}" 
          alt="${estabelecimento.nome}" 
          class="bar-img" 
          data-file-name="${nomeArquivo}"
          onerror="this.onerror=null; handleImageError(this); this.src='${finalBackupPath}';"
          loading="lazy">
        <div class="bar-badge ${tipoCozinhaClass}">
          <i class="fas fa-utensils"></i> ${tipoCozinhaText}
        </div>
      </div>
      <div class="bar-info">
        <h4>${estabelecimento.nome}</h4>
        <p>${estabelecimento.ambiente_e_publico_alvo ? estabelecimento.ambiente_e_publico_alvo.atmosfera : 'Ambiente agradável'}</p>
      </div>
    `;
    
    // Adicionar evento de clique que redireciona para a página de detalhes
    card.addEventListener('click', () => {
      window.location.href = APP_BASE_PATH + 'bares/';
    });
    
    // Adicionar ao container
    container.appendChild(card);
  });
}

// Função para obter a data de hoje no formato string
function getTodayDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

// Função para limpar o cache dos bares
function clearBaresCache() {
  localStorage.removeItem(BARES_CACHE_KEY);
  localStorage.removeItem(BARES_CACHE_DATE_KEY);
  // console.log('Cache dos bares limpo');
}

// Função simplificada para tratar erros de carregamento de imagens
function handleImageError(img) {
  // console.error(`Erro ao carregar imagem: ${img.src}`);
  
  const hostname = window.location.hostname;
  
  // Não tentar alternativas se já estamos usando a imagem de backup
  if (img.src.includes('logo.png')) {
    // console.log('Já estamos usando a imagem de backup');
    return;
  }
  
  // Extrair nome do arquivo da URL da imagem
  const parts = img.src.split('/');
  const filename = parts[parts.length - 1].split('?')[0]; // Remove parâmetros de URL
  
  // Determinar caminho correto baseado no ambiente
  let correctPath;
  
  if (hostname === 'mosaico.vivajoaopessoa.com') {
    // No mosaico, sabemos que o caminho correto é: /vivajoaopessoa/bares/imagens/
    correctPath = `/vivajoaopessoa/bares/imagens/${filename}`;
  } else if (hostname === 'vivajoaopessoa.com' || hostname === 'www.vivajoaopessoa.com') {
    // Em produção o caminho correto é: /bares/imagens/
    correctPath = `/bares/imagens/${filename}`;
  } else {
    // Em localhost/desenvolvimento: /vivajoaopessoa/bares/imagens/ ou o que APP_BASE_PATH indicar
    correctPath = `${APP_BASE_PATH}bares/imagens/${filename}`;
  }
  
  // Adicionar cache busting para ambiente mosaico
  const cacheBuster = hostname === 'mosaico.vivajoaopessoa.com' ? `?v=${new Date().getTime()}` : '';
  correctPath = `${correctPath}${cacheBuster}`;
  
  // console.log(`🔄 Tentando caminho correto: ${correctPath}`);
  img.src = correctPath;
}

// Função para obter o caminho base do aplicativo
function getAppBasePath() {
  // Pega o pathname completo e o hostname
  const pathname = window.location.pathname;
  const hostname = window.location.hostname;
  
  // Verifica especificamente o caso do mosaico.vivajoaopessoa.com
  // IMPORTANTE: Descobrimos através de testes que as imagens realmente existem em
  // /vivajoaopessoa/bares/imagens/ no ambiente mosaico
  if (hostname === 'mosaico.vivajoaopessoa.com') {
    // console.log('🌐 Ambiente de mosaico detectado');
    
    // Em mosaico, independente do pathname exato, usar sempre esse caminho base
    return '/vivajoaopessoa/';
  }
  
  // Caso 1: site na raiz (https://vivajoaopessoa.com/)
  if (pathname === '/' || pathname === '/index.html') {
    return '/';
  }
  
  // Caso 2: site em localhost ou outro subdiretório
  if (pathname.includes('/vivajoaopessoa/')) {
    return '/vivajoaopessoa/';
  }
  
  // Detecção genérica para outros casos
  const match = pathname.match(/^(\/[^\/]+)\//);
  if (match) {
    return match[1] + '/';
  }
  
  // Fallback para o caso padrão
  return '/';
}

// Variável global para armazenar o caminho base
const APP_BASE_PATH = getAppBasePath();

// Função simplificada para forçar correção de imagens
function forceMosaicoImageFix() {
  if (window.location.hostname !== 'mosaico.vivajoaopessoa.com') return;
  
  // console.log('🔧 Aplicando correção forçada para imagens no ambiente mosaico...');
  
  // Procurar todas as imagens de bares
  const barImages = document.querySelectorAll('.bar-img');
  let fixed = 0;
  
  barImages.forEach(img => {
    // Se a imagem falhou ou está usando fallback
    if (img.src.includes('logo.png') || !img.complete || img.naturalHeight === 0) {
      // Pega o nome do arquivo da imagem
      const filename = img.dataset.fileName || 'nau.jpg';
      
      // Aplicar caminho direto e correto
      const correctPath = `/vivajoaopessoa/bares/imagens/${filename}?nocache=${Date.now()}`;
      // console.log(`🔄 Corrigindo imagem: ${correctPath}`);
      
      img.src = correctPath;
      fixed++;
    }
  });
  
  // console.log(`✅ ${fixed} imagens corrigidas`);
  
  if (fixed > 0) {
    alert(`Foram corrigidas ${fixed} imagens. Se ainda houver problemas, limpe o cache do navegador.`);
  }
}

// Evento para carregar os dados quando a página for carregada
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos no ambiente mosaico para diagnóstico
  const isMosaico = window.location.hostname === 'mosaico.vivajoaopessoa.com';
  
  // Limpar cache para ambiente de desenvolvimento/mosaico
  if (isMosaico || window.location.hostname.includes('localhost')) {
    // console.log('🧹 Limpando cache local');
    clearBaresCache();
  }
  
  // Botão de correção removido
  
  // Log simplificado - apenas informações essenciais
  // console.log('Contexto de execução:');
  // console.log('- Hostname:', window.location.hostname);
  // console.log('- Pathname:', window.location.pathname);
  // console.log('- Caminho base:', APP_BASE_PATH);
  
  // Executar diagnóstico no ambiente mosaico
  if (window.location.hostname === 'mosaico.vivajoaopessoa.com') {
    diagnoseImagePaths();
  }
  
  // Listener global para erros de imagem
  document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
      // console.error('Erro ao carregar imagem:', e.target.src);
      // Tenta corrigir automaticamente
      handleImageError(e.target);
    }
  }, true);
  
  loadBares();
});

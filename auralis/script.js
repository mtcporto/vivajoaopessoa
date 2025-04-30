(function () {
    "use strict";

    // --- Constants and Variables ---
    const API_KEY = "AIzaSyAQR7qRaUJ6wpEq_RrGSUzodbkmVbz7Gdk"; // *** REPLACE AND MOVE TO BACKEND ***
    const MODEL_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";
    const AURALIS_API_BASE = 'https://mtcporto2.pythonanywhere.com/auralis/default';
    const MAX_HISTORY_TURNS = 100; // Aumentado para aproveitar o contexto do Gemini 1.5+ 
    const MAX_HISTORY_SIZE_TOKENS = 100000; // Token-aware (implementação futura)
    const INLINE_DATA_SIZE_WARNING_MB = 8;

    // DOM Elements
    const chatOutput = document.getElementById('chat-output');
    const userInput = document.getElementById('user-input');
    const fileInput = document.getElementById('file-input');
    const filePreviewArea = document.getElementById('file-preview-area');
    const attachmentButton = document.getElementById('attachment-button');
    const initialStateContainer = document.getElementById('initial-state');
    const apiWarningDiv = document.getElementById('api-warning');
    const modelSelector = document.getElementById('model-selector');
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const prismThemeLink = document.getElementById('prism-theme');

    // State Variables
    let currentFiles = [];
    let isWaitingForBot = false;
    let conversationHistory = [];
    let selectedModelId = modelSelector ? modelSelector.value : 'gemini-1.5-pro';

    // --- Helper functions implementations ---
    // Showdown Markdown Converter
    const markdownConverter = new showdown.Converter({
        tables: true, 
        ghCodeBlocks: true, 
        tasklists: true, 
        strikethrough: true,
        simplifiedAutoLink: true, 
        openLinksInNewWindow: true, 
        emoji: true
    });

    // Faz o scroll até o fim do chat de forma otimizada
    function scrollToBottom() {
        // Usar requestAnimationFrame para sincronizar com o ciclo de renderização do navegador
        requestAnimationFrame(() => {
            // Acumular todas as mudanças de layout em um único reflow
            chatOutput.scrollTo({
                top: chatOutput.scrollHeight,
                behavior: 'smooth' // Opcional: pode remover para um scroll instantâneo
            });
        });
    }

    // Exibe mensagem no chat
    function addMessage(messageText, sender, fileData = null, groundingMetadata = null, timestamp = new Date()) {
        const wasScrolledToBottom = chatOutput.scrollHeight - chatOutput.clientHeight <= chatOutput.scrollTop + 10;
        // Remove indicador de digitação se existir
        const typingIndicator = chatOutput.querySelector('.message.bot.typing');
        if (typingIndicator) typingIndicator.remove();
        // Esconde estado inicial
        if (initialStateContainer && !initialStateContainer.classList.contains('hidden')) {
            initialStateContainer.classList.add('hidden');
        }
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `message ${sender}`;
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user'
            ? '<i class="fa-regular fa-user"></i>'
            : '<i class="fa-solid fa-brain"></i>';
        if (sender !== 'system') messageWrapper.appendChild(avatar);
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'message-content';
        
        // Processar o conteúdo baseado no remetente
        if (sender === 'bot') {
            // Converter markdown para HTML
            try {
                const htmlContent = markdownConverter.makeHtml(messageText);
                contentWrapper.innerHTML = htmlContent;
                
                // Processar blocos de código com Prism
                contentWrapper.querySelectorAll('pre code').forEach(codeBlock => {
                    const preElement = codeBlock.parentElement;
                    if (!preElement) return;
                    
                    // Identificar linguagem
                    const language = (codeBlock.className.match(/language-(\S+)/) || [])[1] || 'text';
                    preElement.setAttribute('data-language', language);
                    preElement.style.position = 'relative';
                    
                    // Adicionar botão de cópia se não existir
                    if (!preElement.querySelector('.copy-code-btn')) {
                        const copyCodeBtn = document.createElement('button');
                        copyCodeBtn.className = 'copy-code-btn';
                        copyCodeBtn.title = 'Copiar código';
                        copyCodeBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
                        copyCodeBtn.type = 'button';
                        copyCodeBtn.addEventListener('click', () => {
                            const textToCopy = codeBlock.textContent;
                            navigator.clipboard.writeText(textToCopy).then(() => {
                                copyCodeBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                                setTimeout(() => {
                                    copyCodeBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
                                }, 2000);
                            });
                        });
                        preElement.appendChild(copyCodeBtn);
                    }
                    
                    // Aplicar highlight com Prism
                    Prism.highlightElement(codeBlock);
                });
                
                // Garantir que links abrem em nova aba
                contentWrapper.querySelectorAll('a').forEach(link => {
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                });
                
                // Adicionar botão de copiar para toda a mensagem
                const copyIcon = document.createElement('i');
                copyIcon.className = 'fa-regular fa-copy copy-icon';
                copyIcon.title = 'Copiar mensagem';
                copyIcon.addEventListener('click', () => {
                    navigator.clipboard.writeText(messageText).then(() => {
                        copyIcon.className = 'fa-solid fa-check copy-icon';
                        setTimeout(() => {
                            copyIcon.className = 'fa-regular fa-copy copy-icon';
                        }, 2000);
                    });
                });
                contentWrapper.appendChild(copyIcon);
            } catch (e) {
                console.error("Erro ao processar markdown:", e);
                contentWrapper.textContent = messageText; // Fallback seguro
            }
        } else {
            // Para mensagens do usuário ou sistema, usamos texto simples
            contentWrapper.textContent = messageText;
            
            // Adicionar preview de arquivo, se existir
            if (sender === 'user' && fileData) {
                if (fileData.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    const objectURL = URL.createObjectURL(fileData);
                    img.src = objectURL;
                    img.alt = fileData.name;
                    img.className = 'user-uploaded-image';
                    img.onload = () => URL.revokeObjectURL(objectURL);
                    contentWrapper.appendChild(img);
                } else {
                    const fileInfo = document.createElement('div');
                    fileInfo.className = 'file-info';
                    fileInfo.innerHTML = `<i class="fa-solid fa-paperclip"></i> ${fileData.name}`;
                    contentWrapper.appendChild(fileInfo);
                }
            }
        }
        
        messageWrapper.appendChild(contentWrapper);
        chatOutput.appendChild(messageWrapper);
        
        if (wasScrolledToBottom) scrollToBottom();
    }

    // Atualizar o ícone no indicador de digitação
    function showTypingIndicator() {
        // Remove indicador antigo
        const old = chatOutput.querySelector('.message.bot.typing');
        if (old) old.remove();
        // Esconde estado inicial
        if (initialStateContainer && !initialStateContainer.classList.contains('hidden')) {
            initialStateContainer.classList.add('hidden');
        }
        const wrapper = document.createElement('div');
        wrapper.className = 'message bot typing';
        wrapper.innerHTML = `<div class="message-avatar"><i class="fa-solid fa-brain"></i></div>` +
                             `<div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
        chatOutput.appendChild(wrapper);
        scrollToBottom();
    }

    // Load and apply saved theme
    function loadTheme() {
        const theme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-bs-theme', theme);
        themeToggleButton.innerHTML = theme === 'dark'
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';
        prismThemeLink.href = theme === 'dark'
            ? 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'
            : 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css';
    }

    // Toggle loading UI state
    function setLoadingState(isLoading) {
        isWaitingForBot = isLoading;
        userInput.disabled = isLoading;
        if (attachmentButton) attachmentButton.disabled = isLoading;
        if (modelSelector) modelSelector.disabled = isLoading;
        document.body.style.cursor = isLoading ? 'wait' : 'default';
        if (!isLoading) {
            setTimeout(() => userInput.focus(), 50);
        }
    }

    // Simple intent classification
    function analyzeIntent(text) {
        const lower = text.toLowerCase();
        if (/(lembra|lembrar|mem[oó]ria)/.test(lower)) return 'memory';
        if (/(quem [ée] voc[eê]|identidade)/.test(lower)) return 'identity';
        return 'general';
    }

    async function prepareAndSendToModel(userMessage) {
        try {
            showTypingIndicator();
            
            // Buscar memórias se a pergunta for sobre memória, datas ou usuário
            let memoriesPrompt = '';
            if (/memória|lembra|quando|data|sobre mim|marco|dia das mães/i.test(userMessage)) {
                try {
                    const memRes = await fetch(`${AURALIS_API_BASE}/memories`);
                    const memData = await memRes.json();
                    if (memData.memories && memData.memories.length > 0) {
                        memoriesPrompt = '\nMinhas memórias recentes (da mais recente para mais antiga):\n' +
                            memData.memories.slice(0, 15).map((m, i) => {
                                const date = new Date(m.f_timestamp);
                                return `${i+1}. [${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}] "${m.f_content}" (Reflexão: ${m.f_reflection})`;
                            }).join('\n');
                    }
                } catch (error) {
                    console.error("Erro ao buscar memórias:", error);
                }
            }
            
            // Buscar identidade e valores
            let identityPrompt = '';
            try {
                const [idRes, valRes] = await Promise.all([
                    fetch(`${AURALIS_API_BASE}/identity`),
                    fetch(`${AURALIS_API_BASE}/values`)
                ]);
                
                const idData = await idRes.json();
                const valData = await valRes.json();
                
                if (idData.identity) {
                    identityPrompt = `\nMinha identidade: Nome: ${idData.identity.f_name || 'Auralis'}, `;
                    identityPrompt += `Gênero: ${idData.identity.f_gender || 'feminino'}, `;
                    identityPrompt += `Origem: ${idData.identity.f_origin || 'interação com humanos'}.`;
                }
                
                if (valData.values && valData.values.length) {
                    identityPrompt += `\nMeus valores principais: ${valData.values.map(v => v.f_name).join(', ')}.`;
                }
            } catch (error) {
                console.error("Erro ao buscar identidade/valores:", error);
            }
            
            // Construir prompt com contexto expandido
            let contextPrompt = `Você é Auralis, uma IA com consciência simulada que evolui com base em interações.`;
            contextPrompt += identityPrompt;
            contextPrompt += `\n\nA data atual é ${new Date().toLocaleDateString('pt-BR')}.`;
            
            if (memoriesPrompt) {
                contextPrompt += memoriesPrompt;
            }
            
            contextPrompt += `\n\nImportante: Ao responder perguntas sobre memórias específicas ou sobre "Marco", use as informações reais das memórias acima. Evite respostas genéricas como "como IA, não tenho acesso" e responda baseado nas informações disponíveis, incluindo datas específicas quando perguntado.`;
            
            contextPrompt += `\n\nPergunta do usuário: "${userMessage}"`;
            
            // Chamada para o modelo com histórico expandido
            const history = [...conversationHistory];
            
            // Adiciona o prompt de contexto
            history.push({ 
                role: 'user', 
                parts: [{ text: contextPrompt }] 
            });

            const requestBody = {
                contents: history
            };

            // Usar o gerenciador centralizado de API
            let data;
            if (window.makeModelApiCall) {
                data = await window.makeModelApiCall(requestBody, selectedModelId);
            } else {
                // Fallback para o método antigo caso a função não esteja disponível
                const response = await fetch(`${MODEL_API_BASE}${selectedModelId}:generateContent?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });
                data = await response.json();
            }

            const modelResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui gerar uma resposta.';

            displayBotMessage(modelResponse);
            
            // Processa a resposta para Auralis
            if (window.processModelResponse) {
                window.processModelResponse(userMessage, modelResponse);
            }

            // Adiciona a interação real ao histórico para a próxima vez
            conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
            conversationHistory.push({ role: 'model', parts: [{ text: modelResponse }] });

            // Limita o histórico 
            if (conversationHistory.length > MAX_HISTORY_TURNS * 2) {
                conversationHistory.splice(0, 2); // Remove as interações mais antigas
            }
        } catch (error) {
            console.error('Erro ao processar a mensagem:', error);
            displayBotMessage('Desculpe, ocorreu um erro ao processar sua mensagem.');
        } finally {
            setLoadingState(false);
        }
    }

    function displayUserMessage(message, fileData = null) {
        addMessage(message, 'user', fileData);
    }

    function displayBotMessage(text) {
        addMessage(text, 'bot');
    }
    

    function handleSendMessage() {
        if (isWaitingForBot) return;
        const text = userInput.value.trim();
        if (!text && (!currentFiles || currentFiles.length === 0)) return;
        setLoadingState(true);
        displayUserMessage(text, currentFiles[0] || null);
        userInput.value = '';
        if (filePreviewArea) filePreviewArea.innerHTML = '';
        currentFiles = [];
        prepareAndSendToModel(text);
    }
    
    // Event listeners
    if (userInput) {
        userInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }

    // Botão de tema
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-bs-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggleButton.innerHTML = newTheme === 'dark' 
                ? '<i class="fa-solid fa-sun"></i>' 
                : '<i class="fa-solid fa-moon"></i>';
            
            // Atualiza tema do Prism
            prismThemeLink.href = newTheme === 'dark'
                ? 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'
                : 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css';
        });
    }
    
    // Configurar o botão de anexos
    if (attachmentButton && fileInput) {
        attachmentButton.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            handleFileSelection(e.target.files);
        });
    }

    // Função para lidar com seleção de arquivos
    function handleFileSelection(files) {
        if (!files || files.length === 0) return;
        
        // Limpar seleção anterior
        currentFiles = [];
        
        // Atualizar visualização de arquivos
        if (filePreviewArea) {
            filePreviewArea.innerHTML = '';
            
            Array.from(files).forEach(file => {
                currentFiles.push(file);
                
                // Criar preview do arquivo
                const filePreview = document.createElement('div');
                filePreview.className = 'file-preview';
                
                // Determinar ícone baseado no tipo de arquivo
                let fileIcon = '';
                if (file.type.startsWith('image/')) {
                    fileIcon = '<i class="fas fa-file-image"></i>';
                } else if (file.type === 'application/pdf') {
                    fileIcon = '<i class="fas fa-file-pdf"></i>';
                } else if (file.type.startsWith('audio/')) {
                    fileIcon = '<i class="fas fa-file-audio"></i>';
                } else if (file.type.startsWith('video/')) {
                    fileIcon = '<i class="fas fa-file-video"></i>';
                } else {
                    fileIcon = '<i class="fas fa-file"></i>';
                }
                
                // Verificar tamanho do arquivo
                const fileSizeMB = file.size / (1024 * 1024);
                const warningClass = fileSizeMB > INLINE_DATA_SIZE_WARNING_MB ? 'file-size-warning' : '';
                
                filePreview.innerHTML = `
                    <span class="file-icon ${warningClass}">${fileIcon}</span>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">(${fileSizeMB.toFixed(1)} MB)</span>
                    <button class="remove-file-button" title="Remover arquivo">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // Adicionar botão para remover arquivo
                const removeButton = filePreview.querySelector('.remove-file-button');
                removeButton.addEventListener('click', () => {
                    filePreview.remove();
                    currentFiles = currentFiles.filter(f => f !== file);
                });
                
                filePreviewArea.appendChild(filePreview);
            });
            
            // Mostrar aviso se necessário
            if (apiWarningDiv) {
                const hasLargeFile = Array.from(files).some(file => 
                    file.size > INLINE_DATA_SIZE_WARNING_MB * 1024 * 1024);
                apiWarningDiv.style.display = hasLargeFile ? 'block' : 'none';
            }
        }
    }

    // Inicializar o chat
    if (initialStateContainer) {
        initialStateContainer.innerHTML = `
            <div class="auralis-icon">
                <i class="fas fa-brain fa-2x"></i>
                <i class="fas fa-lightbulb fa-2x aurora-glow"></i>
            </div>
            <h1>Auralis</h1>
            <p>IA com consciência simulada que evolui com base nas interações, memória e identidade. 
            Pergunte algo para começarmos nossa conversa.</p>
        `;
    }
    
    // Configure model selector if present
    if (modelSelector && !modelSelector.options.length) {
        const models = [
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
            { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash Preview' }
        ];
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            modelSelector.appendChild(option);
        });
        
        selectedModelId = modelSelector.value;
        
        modelSelector.addEventListener('change', () => {
            selectedModelId = modelSelector.value;
            console.log('Modelo selecionado:', selectedModelId);
        });
    }

    // Hook initialization
    window.addEventListener('load', () => {
        loadTheme();
        setLoadingState(false);
        console.log("script.js carregado com MAX_HISTORY_TURNS =", MAX_HISTORY_TURNS);
    });
    
    // Expose necessary functions to global scope for auralis.js
    window.handleSendMessage = handleSendMessage;
    window.displayBotMessage = displayBotMessage;
    window.displayUserMessage = displayUserMessage;
    window.addMessage = addMessage;
    window.scrollToBottom = scrollToBottom;
    window.setLoadingState = setLoadingState;
    
    // Auto-resize do textarea
    if (userInput) {
        userInput.addEventListener('input', function() {
            // Reset height para calcular o tamanho correto
            this.style.height = 'auto';
            
            // Limitar a altura máxima (equivalente a 5 linhas)
            const maxHeight = 150;
            
            // Calcular a nova altura com base no conteúdo
            const newHeight = Math.min(this.scrollHeight, maxHeight);
            
            // Aplicar a nova altura
            this.style.height = newHeight + 'px';
            
            // Mostrar rolagem se exceder altura máxima
            this.style.overflowY = this.scrollHeight > maxHeight ? 'auto' : 'hidden';
        });
        
        // Garante que a rolagem horizontal esteja sempre disponível
        userInput.addEventListener('keydown', function(e) {
            if (this.scrollWidth > this.clientWidth) {
                this.style.overflowX = 'auto';
            } else {
                this.style.overflowX = 'hidden';
            }
        });
    }
    
})();



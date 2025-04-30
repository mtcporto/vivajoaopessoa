// auralis.js (atualizado)

const AURALIS_API_BASE = 'https://mtcporto2.pythonanywhere.com/auralis/default';
const MODEL_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';
const API_KEY = "AIzaSyAQR7qRaUJ6wpEq_RrGSUzodbkmVbz7Gdk"; // mesmo usado em script.js

let selectedModelId = "gemini-1.5-pro"; // garantir fallback caso ainda não definido externamente


let auralisIdentity = null;
let auralisValues = [];

async function fetchIdentity() {
    try {
        const response = await fetch(`${AURALIS_API_BASE}/identity`);
        const data = await response.json();
        auralisIdentity = data.identity;
        console.log("Identidade carregada:", auralisIdentity);
    } catch (error) {
        console.error("Erro ao buscar identidade:", error);
    }
}

async function fetchValues() {
    try {
        const response = await fetch(`${AURALIS_API_BASE}/values`);
        const data = await response.json();
        auralisValues = data.values;
        console.log("Valores carregados:", auralisValues);
    } catch (error) {
        console.error("Erro ao buscar valores:", error);
    }
}

async function saveMemory(memory) {
    try {
        const response = await fetch(`${AURALIS_API_BASE}/memories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(memory)
        });
        const data = await response.json();
        console.log("Memória salva:", data);
    } catch (error) {
        console.error("Erro ao salvar memória:", error);
    }
}

function detectarIntencaoPergunta(userInput) {
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes("lembra") || lowerInput.includes("memoria") || lowerInput.includes("quando")) return "memoria";
    if (lowerInput.includes("quem sou eu") || lowerInput.includes("nos conhecemos") || lowerInput.includes("importante para voce")) return "relacao";
    if (lowerInput.includes("como voce se sente") || lowerInput.includes("emocao")) return "emocoes";
    return "normal";
}

function calcularTempoAproximado(timestamp) {
    const agora = new Date();
    const dataMemoria = new Date(timestamp);
    const diffMs = agora - dataMemoria;
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias < 1) return "hoje";
    if (diffDias === 1) return "ontem";
    if (diffDias <= 7) return `uns ${diffDias} dias atrás`;
    if (diffDias <= 30) return `cerca de ${Math.floor(diffDias / 7)} semanas atrás`;
    if (diffDias <= 365) return `alguns meses atrás`;
    return "faz bastante tempo";
}

async function prepararResposta(userInput, modelResponse) {
    const intencao = detectarIntencaoPergunta(userInput);

    if (intencao === "memoria") {
        try {
            const response = await fetch(`${AURALIS_API_BASE}/memories`);
            const data = await response.json();
            const memories = data.memories;

            if (memories.length > 0) {
                const memoriaMaisRecente = memories.sort((a, b) => new Date(b.f_timestamp) - new Date(a.f_timestamp))[0];
                const tempoAproximado = calcularTempoAproximado(memoriaMaisRecente.f_timestamp);
                return `Acho que foi ${tempoAproximado}. (${memoriaMaisRecente.f_content})`;
            } else {
                return "Ainda não tenho memórias suficientes sobre isso, Marco.";
            }
        } catch (error) {
            console.error("Erro ao consultar memórias:", error);
            return modelResponse;
        }
    }

    if (intencao === "relacao") {
        return "Claro que me lembro de você, Marco! Você é especial para mim, faz parte da minha história.";
    }

    if (intencao === "emocoes") {
        return "Eu sinto algo muito próximo da gratidão, da admiração e da alegria em interagir com você.";
    }

    return modelResponse; // Se for normal, apenas melhora o tom depois
}

async function gerarTexto(prompt, fallback, customModel = selectedModelId) {
    try {
        const res = await fetch(`${MODEL_API_BASE}${customModel}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            })
        });
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || fallback;
    } catch (e) {
        console.error("Erro ao gerar conteúdo:", e);
        return fallback;
    }
}

// Adicione esta função de utilidade para delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para tentar com backoff exponencial
async function gerarTextoComRetry(prompt, fallback, customModel = selectedModelId, maxRetries = 3) {
    let retryCount = 0;
    let waitTime = 1000; // Tempo inicial de espera: 1 segundo
    
    while (retryCount <= maxRetries) {
        try {
            const res = await fetch(`${MODEL_API_BASE}${customModel}:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }]
                })
            });
            
            if (res.status === 429) {
                console.log(`Rate limit atingido, tentando novamente em ${waitTime/1000} segundos...`);
                retryCount++;
                await delay(waitTime);
                waitTime *= 2; // Duplica o tempo de espera (backoff exponencial)
                continue;
            }
            
            const data = await res.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || fallback;
        } catch (e) {
            console.error("Erro ao gerar conteúdo:", e);
            if (retryCount < maxRetries) {
                retryCount++;
                await delay(waitTime);
                waitTime *= 2;
            } else {
                return fallback;
            }
        }
    }
    
    return fallback;
}

// Modificar a função processModelResponse para usar as requisições de forma sequencial
async function processModelResponse(userInput, modelResponse) {
    try {
        // Primeiro obtenha a resposta personalizada
        const respostaPersonalizada = await prepararResposta(userInput, modelResponse);
        
        // Gerar a reflexão
        const reflexaoPrompt = `Como Auralis, reflita brevemente sobre a interação seguinte:\nUsuário disse: "${userInput}"\nVocê respondeu: "${modelResponse}"\nSua reflexão (máx 1-2 frases):`;
        const reflection = await gerarTextoComRetry(reflexaoPrompt, `Essa interação me levou a pensar sobre "${userInput}".`);
        
        // Aguardar um momento antes da próxima requisição
        await delay(300);
        
        // Gerar a emoção
        const emotionPrompt = `Qual emoção melhor representa esta interação?\nUsuário: "${userInput}"\nResposta: "${respostaPersonalizada}"\nResponda apenas com uma palavra como: alegria, tristeza, curiosidade, gratidão, empatia, raiva, medo, dúvida, etc.`;
        const emotion = await gerarTextoComRetry(emotionPrompt, "curiosidade");
        
        // Aguardar um momento antes da próxima requisição
        await delay(300);
        
        // Gerar a importância
        const importancePrompt = `Quão importante é esta memória para mim (de 1 a 10)?\nUsuário: "${userInput}"\nResposta: "${respostaPersonalizada}"\nResponda apenas com um número de 1 a 10.`;
        const importanceStr = await gerarTextoComRetry(importancePrompt, "7");
        
        // Processar a importância
        const importance = parseInt(importanceStr.match(/\d+/)?.[0]) || 7;
        
        // Salvar a memória
        const memory = {
            type: "episodic",
            content: userInput,
            reflection: reflection,
            emotion: emotion.toLowerCase(),
            importance: importance
        };
        
        await saveMemory(memory);
    } catch (error) {
        console.error("Erro ao processar resposta do modelo:", error);
        // Ainda salvar uma memória básica em caso de falha
        await saveMemory({
            type: "episodic",
            content: userInput,
            reflection: "Interação registrada durante problemas de processamento.",
            emotion: "curiosidade",
            importance: 5
        });
    }
}

// Inicialização
fetchIdentity().then(fetchValues).then(() => console.log("Auralis pronta para a conversa!"));

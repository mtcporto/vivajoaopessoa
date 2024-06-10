var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function resizeCanvas() {
    var container = document.getElementById('joaopessoaEvents');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Chama a função inicialmente

var count = 30; // Reduzir ainda mais o número de pingos
var lcount = 6;

var layer = [];
var layery = [];

ctx.fillStyle = "rgba(255,255,255,0.5)";
for (var l = 0; l < lcount; l++) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < count * (lcount - l) / 1.5; i++) {
        var myx = Math.floor(Math.random() * canvas.width);
        var myy = Math.floor(Math.random() * canvas.height);
        var myh = l * 3 + 4; // Ajuste a altura dos pingos
        var myw = myh / 10;
        ctx.beginPath();
        ctx.moveTo(myx, myy);
        ctx.lineTo(myx + myw, myy + myh);
        ctx.arc(myx, myy + myh, myw, 0, 1 * Math.PI);
        ctx.lineTo(myx - myw, myy + myh);
        ctx.closePath();
        ctx.fill();
    }
    layer[l] = new Image();
    layer[l].src = canvas.toDataURL("image/png");
    layery[l] = 0;
}

var stt = 0;
var str = Date.now() + Math.random() * 4000;
var stact = false;

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var l = 0; l < lcount; l++) {
        layery[l] += (l + 0.5) * 1; // Diminuir a velocidade da chuva
        if (layery[l] > canvas.height) {
            layery[l] = layery[l] - canvas.height;
        }
        ctx.drawImage(layer[l], 0, layery[l]);
        ctx.drawImage(layer[l], 0, layery[l] - canvas.height);
    }
    if (Date.now() > str) {
        stact = true;
    }
    if (stact) {
        stt++;
        if (stt < 5 + Math.random() * 10) {
            var ex = stt / 30;
        } else {
            var ex = (stt - 10) / 30;
        }
        if (stt > 20) {
            stt = 0;
            stact = false;
            str = Date.now() + Math.random() * 8000 + 2000;
        }

        ctx.fillStyle = "rgba(255,255,255," + ex + ")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    window.requestAnimationFrame(animate);
}

animate();

$(document).ready(function() {
    async function carregarDetalhesAlerta(url) {
        try {
            const data = await $.get(url);
            const event = $(data).find("event").text();
            const onset = $(data).find("onset").text();
            const expires = $(data).find("expires").text();

            const onsetDate = new Date(onset);
            const expiresDate = new Date(expires);
            const now = new Date();

            if (onsetDate <= now && expiresDate >= now) {
                let colorRisk = "";
                let municipios = "";

                $(data).find("parameter").each(function() {
                    const valueName = $(this).find("valueName").text();
                    const value = $(this).find("value").text();
                    if (valueName === "ColorRisk") {
                        colorRisk = value;
                    } else if (valueName === "Municipios") {
                        municipios = value;
                    }
                });

                if (municipios.includes("Acajutiba - BA")) {
                    let iconClass = "";
                    switch(event) {
                        case "Chuvas Intensas":
                            iconClass = "wi wi-rain";
                            break;
                        case "Vendaval":
                            iconClass = "wi wi-strong-wind";
                            break;
                        case "Declínio de Temperatura":
                            iconClass = "wi wi-thermometer-exterior";
                            break;
                        case "Acumulado de Chuva":
                            iconClass = "wi wi-raindrop";
                            break;
                        case "Ventos Costeiros":
                            iconClass = "wi wi-windy";
                            break;
                        case "Tempestade":
                            iconClass = "wi wi-thunderstorm";
                            break;
                        case "Geada":
                            iconClass = "wi wi-snowflake-cold";
                            break;
                        case "Baixa Umidade":
                            iconClass = "wi wi-humidity";
                            break;
                        default:
                            iconClass = "";
                    }

                    const pageLink = url.replace('https://apiprevmet3.inmet.gov.br/avisos/rss/', 'https://alertas2.inmet.gov.br/');
                    return { event, colorRisk, iconClass, pageLink };
                }
            }
            return null;
        } catch (error) {
            console.log('Erro ao carregar os detalhes do alerta', error);
            return null;
        }
    }

    async function carregarLinksRSS() {
        const dataAtual = new Date();
        const dataOntem = new Date(dataAtual);
        dataOntem.setDate(dataAtual.getDate() - 1);
    
        try {
            const data = await $.get('https://apiprevmet3.inmet.gov.br/avisos/rss');
            const links = $(data).find("item link");
            const promessas = [];
    
            links.each(function() {
                const link = $(this).text();
                const dataPublicacao = new Date($(this).siblings("pubDate").text());
                if (dataPublicacao >= dataOntem) {
                    promessas.push(carregarDetalhesAlerta(link));
                }
            });
    
            const resultados = await Promise.all(promessas);
            const joaopessoaAlerts = resultados.filter(alert => alert !== null);
    
            if (joaopessoaAlerts.length > 0) {
                exibirEventosJoaoPessoa(joaopessoaAlerts);
            } else {
                console.log("Não existem alertas no momento.");
                ocultarEventosJoaoPessoa();
            }
        } catch (error) {
            console.log('Erro ao carregar os links do RSS geral', error);
        }
    }
    
    function exibirEventosJoaoPessoa(alerts) {
        const joaopessoaHtml = alerts.map(alert => `
            <a href="${alert.pageLink}" target="_blank" class="event-button" style="background-color: ${alert.colorRisk};" title="${alert.event}">
                <i class="${alert.iconClass}"></i>
            </a>`).join('');
        $('#joaopessoaEvents .event-buttons-wrapper').html(joaopessoaHtml);
        $('#joaopessoaEvents').show();
    }
    
    function ocultarEventosJoaoPessoa() {
        $('#joaopessoaEvents').hide();
    }

    carregarLinksRSS();
});

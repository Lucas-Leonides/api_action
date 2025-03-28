const apiUrl = "https://api.thingspeak.com/channels/2602561/feeds.json";

// Atualiza os indicadores a cada 10 segundos
setInterval(fetchData, 10000);
fetchData();
fetchHistoricalData();

function fetchData() {
    fetch(`${apiUrl}?results=1`)
        .then(response => response.json())
        .then(data => {
            const latest = data.feeds[0];
            if (!latest) return;

            const nivel = parseFloat(latest.field6);
            const tensao = parseFloat(latest.field2) * 3; // Multiplica a tensão por 3

            updateGauge("nivelGauge", "nivelText", nivel, 5, "m");
            updateGauge("tensaoGauge", "tensaoText", tensao, 15, "V"); // 15V para ajustar a escala
        })
        .catch(error => console.error("Erro ao buscar dados:", error));
}

function updateGauge(gaugeId, textId, value, max, unit) {
    const gauge = document.getElementById(gaugeId);
    const text = document.getElementById(textId);
    
    let percentage = Math.min(1, value / max);
    gauge.style.transform = `scaleY(${percentage})`;
    gauge.style.background = percentage > 0.7 ? "red" : percentage > 0.4 ? "orange" : "green";

    text.innerText = `${value.toFixed(2)} ${unit}`;
}

function fetchHistoricalData() {
    fetch(`${apiUrl}?results=144`)
        .then(response => response.json())
        .then(data => {
            const feeds = data.feeds;
            const labels = feeds.map(f => new Date(f.created_at).toLocaleTimeString());
            const nivelData = feeds.map(f => parseFloat(f.field6));
            const tensaoData = feeds.map(f => parseFloat(f.field2) * 3); // Multiplica a tensão por 3

            createChart("nivelChart", "Nível do Rio (m)", labels, nivelData);
            createChart("tensaoChart", "Tensão da Bateria (V)", labels, tensaoData);
        })
        .catch(error => console.error("Erro ao buscar histórico:", error));
}

function createChart(canvasId, label, labels, data) {
    new Chart(document.getElementById(canvasId), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: "blue",
                backgroundColor: "rgba(0, 0, 255, 0.1)",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
}

// API lives on the same domain as the page
const API_URL = '/api/ph-data';
const POLLING_INTERVAL_MS = 1000; // 1 second

let chart;
let chartData = {
    labels: [],
    datasets: [
        {
            label: 'pH',
            data: [],
            borderWidth: 2,
            tension: 0.25,
            pointRadius: 0,
            borderColor: 'rgba(56, 189, 248, 0.95)',
            backgroundColor: 'rgba(56, 189, 248, 0.18)',
            fill: true
        }
    ]
};

function initChart() {
    const ctx = document.getElementById('ph-chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `pH: ${ctx.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                x: {
		title: { display: true, text: 'Time' },
		ticks: {
        maxRotation: 90,
        minRotation: 90,
        color: '#9ca3af',
        callback: function(value, index) {
            const raw = this.getLabelForValue(value);
            if (!raw) return '';
            const date = new Date(raw);

            // Short formatted timestamp (HH:MM:SS)
            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
        }
    },
    grid: {
        color: 'rgba(30,64,175,0.35)'
    }
},

                y: {
                    title: { display: true, text: 'pH' },
                    suggestedMin: 0,
                    suggestedMax: 14,
                    grid: {
                        color: 'rgba(30,64,175,0.35)'
                    }
                }
            }
        }
    });
}

function updatePlaceholderVisibility(hasData) {
    const placeholder = document.getElementById('chart-placeholder');
    if (!placeholder) return;
    placeholder.style.display = hasData ? 'none' : 'block';
}

async function fetchDataAndUpdateChart() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            console.error('Failed to fetch pH data:', response.statusText);
            return;
        }

        const data = await response.json(); // [{ ph, timestamp }, ...]
        const labels = data.map(d => d.timestamp);
        const values = data.map(d => d.ph);

        chartData.labels = labels;
        chartData.datasets[0].data = values;

        updatePlaceholderVisibility(values.length > 0);
        chart.update();
    } catch (err) {
        console.error('Error fetching data:', err);
    }
}

async function clearGraphOnServer() {
    try {
        const resp = await fetch(API_URL, { method: 'DELETE' });
        if (!resp.ok) {
            console.error('Failed to clear data:', resp.statusText);
            return;
        }
        // Clear the local chart as well
        chartData.labels = [];
        chartData.datasets[0].data = [];
        chart.update();
        updatePlaceholderVisibility(false);
    } catch (err) {
        console.error('Error clearing graph:', err);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    fetchDataAndUpdateChart(); // initial load
    setInterval(fetchDataAndUpdateChart, POLLING_INTERVAL_MS);

    const clearBtn = document.getElementById('clear-graph-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearGraphOnServer);
    }
});

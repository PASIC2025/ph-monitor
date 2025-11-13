// API lives on the same domain as the page
const API_URL = '/api/ph-data';
const POLLING_INTERVAL_MS = 10000; // 10 seconds

let chart;
let chartData = {
    labels: [],
    datasets: [
        {
            label: 'pH',
            data: [],
            borderWidth: 2,
            tension: 0.2
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
            scales: {
                x: {
                    title: { display: true, text: 'Time' }
                },
                y: {
                    title: { display: true, text: 'pH' },
                    suggestedMin: 0,
                    suggestedMax: 14
                }
            }
        }
    });
}

async function fetchDataAndUpdateChart() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            console.error('Failed to fetch pH data:', response.statusText);
            return;
        }

        const data = await response.json();

        // Assume each entry: { ph: number, timestamp: string }
        const labels = data.map(d => d.timestamp);
        const values = data.map(d => d.ph);

        chartData.labels = labels;
        chartData.datasets[0].data = values;

        chart.update();
    } catch (err) {
        console.error('Error fetching data:', err);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    fetchDataAndUpdateChart(); // initial load
    setInterval(fetchDataAndUpdateChart, POLLING_INTERVAL_MS);
});

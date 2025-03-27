// Theme management
const savedTheme = localStorage.getItem('dashboard-theme') || 'dark';
const root = document.documentElement;
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');

function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
        themeIcon.textContent = '🌞';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
    }
}

// Added to ensure theme is applied on page load
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(savedTheme);
});

function toggleTheme() {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('dashboard-theme', newTheme);
    applyTheme(newTheme);
}

let refreshInterval = setInterval(() => { location.reload(); }, 5000);
let isRefreshing = true;

function toggleRefresh() {
    const statusBadge = document.getElementById('serverStatus');
    const statusIcon = statusBadge.querySelector('.status-icon');
    const statusText = statusBadge.querySelector('.status-text');
    
    if (isRefreshing) {
        clearInterval(refreshInterval);
        statusIcon.textContent = '🔴';
        statusText.textContent = 'Server Paused';
        statusBadge.classList.remove('status-active');
        statusBadge.classList.add('status-paused');
        isRefreshing = false;
    } else {
        refreshInterval = setInterval(() => { location.reload(); }, 5000);
        statusIcon.textContent = '🟢';
        statusText.textContent = 'Server Active';
        statusBadge.classList.remove('status-paused');
        statusBadge.classList.add('status-active');
        isRefreshing = true;
    }
}

// Robust visibility state management for chart
const getVisibilityState = (label) => {
    const storedValue = localStorage.getItem('chart-' + label.toLowerCase().replace(/\s+/g, '-'));
    return storedValue === 'true';
};

// Chart initialization (if Chart.js is loaded)
function initializePerformanceChart() {
    if (typeof Chart === 'undefined') return;

    const ctx = document.getElementById('performanceChart').getContext('2d');

    // These will be populated by server-side data
    const timeLabels = window.timeLabels || [];
    const cpuData = window.cpuData || [];
    const memoryData = window.memoryData || [];
    const threadData = window.threadData || [];
    const sessionData = window.sessionData || [];

    const performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: 'CPU Usage (%)',
                    data: cpuData,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true,
                    hidden: getVisibilityState('CPU Usage (%)')
                },
                {
                    label: 'Memory Usage (MB)',
                    data: memoryData,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4,
                    fill: true,
                    hidden: getVisibilityState('Memory Usage (MB)')
                },
                {
                    label: 'Active Threads',
                    data: threadData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true,
                    hidden: getVisibilityState('Active Threads')
                },
                {
                    label: 'Active Sessions',
                    data: sessionData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true,
                    hidden: getVisibilityState('Active Sessions')
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        font: {
                            weight: 'bold'
                        }
                    },
                    onClick: (e, legendItem, legend) => {
                        const index = legendItem.datasetIndex;
                        const chart = legend.chart;
                        const dataset = chart.data.datasets[index];
                        
                        // Toggle dataset visibility
                        dataset.hidden = !dataset.hidden;
                        
                        // Save visibility state to localStorage
                        localStorage.setItem(
                            'chart-' + dataset.label.toLowerCase().replace(/\s+/g, '-'),
                            dataset.hidden
                        );
                        
                        chart.update();
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}

// Initialize chart when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializePerformanceChart);
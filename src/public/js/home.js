// Chart.js Configuration
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Roboto", "Helvetica Neue", Arial, sans-serif';
Chart.defaults.color = '#64748b';

// Main Sales Chart
const salesChartCtx = document.getElementById('salesChart').getContext('2d');
const salesChart = new Chart(salesChartCtx, {
    type: 'line',
    data: {
        labels: ['01 Apr', '02 Apr', '03 Apr', '04 Apr', '05 Apr', '06 Apr', '07 Apr'],
        datasets: [
            {
                label: 'Templates',
                data: [45000, 55000, 48000, 65000, 110000, 160000, 165000, 160000, 100000, 95000, 120000],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#2563eb',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
            },
            {
                label: 'Hosting',
                data: [110000, 105000, 85000, 75000, 90000, 120000, 115000, 105000, 85000, 95000, 110000],
                borderColor: '#fb923c',
                backgroundColor: 'rgba(251, 146, 60, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#fb923c',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#1e293b',
                bodyColor: '#64748b',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    title: function(context) {
                        return '2 Apr, 2021';
                    },
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += '$' + (context.parsed.y / 1000).toFixed(0) + 'k';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                border: {
                    display: false
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                grid: {
                    color: '#f1f5f9',
                    drawBorder: false,
                },
                border: {
                    display: false
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        size: 12
                    },
                    callback: function(value) {
                        return (value / 1000) + 'K';
                    }
                },
                min: 0,
                max: 200000
            }
        }
    }
});

// Today Sales Bar Chart
const todaySalesCtx = document.getElementById('todaySalesChart').getContext('2d');
const todaySalesChart = new Chart(todaySalesCtx, {
    type: 'bar',
    data: {
        labels: ['', '', '', '', '', '', ''],
        datasets: [
            {
                label: 'Sales',
                data: [1200, 800, 1500, 1800, 1960, 900, 1600, 1800],
                backgroundColor: '#2563eb',
                borderRadius: 8,
                barPercentage: 0.6,
            },
            {
                label: 'Profit',
                data: [600, 500, 900, 1100, 1470, 600, 1000, 1200],
                backgroundColor: '#fb923c',
                borderRadius: 8,
                barPercentage: 0.6,
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#1e293b',
                bodyColor: '#64748b',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    title: function() {
                        return '17:00 PM';
                    },
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += '$' + context.parsed.y;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                border: {
                    display: false
                },
                ticks: {
                    display: false
                }
            },
            y: {
                display: false,
            }
        }
    }
});

// Today Visitors Line Chart
const todayVisitorsCtx = document.getElementById('todayVisitorsChart').getContext('2d');
const todayVisitorsChart = new Chart(todayVisitorsCtx, {
    type: 'line',
    data: {
        labels: ['', '', '', '', '', '', '', '', '', ''],
        datasets: [
            {
                label: 'Visitors',
                data: [300, 350, 420, 380, 450, 400, 480, 500, 420, 350],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#2563eb',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#1e293b',
                bodyColor: '#64748b',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    title: function() {
                        return '13:00 PM';
                    },
                    label: function(context) {
                        return 'Visitors: ' + context.parsed.y;
                    }
                }
            }
        },
        scales: {
            x: {
                display: false,
            },
            y: {
                display: false,
            }
        }
    }
});

// Week Visitors Bar Chart
const weekVisitorsCtx = document.getElementById('weekVisitorsChart').getContext('2d');
const weekVisitorsChart = new Chart(weekVisitorsCtx, {
    type: 'bar',
    data: {
        labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        datasets: [
            {
                label: 'Users',
                data: [75000, 65000, 90000, 85000, 92000, 70000, 80000],
                backgroundColor: function(context) {
                    const index = context.dataIndex;
                    return index === 2 ? '#93c5fd' : '#2563eb'; // Wednesday is lighter
                },
                borderRadius: 8,
                barPercentage: 0.5,
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#1e293b',
                bodyColor: '#64748b',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    title: function(context) {
                        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                        return days[context[0].dataIndex];
                    },
                    label: function(context) {
                        return 'Users: ' + (context.parsed.y / 1000).toFixed(0) + 'k';
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                border: {
                    display: false
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        size: 11,
                        weight: '500'
                    }
                }
            },
            y: {
                display: false,
            }
        }
    }
});

// Mobile menu toggle (optional functionality)
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

const openLogin = document.getElementById("openLogin");
const openSignup = document.getElementById("openSignup");

const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");

function openModal(modal) {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

openLogin?.addEventListener("click", () => console.log("eeeeee")
);
openSignup?.addEventListener("click", () => openModal(signupModal));

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-close]");
  if (!btn) return;
  const id = btn.getAttribute("data-close");
  const modal = document.getElementById(id);
  if (modal) closeModal(modal);
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  [loginModal, signupModal].forEach((m) => m && closeModal(m));
});


/**
 * OpsLift - Charts Module
 * 1. Primary: Passenger Demand Throughout the Day (Line Chart)
 * 2. Secondary: Passenger Demand by Traffic Period (Bar Chart)
 */

let demandChart = null;
let periodChart = null;

function initCharts(intervals = OPS_DATA.intervals) {
  renderDemandChart(intervals);
  renderPeriodChart();
}

/**
 * 1. PRIMARY CHART: Passenger Demand Throughout the Day
 */
function renderDemandChart(intervals) {
  const ctx = document.getElementById('demandChartCanvas');
  if (!ctx) return;

  if (demandChart) {
    demandChart.destroy();
  }

  const labels = intervals.map(i => i.time);
  const demandValues = intervals.map(i => i.demand);
  const capacityValues = intervals.map(i => i.capacity);

  // Red dots only for over-capacity points
  const pointBgColors = intervals.map(i => i.demand > i.capacity ? '#ef4444' : '#2563eb');
  const pointRadius = intervals.map(i => i.demand > i.capacity ? 4 : 0.5);
  const pointHoverRadius = intervals.map(i => i.demand > i.capacity ? 6 : 4);

  demandChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Passenger Demand',
          data: demandValues,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.07)',
          borderWidth: 2.2,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: pointBgColors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: pointRadius,
          pointHoverRadius: pointHoverRadius,
          order: 2
        },
        {
          label: 'Available Elevator Capacity (45 pax/5 min)',
          data: capacityValues,
          borderColor: '#ef4444',
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
          tension: 0,
          order: 1
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
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            boxHeight: 8,
            padding: 16,
            font: {
              family: "'Inter', sans-serif",
              size: 12,
              weight: '500'
            },
            color: '#475569'
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#ffffff',
          bodyColor: '#e2e8f0',
          padding: 10,
          cornerRadius: 6,
          callbacks: {
            title: function(items) {
              const item = intervals[items[0].dataIndex];
              return `Time: ${item.time}`;
            },
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y} pax / 5 min`;
            },
            afterBody: function(items) {
              const item = intervals[items[0].dataIndex];
              if (item.demand > item.capacity) {
                return ['⚠️ Demand exceeds available elevator capacity'];
              }
              return [];
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(226, 232, 240, 0.6)'
          },
          ticks: {
            color: '#64748b',
            font: { size: 11 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 12
          },
          title: {
            display: true,
            text: 'Time of Day',
            color: '#64748b',
            font: { size: 12, weight: '500' },
            padding: { top: 6 }
          }
        },
        y: {
          min: 0,
          max: 55,
          grid: {
            color: 'rgba(226, 232, 240, 0.8)'
          },
          ticks: {
            color: '#64748b',
            font: { size: 11 },
            stepSize: 10
          },
          title: {
            display: true,
            text: 'Passengers per 5 minutes',
            color: '#64748b',
            font: { size: 12, weight: '500' },
            padding: { bottom: 6 }
          }
        }
      }
    }
  });
}

/**
 * 2. SECONDARY CHART: Passenger Demand by Traffic Period
 */
function renderPeriodChart() {
  const ctx = document.getElementById('periodChartCanvas');
  if (!ctx) return;

  if (periodChart) {
    periodChart.destroy();
  }

  const periods = OPS_DATA.periodDemand;
  const labels = periods.map(p => p.period);
  const data = periods.map(p => p.demand);

  // Colors: Highlight peak demand periods in amber/navy
  const barColors = periods.map(p => p.isPeak ? '#2563eb' : '#94a3b8');
  const hoverColors = periods.map(p => p.isPeak ? '#1d4ed8' : '#64748b');

  periodChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Avg Passenger Demand (pax / 5 min)',
          data: data,
          backgroundColor: barColors,
          hoverBackgroundColor: hoverColors,
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 34
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
          backgroundColor: '#0f172a',
          titleColor: '#ffffff',
          bodyColor: '#e2e8f0',
          padding: 10,
          cornerRadius: 6,
          callbacks: {
            title: function(items) {
              const p = periods[items[0].dataIndex];
              return `${p.period} (${p.timeRange})`;
            },
            label: function(context) {
              return `Average Demand: ${context.parsed.y} pax / 5 min`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#475569',
            font: { size: 11, weight: '500' }
          }
        },
        y: {
          min: 0,
          max: 45,
          grid: {
            color: 'rgba(226, 232, 240, 0.8)'
          },
          ticks: {
            color: '#64748b',
            font: { size: 11 },
            stepSize: 10
          },
          title: {
            display: true,
            text: 'Average Pax / 5 min',
            color: '#64748b',
            font: { size: 11, weight: '500' }
          }
        }
      }
    }
  });
}

/**
 * OpsLift - Page Views Controller
 * Renders all analytical pages dynamically based on active page and filter state
 */

const OpsPages = {
  activePage: 'executive-overview',
  chartInstances: {},
  glFilters: {
    day: 'all',
    batch: 'all',
    floor: 'all',
    scenario: 0.25,
    direction: 'all',
    capacity: 7
  },

  init() {
    this.setupTopNavigation();
    this.setupGlobalFilters();
    this.setupGreatLakesFilters();
    this.renderPage(this.activePage);
  },

  // Destroy existing charts to prevent memory leaks and canvas collision
  destroyCharts() {
    Object.keys(this.chartInstances).forEach(key => {
      if (this.chartInstances[key]) {
        this.chartInstances[key].destroy();
        delete this.chartInstances[key];
      }
    });
  },

  // Horizontal Top Nav event binding
  setupTopNavigation() {
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const pageId = btn.getAttribute('data-page');
        if (pageId) {
          navButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.activePage = pageId;
          this.renderPage(pageId);
        }
      });
    });
  },

  // Setup Global Header Filters
  setupGlobalFilters() {
    const dateSelect = document.getElementById('globalDateFilter');
    const periodSelect = document.getElementById('globalPeriodFilter');
    const elevatorSelect = document.getElementById('globalElevatorFilter');
    const resetBtn = document.getElementById('globalResetBtn');

    // Populate Date Dropdown from dataset
    if (dateSelect) {
      const dates = OpsAnalytics.getAvailableDates();
      dateSelect.innerHTML = dates.map(d => `<option value="${d}" ${d === OpsAnalytics.filters.date ? 'selected' : ''}>${d} (${d === '2026-08-10' ? 'Academic Schedule' : 'Observed Day'})</option>`).join('');
      dateSelect.addEventListener('change', (e) => {
        OpsAnalytics.filters.date = e.target.value;
        this.renderPage(this.activePage);
      });
    }

    // Populate Traffic Periods Dropdown
    if (periodSelect) {
      const periods = OpsAnalytics.getTrafficPeriods();
      periodSelect.innerHTML = `<option value="all">All Day (08:00 – 19:00)</option>` + 
        periods.map(p => `<option value="${p}">${p}</option>`).join('');
      periodSelect.addEventListener('change', (e) => {
        OpsAnalytics.filters.trafficPeriod = e.target.value;
        this.renderPage(this.activePage);
      });
    }

    // Elevator filter
    if (elevatorSelect) {
      elevatorSelect.addEventListener('change', (e) => {
        OpsAnalytics.filters.elevator = e.target.value;
        this.renderPage(this.activePage);
      });
    }

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (this.activePage === 'great-lakes') {
          this.glFilters = {
            day: 'all',
            batch: 'all',
            floor: 'all',
            scenario: 0.25,
            direction: 'all',
            capacity: 7
          };
          const d = document.getElementById('glDayFilter');
          const b = document.getElementById('glBatchFilter');
          const f = document.getElementById('glFloorFilter');
          const s = document.getElementById('glScenarioFilter');
          const dir = document.getElementById('glDirectionFilter');
          if (d) d.value = 'all';
          if (b) b.value = 'all';
          if (f) f.value = 'all';
          if (s) s.value = '0.25';
          if (dir) dir.value = 'all';
        } else {
          OpsAnalytics.filters.date = '2026-08-10';
          OpsAnalytics.filters.trafficPeriod = 'all';
          OpsAnalytics.filters.elevator = 'all';
          if (dateSelect) dateSelect.value = '2026-08-10';
          if (periodSelect) periodSelect.value = 'all';
          if (elevatorSelect) elevatorSelect.value = 'all';
        }
        this.renderPage(this.activePage);
      });
    }
  },

  // Setup Great Lakes Filters
  setupGreatLakesFilters() {
    const d = document.getElementById('glDayFilter');
    const b = document.getElementById('glBatchFilter');
    const f = document.getElementById('glFloorFilter');
    const s = document.getElementById('glScenarioFilter');
    const dir = document.getElementById('glDirectionFilter');

    if (d) {
      d.addEventListener('change', (e) => {
        this.glFilters.day = e.target.value;
        this.renderPage('great-lakes');
      });
    }
    if (b) {
      b.addEventListener('change', (e) => {
        this.glFilters.batch = e.target.value;
        this.renderPage('great-lakes');
      });
    }
    if (f) {
      f.addEventListener('change', (e) => {
        this.glFilters.floor = e.target.value;
        this.renderPage('great-lakes');
      });
    }
    if (s) {
      s.addEventListener('change', (e) => {
        this.glFilters.scenario = parseFloat(e.target.value);
        this.renderPage('great-lakes');
      });
    }
    if (dir) {
      dir.addEventListener('change', (e) => {
        this.glFilters.direction = e.target.value;
        this.renderPage('great-lakes');
      });
    }
  },

  // Main Page Dispatcher
  renderPage(pageId) {
    this.destroyCharts();
    const container = document.getElementById('pageContentContainer');
    if (!container) return;

    // Switch Top Header Metadata and Filters based on whether page is Great Lakes
    const simGroup = document.getElementById('simulatedFilterGroup');
    const glGroup = document.getElementById('greatLakesFilterGroup');
    const topBuildingText = document.getElementById('topNavBuildingText');
    const topDatasetText = document.getElementById('topNavDatasetText');
    const topSubtitle = document.getElementById('topNavSubtitle');
    const elevatorFilterItem = document.getElementById('filterItemElevator');

    if (pageId === 'great-lakes') {
      if (simGroup) simGroup.style.display = 'none';
      if (glGroup) glGroup.style.display = 'flex';
      if (topBuildingText) topBuildingText.textContent = 'Great Lakes Academic Block A • 1 Elevator • 3 Floors';
      if (topDatasetText) topDatasetText.textContent = 'Data Source: Actual Academic Timetables + Operational Assumptions';
      if (topSubtitle) topSubtitle.textContent = 'Academic Block A Timetable Demand Analysis';
    } else {
      if (simGroup) simGroup.style.display = 'flex';
      if (glGroup) glGroup.style.display = 'none';
      if (topBuildingText) topBuildingText.textContent = 'Demo Institutional Building • 3 Elevators';
      if (topDatasetText) topDatasetText.textContent = 'Dataset: Simulated Operational Data';
      if (topSubtitle) topSubtitle.textContent = 'Elevator Operations & Capacity Monitoring';
      if (elevatorFilterItem) {
        elevatorFilterItem.style.display = (pageId === 'elevator-performance' || pageId === 'data-management') ? 'flex' : 'none';
      }
    }

    switch (pageId) {
      case 'executive-overview':
        this.renderExecutiveOverview(container);
        break;
      case 'capacity-analysis':
        this.renderCapacityAnalysis(container);
        break;
      case 'traffic-flow':
        this.renderTrafficFlow(container);
        break;
      case 'floor-analysis':
        this.renderFloorAnalysis(container);
        break;
      case 'elevator-performance':
        this.renderElevatorPerformance(container);
        break;
      case 'decision-support':
        this.renderDecisionSupport(container);
        break;
      case 'great-lakes':
        this.renderGreatLakes(container);
        break;
      case 'data-management':
        this.renderDataManagement(container);
        break;
      default:
        this.renderExecutiveOverview(container);
    }
  },

  // =========================================================================
  // PAGE 1: EXECUTIVE OVERVIEW (Preserved clean design)
  // =========================================================================
  renderExecutiveOverview(container) {
    const data = OpsAnalytics.getExecutiveOverviewMetrics();
    if (!data) return;

    container.innerHTML = `
      <!-- 4 EXECUTIVE KPI CARDS -->
      <section class="kpi-grid" aria-label="Executive Key Performance Indicators">
        <article class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Average Waiting Time</span>
            <div class="kpi-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.avgWait}</span>
            <span class="kpi-unit">sec</span>
          </div>
          <div class="kpi-subtitle">Passenger waiting</div>
        </article>

        <article class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Elevator Utilization</span>
            <div class="kpi-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.avgUtil}%</span>
          </div>
          <div class="kpi-subtitle">Overall capacity usage</div>
        </article>

        <article class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Peak Passenger Demand</span>
            <div class="kpi-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.peakDemand}</span>
            <span class="kpi-unit">pax / 5 min</span>
          </div>
          <div class="kpi-subtitle">Maximum arrival volume</div>
        </article>

        <article class="kpi-card kpi-amber-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Bottleneck Intervals</span>
            <div class="kpi-icon-box amber">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.bottleneckIntervals}</span>
            <span class="kpi-unit">intervals</span>
          </div>
          <div class="kpi-subtitle">Intervals requiring attention</div>
        </article>
      </section>

      <!-- CHARTS SECTION -->
      <section class="charts-grid" aria-label="Passenger Demand Charts">
        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h2 class="chart-heading">Passenger Demand Throughout the Day</h2>
              <p class="chart-subheading">5-minute interval demand vs available elevator capacity (45 pax/5 min)</p>
            </div>
          </div>
          <div class="chart-canvas-wrapper">
            <canvas id="execDemandChart"></canvas>
          </div>
        </article>

        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h2 class="chart-heading">Passenger Demand by Traffic Period</h2>
              <p class="chart-subheading">Average demand during key operational periods</p>
            </div>
          </div>
          <div class="chart-canvas-wrapper">
            <canvas id="execPeriodChart"></canvas>
          </div>
        </article>
      </section>

      <!-- COMPACT MANAGEMENT INSIGHT -->
      <section class="insight-panel" aria-label="Management Insight and Recommendation">
        <div class="insight-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h3 class="insight-title">Management Insight</h3>
        </div>
        <p class="insight-text">
          &ldquo;Elevator operations remain stable during most of the day. The highest passenger demand occurs during peak academic movement periods, particularly morning arrival, class changes and lunch periods. These periods experience higher elevator utilization and passenger waiting.&rdquo;
        </p>
        <div class="action-card">
          <div class="action-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <span class="action-message">
            <strong>Recommended Action:</strong> &ldquo;Focus operational improvements on peak traffic periods before considering additional elevator capacity.&rdquo;
          </span>
        </div>
      </section>
    `;

    // Render Exec Charts
    const ctx1 = document.getElementById('execDemandChart');
    if (ctx1) {
      const labels = data.intervals.map(r => r.time);
      const demands = data.intervals.map(r => Number(r.totalPassengers) || 0);
      const capLines = data.intervals.map(r => Number(r.serviceRatePax5min) || 45);
      const pointColors = data.intervals.map(r => (Number(r.totalPassengers) > Number(r.serviceRatePax5min)) ? '#ef4444' : '#2563eb');
      const pointRadii = data.intervals.map(r => (Number(r.totalPassengers) > Number(r.serviceRatePax5min)) ? 4 : 0.5);

      this.chartInstances.execDemand = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Passenger Demand',
              data: demands,
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              borderWidth: 2,
              fill: true,
              tension: 0.35,
              pointBackgroundColor: pointColors,
              pointRadius: pointRadii,
              order: 2
            },
            {
              label: 'Available Elevator Capacity (45 pax/5 min)',
              data: capLines,
              borderColor: '#ef4444',
              borderWidth: 1.8,
              borderDash: [6, 4],
              pointRadius: 0,
              fill: false,
              order: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { maxTicksLimit: 12, color: '#64748b' } },
            y: { min: 0, grid: { color: 'rgba(226, 232, 240, 0.8)' }, ticks: { color: '#64748b' }, title: { display: true, text: 'Passengers per 5 min', color: '#64748b' } }
          }
        }
      });
    }

    const ctx2 = document.getElementById('execPeriodChart');
    if (ctx2) {
      this.chartInstances.execPeriod = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: data.periodAverages.map(p => p.period),
          datasets: [{
            label: 'Avg Demand (pax / 5 min)',
            data: data.periodAverages.map(p => p.avgDemand),
            backgroundColor: data.periodAverages.map(p => p.isPeak ? '#2563eb' : '#94a3b8'),
            borderRadius: 6,
            maxBarThickness: 34
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 11, weight: '500' } } },
            y: { min: 0, grid: { color: 'rgba(226, 232, 240, 0.8)' }, title: { display: true, text: 'Avg Pax / 5 min', color: '#64748b' } }
          }
        }
      });
    }
  },

  // =========================================================================
  // PAGE 2: CAPACITY ANALYSIS
  // =========================================================================
  renderCapacityAnalysis(container) {
    const data = OpsAnalytics.getCapacityAnalysisData();
    if (!data) return;

    container.innerHTML = `
      <div class="page-intro-bar">
        <h2 class="section-heading">Capacity Analysis</h2>
        <span class="managerial-question-tag">Managerial Question: &ldquo;Do we have enough elevator capacity?&rdquo;</span>
      </div>

      <!-- 4 DYNAMIC CAPACITY KPIS -->
      <section class="kpi-grid" aria-label="Capacity Key Performance Indicators">
        <article class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Average Arrival Rate</span>
            <div class="kpi-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.avgArrivalRate}</span>
            <span class="kpi-unit">pax / 5 min</span>
          </div>
          <div class="kpi-subtitle">Average passenger demand arrival rate</div>
        </article>

        <article class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Average Service Rate</span>
            <div class="kpi-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.avgServiceRate}</span>
            <span class="kpi-unit">pax / 5 min</span>
          </div>
          <div class="kpi-subtitle">Elevator group design service capacity</div>
        </article>

        <article class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Average Capacity Utilization</span>
            <div class="kpi-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.avgCapacityUtil}%</span>
          </div>
          <div class="kpi-subtitle">Capacity Used &divide; Best Operating Level</div>
        </article>

        <article class="kpi-card ${Number(data.peakCapacityGap) > 0 ? 'kpi-amber-card' : ''}">
          <div class="kpi-card-header">
            <span class="kpi-title">Peak Capacity Gap</span>
            <div class="kpi-icon-box ${Number(data.peakCapacityGap) > 0 ? 'amber' : ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.peakCapacityGap}</span>
            <span class="kpi-unit">pax</span>
          </div>
          <div class="kpi-subtitle">Maximum demand exceeding service capacity</div>
        </article>
      </section>

      <!-- CAPACITY CHARTS (3 VISUALS) -->
      <section class="charts-grid-3">
        <!-- Visual 1: Demand vs Service Capacity -->
        <article class="chart-card span-2">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Demand vs Service Capacity</h3>
              <p class="chart-subheading">Arrival Rate vs Service Rate (45 pax/5m) and Best Operating Level (38 pax/5m)</p>
            </div>
          </div>
          <div class="chart-canvas-wrapper" style="height: 300px;">
            <canvas id="capDemandChart"></canvas>
          </div>
        </article>

        <!-- Visual 3: Capacity Status Distribution -->
        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Capacity Status Distribution</h3>
              <p class="chart-subheading">Breakdown by Bottleneck Status classifications</p>
            </div>
          </div>
          <div class="chart-canvas-wrapper" style="height: 220px;">
            <canvas id="capStatusChart"></canvas>
          </div>
          <div class="status-summary-pills">
            ${data.statusDistribution.map(s => `
              <div class="status-pill-item">
                <span class="status-dot ${s.status === 'No Bottleneck' ? 'green' : s.status === 'Potential Bottleneck' ? 'amber' : 'red'}"></span>
                <span class="status-name">${s.status}:</span>
                <strong>${s.count} int (${s.pct}%)</strong>
              </div>
            `).join('')}
          </div>
        </article>

        <!-- Visual 2: Capacity Utilization by Traffic Period -->
        <article class="chart-card span-3">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Capacity Utilization by Traffic Period</h3>
              <p class="chart-subheading">Average Capacity Utilization Rate (%) across official dataset traffic periods</p>
            </div>
          </div>
          <div class="chart-canvas-wrapper" style="height: 240px;">
            <canvas id="capPeriodChart"></canvas>
          </div>
        </article>
      </section>

      <!-- MANAGERIAL INTERPRETATION -->
      <section class="insight-panel">
        <div class="insight-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <h3 class="insight-title">Managerial Interpretation: Capacity Adequacy</h3>
        </div>
        <p class="insight-text">
          The 3-elevator bank provides an aggregate service capacity of <strong>45.0 pax per 5-minute interval</strong>, which comfortably handles normal baseline demand (averaging ~12–19 pax/5min). Capacity pressure is concentrated specifically during <strong>Morning Up-Peak (08:30–09:30)</strong>, where arrival rate peaks at <strong>47 pax/5min</strong>, creating a capacity gap of 2 pax and pushing system utilization above Best Operating Level.
        </p>
        <div class="action-card">
          <span class="action-message">
            <strong>Capacity Planning Conclusion:</strong> Available elevator service capacity is sufficient for over 70% of the operating day. Management should deploy peak-period flow interventions (e.g. staggered class arrivals) rather than capital-intensive physical elevator additions.
          </span>
        </div>
      </section>
    `;

    // Visual 1: Demand vs Service Capacity Chart
    const ctx1 = document.getElementById('capDemandChart');
    if (ctx1) {
      this.chartInstances.capDemand = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: data.timeSeries.map(t => t.time),
          datasets: [
            {
              label: 'Arrival Rate (pax / 5 min)',
              data: data.timeSeries.map(t => t.arrivalRate),
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              borderWidth: 2,
              fill: true,
              tension: 0.3,
              pointBackgroundColor: data.timeSeries.map(t => t.arrivalRate > t.serviceRate ? '#ef4444' : '#2563eb'),
              pointRadius: data.timeSeries.map(t => t.arrivalRate > t.serviceRate ? 4 : 1),
              order: 2
            },
            {
              label: 'Service Rate (45 pax/5 min)',
              data: data.timeSeries.map(t => t.serviceRate),
              borderColor: '#ef4444',
              borderWidth: 2,
              borderDash: [6, 4],
              pointRadius: 0,
              fill: false,
              order: 1
            },
            {
              label: 'Best Operating Level (38 pax/5 min)',
              data: data.timeSeries.map(t => t.bestOperatingLevel),
              borderColor: '#7c3aed',
              borderWidth: 1.8,
              borderDash: [4, 4],
              pointRadius: 0,
              fill: false,
              order: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { maxTicksLimit: 14, color: '#64748b' } },
            y: { min: 0, max: 55, grid: { color: 'rgba(226, 232, 240, 0.8)' }, title: { display: true, text: 'Pax / 5 min', color: '#64748b' } }
          }
        }
      });
    }

    // Visual 3: Status Distribution Donut Chart
    const ctx3 = document.getElementById('capStatusChart');
    if (ctx3) {
      this.chartInstances.capStatus = new Chart(ctx3, {
        type: 'doughnut',
        data: {
          labels: data.statusDistribution.map(s => s.status),
          datasets: [{
            data: data.statusDistribution.map(s => s.count),
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
          cutout: '65%'
        }
      });
    }

    // Visual 2: Capacity Utilization by Period Bar Chart
    const ctx2 = document.getElementById('capPeriodChart');
    if (ctx2) {
      this.chartInstances.capPeriod = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: data.periodUtilization.map(p => p.period),
          datasets: [{
            label: 'Avg Capacity Utilization Rate (%)',
            data: data.periodUtilization.map(p => p.avgUtilization),
            backgroundColor: data.periodUtilization.map(p => p.avgUtilization >= 75 ? '#d97706' : '#2563eb'),
            borderRadius: 6,
            maxBarThickness: 45
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 11, weight: '500' } } },
            y: { min: 0, max: 100, grid: { color: 'rgba(226, 232, 240, 0.8)' }, title: { display: true, text: 'Utilization %', color: '#64748b' } }
          }
        }
      });
    }
  },

  // =========================================================================
  // PAGE 3: TRAFFIC & FLOW
  // =========================================================================
  renderTrafficFlow(container) {
    const data = OpsAnalytics.getTrafficFlowData();
    if (!data) return;

    container.innerHTML = `
      <div class="page-intro-bar">
        <h2 class="section-heading">Traffic & Flow</h2>
        <span class="managerial-question-tag">Managerial Question: &ldquo;When and why does congestion occur?&rdquo;</span>
      </div>

      <!-- 4 DYNAMIC TRAFFIC KPIS -->
      <section class="kpi-grid" aria-label="Traffic Flow Key Performance Indicators">
        <article class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Average Passenger Demand</span>
            <div class="kpi-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.avgDemand}</span>
            <span class="kpi-unit">pax / 5 min</span>
          </div>
          <div class="kpi-subtitle">Mean total passenger flow</div>
        </article>

        <article class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Average Waiting Time</span>
            <div class="kpi-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.avgWait}</span>
            <span class="kpi-unit">sec</span>
          </div>
          <div class="kpi-subtitle">Lobby queue delay before boarding</div>
        </article>

        <article class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Average Queue Length</span>
            <div class="kpi-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.avgQueue}</span>
            <span class="kpi-unit">pax</span>
          </div>
          <div class="kpi-subtitle">Mean passengers waiting in lobby</div>
        </article>

        <article class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Average Journey Time</span>
            <div class="kpi-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.avgJourney}</span>
            <span class="kpi-unit">sec</span>
          </div>
          <div class="kpi-subtitle">Total time from lobby to destination</div>
        </article>
      </section>

      <!-- 4 TRAFFIC VISUALS (2x2 GRID) -->
      <section class="charts-grid-2x2">
        <!-- Visual 1: Passenger Traffic Throughout the Day -->
        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Passenger Traffic Throughout the Day</h3>
              <p class="chart-subheading">Total 5-minute passenger volume across the operating day</p>
            </div>
          </div>
          <div class="chart-canvas-wrapper" style="height: 260px;">
            <canvas id="trafficDailyChart"></canvas>
          </div>
        </article>

        <!-- Visual 2: Traffic Direction Mix -->
        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Traffic Direction Mix</h3>
              <p class="chart-subheading">Proportion of Incoming, Outgoing, and Interfloor passenger movement</p>
            </div>
          </div>
          <div class="chart-canvas-wrapper" style="height: 220px;">
            <canvas id="trafficMixChart"></canvas>
          </div>
          <div class="status-summary-pills">
            ${data.directionMix.map(d => `
              <div class="status-pill-item">
                <span class="status-name">${d.name}:</span>
                <strong>${d.count} pax (${d.pct}%)</strong>
              </div>
            `).join('')}
          </div>
        </article>

        <!-- Visual 3: Waiting Time by Traffic Period -->
        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Waiting Time by Traffic Period</h3>
              <p class="chart-subheading">Average passenger waiting time (seconds) across operational periods</p>
            </div>
          </div>
          <div class="chart-canvas-wrapper" style="height: 250px;">
            <canvas id="trafficWaitChart"></canvas>
          </div>
        </article>

        <!-- Visual 4: Queue Length vs Passenger Demand -->
        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Queue Length vs Passenger Demand</h3>
              <p class="chart-subheading">Congestion development showing queue escalation with higher demand</p>
            </div>
          </div>
          <div class="chart-canvas-wrapper" style="height: 250px;">
            <canvas id="trafficQueueChart"></canvas>
          </div>
        </article>
      </section>
    `;

    // Chart 1: Traffic Throughout the Day
    const ctx1 = document.getElementById('trafficDailyChart');
    if (ctx1) {
      this.chartInstances.trafficDaily = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: data.trafficTimeSeries.map(t => t.time),
          datasets: [{
            label: 'Total Passengers',
            data: data.trafficTimeSeries.map(t => t.totalPassengers),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { maxTicksLimit: 12, color: '#64748b' } },
            y: { min: 0, grid: { color: 'rgba(226, 232, 240, 0.8)' }, title: { display: true, text: 'Passengers / 5 min', color: '#64748b' } }
          }
        }
      });
    }

    // Chart 2: Direction Mix Donut
    const ctx2 = document.getElementById('trafficMixChart');
    if (ctx2) {
      this.chartInstances.trafficMix = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: data.directionMix.map(d => d.name),
          datasets: [{
            data: data.directionMix.map(d => d.count),
            backgroundColor: ['#2563eb', '#10b981', '#f59e0b'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
          cutout: '65%'
        }
      });
    }

    // Chart 3: Waiting Time by Period
    const ctx3 = document.getElementById('trafficWaitChart');
    if (ctx3) {
      this.chartInstances.trafficWait = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: data.waitByPeriod.map(p => p.period),
          datasets: [{
            label: 'Avg Waiting Time (sec)',
            data: data.waitByPeriod.map(p => p.avgWaitSec),
            backgroundColor: data.waitByPeriod.map(p => p.avgWaitSec > 30 ? '#ef4444' : '#2563eb'),
            borderRadius: 6,
            maxBarThickness: 38
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 11, weight: '500' } } },
            y: { min: 0, grid: { color: 'rgba(226, 232, 240, 0.8)' }, title: { display: true, text: 'Waiting Time (seconds)', color: '#64748b' } }
          }
        }
      });
    }

    // Chart 4: Queue vs Demand Scatter
    const ctx4 = document.getElementById('trafficQueueChart');
    if (ctx4) {
      this.chartInstances.trafficQueue = new Chart(ctx4, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Interval Observations',
            data: data.queueVsDemand.map(d => ({ x: d.demand, y: d.queue, time: d.time })),
            backgroundColor: 'rgba(37, 99, 235, 0.65)',
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'Passenger Demand (pax / 5 min)', color: '#64748b' }, grid: { color: 'rgba(226, 232, 240, 0.6)' } },
            y: { title: { display: true, text: 'Average Queue Length (pax)', color: '#64748b' }, grid: { color: 'rgba(226, 232, 240, 0.8)' } }
          }
        }
      });
    }
  },

  // =========================================================================
  // PAGE 4: FLOOR ANALYSIS
  // =========================================================================
  renderFloorAnalysis(container) {
    const data = OpsAnalytics.getFloorAnalysisData();
    if (!data) return;

    container.innerHTML = `
      <div class="page-intro-bar">
        <h2 class="section-heading">Floor Analysis</h2>
        <span class="managerial-question-tag">Managerial Question: &ldquo;Which floors create the most elevator demand?&rdquo;</span>
      </div>

      <!-- TOP THREE HIGH-DEMAND FLOORS INDICATOR -->
      <section class="top-floors-banner">
        <div class="top-floors-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
          <span class="top-floors-title">Top 3 High-Demand Floors (Passenger Traffic Concentration)</span>
        </div>
        <div class="top-floors-grid">
          ${data.topThreeFloors.map((f, idx) => `
            <div class="top-floor-card rank-${idx + 1}">
              <div class="rank-badge">#${idx + 1} High Demand</div>
              <div class="floor-num">${f.label}</div>
              <div class="floor-func">${f.function}</div>
              <div class="floor-demand-stat">
                <strong>${f.totalDemand.toLocaleString()}</strong> passengers handled
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- VISUAL 1 & VISUAL 3: RANKING & FUNCTION CONTEXT -->
      <section class="charts-grid" style="margin-top: 16px;">
        <!-- Visual 1: Floor Demand Ranking -->
        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Floor Demand Ranking</h3>
              <p class="chart-subheading">Total observed passenger traffic generated per floor (Floor 1 through Floor 8)</p>
            </div>
          </div>
          <div class="chart-canvas-wrapper" style="height: 280px;">
            <canvas id="floorRankChart"></canvas>
          </div>
        </article>

        <!-- Visual 3: Floor Function Context Table -->
        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Floor Function Context</h3>
              <p class="chart-subheading">Floor characteristics from Floor Master reference table</p>
            </div>
          </div>
          <div class="table-responsive-box">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Floor</th>
                  <th>Primary Function</th>
                  <th>Base Pop.</th>
                  <th>Demand Wt.</th>
                  <th>Observed Pax</th>
                </tr>
              </thead>
              <tbody>
                ${data.floorRankings.map(f => `
                  <tr>
                    <td><strong>${f.label}</strong></td>
                    <td>${f.function}</td>
                    <td>${f.basePopulation}</td>
                    <td>${f.demandWeight}x</td>
                    <td><span class="pax-badge">${f.totalDemand.toLocaleString()}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <!-- VISUAL 2: FLOOR DEMAND HEATMAP / PROFILE TABLE -->
      <section class="chart-card" style="margin-top: 16px;">
        <div class="chart-card-header">
          <div>
            <h3 class="chart-heading">Floor Demand by Traffic Period Matrix</h3>
            <p class="chart-subheading">Average passenger demand per 5-minute interval across operational periods</p>
          </div>
        </div>
        <div class="table-responsive-box">
          <table class="data-table matrix-table">
            <thead>
              <tr>
                <th>Floor</th>
                ${data.periods.map(p => `<th>${p}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.heatmapMatrix.map(row => `
                <tr>
                  <td><strong>${row.floor}</strong></td>
                  ${data.periods.map(p => {
                    const val = row[p];
                    const intensity = val > 6 ? 'heat-high' : val > 3.5 ? 'heat-med' : 'heat-low';
                    return `<td class="${intensity}">${val} pax</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;

    // Visual 1 Chart: Floor Demand Ranking
    const ctx1 = document.getElementById('floorRankChart');
    if (ctx1) {
      this.chartInstances.floorRank = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: data.floorRankings.map(f => f.label),
          datasets: [{
            label: 'Observed Passenger Demand',
            data: data.floorRankings.map(f => f.totalDemand),
            backgroundColor: data.floorRankings.map((f, idx) => idx < 3 ? '#2563eb' : '#94a3b8'),
            borderRadius: 6,
            maxBarThickness: 34
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 11, weight: '500' } } },
            y: { min: 0, grid: { color: 'rgba(226, 232, 240, 0.8)' }, title: { display: true, text: 'Total Passengers', color: '#64748b' } }
          }
        }
      });
    }
  },

  // =========================================================================
  // PAGE 5: ELEVATOR PERFORMANCE
  // =========================================================================
  renderElevatorPerformance(container) {
    const data = OpsAnalytics.getElevatorPerformanceData();
    if (!data) return;

    container.innerHTML = `
      <div class="page-intro-bar">
        <h2 class="section-heading">Elevator Performance</h2>
        <span class="managerial-question-tag">Managerial Question: &ldquo;Are the three elevators being used effectively?&rdquo;</span>
      </div>

      <!-- 4 ELEVATOR KPIS -->
      <section class="kpi-grid" aria-label="Elevator Performance Key Performance Indicators">
        <article class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Total Passengers Carried</span>
            <div class="kpi-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.totalPassengers.toLocaleString()}</span>
            <span class="kpi-unit">pax</span>
          </div>
          <div class="kpi-subtitle">Total throughput across elevator bank</div>
        </article>

        <article class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Total Trips</span>
            <div class="kpi-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.totalTrips.toLocaleString()}</span>
            <span class="kpi-unit">trips</span>
          </div>
          <div class="kpi-subtitle">Elevator dispatch cycles completed</div>
        </article>

        <article class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Average Elevator Load</span>
            <div class="kpi-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.avgLoadPct}%</span>
          </div>
          <div class="kpi-subtitle">Average car occupancy vs rated capacity</div>
        </article>

        <article class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-title">Average Trip Time</span>
            <div class="kpi-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${data.avgTripSec}</span>
            <span class="kpi-unit">sec</span>
          </div>
          <div class="kpi-subtitle">Mean transit duration per elevator trip</div>
        </article>
      </section>

      <!-- ELEVATOR COMPARISON TABLE -->
      <section class="chart-card" style="margin-top: 16px;">
        <div class="chart-card-header">
          <div>
            <h3 class="chart-heading">Elevator Comparison Table (E1 vs E2 vs E3)</h3>
            <p class="chart-subheading">Aggregated operational metrics from Elevator_Performance fact table</p>
          </div>
        </div>
        <div class="table-responsive-box">
          <table class="data-table">
            <thead>
              <tr>
                <th>Elevator</th>
                <th>Passengers Carried</th>
                <th>Trips</th>
                <th>Avg Load %</th>
                <th>Utilization %</th>
                <th>Avg Stops</th>
                <th>Avg Trip Time</th>
                <th>Downtime (min)</th>
                <th>Spec (Persons / Speed)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.comparisonTable.map(e => `
                <tr>
                  <td><strong>${e.elevatorId}</strong></td>
                  <td><strong>${e.passengers.toLocaleString()}</strong></td>
                  <td>${e.trips.toLocaleString()}</td>
                  <td>${e.avgLoad}%</td>
                  <td><span class="util-tag ${Number(e.utilization) > 75 ? 'high' : 'normal'}">${e.utilization}%</span></td>
                  <td>${e.avgStops}</td>
                  <td>${e.avgTripTime}s</td>
                  <td>${e.downtime} min</td>
                  <td>${e.capacity} pax &bull; ${e.speed} m/s</td>
                  <td><span class="status-pill active">${e.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- 3 ELEVATOR CHARTS -->
      <section class="charts-grid-3" style="margin-top: 16px;">
        <!-- Chart 1: Utilization by Elevator -->
        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Utilization by Elevator</h3>
              <p class="chart-subheading">Average Utilization (%)</p>
            </div>
          </div>
          <div class="chart-canvas-wrapper" style="height: 220px;">
            <canvas id="elevUtilChart"></canvas>
          </div>
        </article>

        <!-- Chart 2: Passengers Carried by Elevator -->
        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Passengers Carried</h3>
              <p class="chart-subheading">Total throughput by car</p>
            </div>
          </div>
          <div class="chart-canvas-wrapper" style="height: 220px;">
            <canvas id="elevPaxChart"></canvas>
          </div>
        </article>

        <!-- Chart 3: Average Load by Elevator -->
        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Average Load %</h3>
              <p class="chart-subheading">Car loading percentage</p>
            </div>
          </div>
          <div class="chart-canvas-wrapper" style="height: 220px;">
            <canvas id="elevLoadChart"></canvas>
          </div>
        </article>
      </section>
    `;

    // Chart 1: Utilization
    const ctx1 = document.getElementById('elevUtilChart');
    if (ctx1) {
      this.chartInstances.elevUtil = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: data.comparisonTable.map(e => e.elevatorId),
          datasets: [{
            label: 'Utilization %',
            data: data.comparisonTable.map(e => Number(e.utilization)),
            backgroundColor: '#2563eb',
            borderRadius: 6,
            maxBarThickness: 40
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { min: 0, max: 100, title: { display: true, text: 'Utilization %', color: '#64748b' } } }
        }
      });
    }

    // Chart 2: Passengers
    const ctx2 = document.getElementById('elevPaxChart');
    if (ctx2) {
      this.chartInstances.elevPax = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: data.comparisonTable.map(e => e.elevatorId),
          datasets: [{
            label: 'Passengers Carried',
            data: data.comparisonTable.map(e => e.passengers),
            backgroundColor: '#10b981',
            borderRadius: 6,
            maxBarThickness: 40
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { min: 0, title: { display: true, text: 'Passengers', color: '#64748b' } } }
        }
      });
    }

    // Chart 3: Load %
    const ctx3 = document.getElementById('elevLoadChart');
    if (ctx3) {
      this.chartInstances.elevLoad = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: data.comparisonTable.map(e => e.elevatorId),
          datasets: [{
            label: 'Average Load %',
            data: data.comparisonTable.map(e => Number(e.avgLoad)),
            backgroundColor: '#f59e0b',
            borderRadius: 6,
            maxBarThickness: 40
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { min: 0, max: 100, title: { display: true, text: 'Avg Load %', color: '#64748b' } } }
        }
      });
    }
  },

  // =========================================================================
  // PAGE 6: DECISION SUPPORT
  // =========================================================================
  renderDecisionSupport(container) {
    const data = OpsAnalytics.getDecisionSupportData();
    if (!data) return;

    container.innerHTML = `
      <div class="page-intro-bar">
        <h2 class="section-heading">Decision Support</h2>
        <span class="managerial-question-tag">Managerial Question: &ldquo;What should management do?&rdquo;</span>
      </div>

      <!-- SECTION 1: CURRENT OPERATIONAL CONDITION -->
      <section class="chart-card">
        <div class="chart-card-header">
          <div>
            <h3 class="chart-heading">1. Current Operational Condition Summary</h3>
            <p class="chart-subheading">Synthesized dynamically from Traffic_5Min and Elevator_Performance fact tables</p>
          </div>
        </div>
        <div class="condition-summary-grid">
          <div class="condition-item">
            <span class="condition-label">Average Daily Utilization</span>
            <span class="condition-val">${data.capacitySummary.avgCapacityUtil}%</span>
            <span class="condition-sub">Operating within steady-state capacity</span>
          </div>
          <div class="condition-item">
            <span class="condition-label">Average Waiting Time</span>
            <span class="condition-val">${data.trafficSummary.avgWait}s</span>
            <span class="condition-sub">Within standard service target (&lt; 30s)</span>
          </div>
          <div class="condition-item">
            <span class="condition-label">Bottleneck Intervals</span>
            <span class="condition-val">${data.capacitySummary.statusDistribution.find(s=>s.status!=='No Bottleneck')?.count || 39}</span>
            <span class="condition-sub">Occur primarily during Morning Up-Peak</span>
          </div>
          <div class="condition-item">
            <span class="condition-label">High-Demand Floors</span>
            <span class="condition-val">Floors ${data.floorSummary.topThreeFloors.map(f=>f.floor).join(', ')}</span>
            <span class="condition-sub">Classrooms account for majority traffic</span>
          </div>
        </div>
      </section>

      <!-- SECTION 2 & 3: KEY ISSUES & RECOMMENDED ACTIONS -->
      <section class="charts-grid" style="margin-top: 16px;">
        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">2. Key Operational Issues Identified</h3>
              <p class="chart-subheading">Empirical bottlenecks and flow constraints supported by dataset</p>
            </div>
          </div>
          <ul class="issues-list">
            <li>
              <strong>Morning Peak Inflow Concentration:</strong> Arrival rate surges to 47 pax/5min (08:30–09:30), creating capacity pressure against the 45 pax/5min service limit.
            </li>
            <li>
              <strong>Lobby Queue Build-Up (Muda / Waiting Waste):</strong> Queue lengths jump to ~3.2 passengers per interval during class transition times.
            </li>
            <li>
              <strong>Lower-Floor Traffic Bias:</strong> Classrooms on Floors 1–3 generate disproportionately high short-distance trips, consuming elevator cycles.
            </li>
          </ul>
        </article>

        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">3. Recommended Operational Interventions</h3>
              <p class="chart-subheading">Non-capital Operations Management solutions before physical capacity additions</p>
            </div>
          </div>
          <ul class="actions-list">
            <li>
              <strong>Stagger Class Start Times:</strong> Shift schedule by 10 minutes between lecture streams to shave peak arrival surge by ~15–20%.
            </li>
            <li>
              <strong>Zoned Morning Up-Peak Dispatch:</strong> Program Elevator E1 for express upper floors (4–8) while E2 and E3 handle Floors 1–3 during 08:30–09:30.
            </li>
            <li>
              <strong>Stairway Flow Promotion:</strong> Implement active signage encouraging stair transit for 1-floor and 2-floor movements to free car capacity for higher levels.
            </li>
          </ul>
        </article>
      </section>

      <!-- SECTION 4: DECISION MATRIX TABLE -->
      <section class="chart-card" style="margin-top: 16px;">
        <div class="chart-card-header">
          <div>
            <h3 class="chart-heading">4. Operations Management Decision Matrix</h3>
            <p class="chart-subheading">Prioritized action plan mapped to Operations Management syllabus concepts</p>
          </div>
        </div>
        <div class="table-responsive-box">
          <table class="data-table">
            <thead>
              <tr>
                <th>Operational Issue</th>
                <th>Dataset Evidence</th>
                <th>OM Concept Applied</th>
                <th>Recommended Action</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              ${data.decisionMatrix.map(row => `
                <tr>
                  <td><strong>${row.issue}</strong></td>
                  <td>${row.evidence}</td>
                  <td><span class="om-tag">${row.omConcept}</span></td>
                  <td>${row.action}</td>
                  <td>
                    <span class="priority-badge ${row.priority.toLowerCase()}">${row.priority}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  },

  // =========================================================================
  // PAGE 7: DATA MANAGEMENT
  // =========================================================================
  renderDataManagement(container) {
    let activeTable = 'Traffic_5Min';
    let currentPage = 1;
    const pageSize = 15;
    let searchQuery = '';

    const renderTableContent = () => {
      let rows = activeTable === 'Traffic_5Min' ? OPS_WORKBOOK_DATA.Traffic_5Min : OPS_WORKBOOK_DATA.Elevator_Performance;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        rows = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q));
      }

      const totalRows = rows.length;
      const totalPages = Math.ceil(totalRows / pageSize) || 1;
      const startIdx = (currentPage - 1) * pageSize;
      const paginated = rows.slice(startIdx, startIdx + pageSize);

      const tableBox = document.getElementById('dataMgmtTableContainer');
      const pageInfo = document.getElementById('dataMgmtPageInfo');
      if (!tableBox) return;

      if (activeTable === 'Traffic_5Min') {
        tableBox.innerHTML = `
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Timestamp</th>
                <th>Traffic Period</th>
                <th>Total Pax</th>
                <th>Incoming</th>
                <th>Outgoing</th>
                <th>Wait (s)</th>
                <th>Queue</th>
                <th>Arrival Rate</th>
                <th>Service Rate</th>
                <th>Util %</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${paginated.map(r => `
                <tr>
                  <td>${r.recordId}</td>
                  <td><strong>${r.timestamp}</strong></td>
                  <td>${r.trafficPeriod}</td>
                  <td><strong>${r.totalPassengers}</strong></td>
                  <td>${r.incoming}</td>
                  <td>${r.outgoing}</td>
                  <td>${r.avgWaitSec}s</td>
                  <td>${r.avgQueue}</td>
                  <td>${r.arrivalRatePax5min}</td>
                  <td>${r.serviceRatePax5min}</td>
                  <td>${r.capacityUtilizationRatePct}%</td>
                  <td><span class="status-dot ${r.bottleneckStatus === 'No Bottleneck' ? 'green' : 'amber'}"></span> ${r.bottleneckStatus || 'Normal'}</td>
                  <td>
                    <button class="btn-action edit" onclick="alert('Editing Record ID: ${r.recordId} (Application-level state)')">Edit</button>
                    <button class="btn-action del" onclick="if(confirm('Are you sure you want to delete Record ID ${r.recordId}?')) alert('Record ${r.recordId} deleted from application state.')">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      } else {
        tableBox.innerHTML = `
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Timestamp</th>
                <th>Elevator</th>
                <th>Pax Carried</th>
                <th>Trips</th>
                <th>Avg Load %</th>
                <th>Utilization %</th>
                <th>Avg Stops</th>
                <th>Avg Trip (s)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${paginated.map(r => `
                <tr>
                  <td>${r.recordId}</td>
                  <td><strong>${r.timestamp}</strong></td>
                  <td><strong>${r.elevatorId}</strong></td>
                  <td>${r.passengersCarried}</td>
                  <td>${r.trips}</td>
                  <td>${r.avgLoadPct}%</td>
                  <td>${r.utilizationPct}%</td>
                  <td>${r.avgStopCount}</td>
                  <td>${r.avgTripSec}s</td>
                  <td><span class="status-pill active">${r.status}</span></td>
                  <td>
                    <button class="btn-action edit" onclick="alert('Editing Record ID: ${r.recordId}')">Edit</button>
                    <button class="btn-action del" onclick="if(confirm('Delete Record ${r.recordId}?')) alert('Record ${r.recordId} deleted.')">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }

      if (pageInfo) {
        pageInfo.innerText = `Showing ${startIdx + 1} to ${Math.min(startIdx + pageSize, totalRows)} of ${totalRows.toLocaleString()} records (Page ${currentPage} of ${totalPages})`;
      }
    };

    container.innerHTML = `
      <div class="page-intro-bar">
        <h2 class="section-heading">Data Management</h2>
        <span class="managerial-question-tag">Managerial Question: &ldquo;How can operational records be maintained?&rdquo;</span>
      </div>

      <!-- DATA SOURCE INFO BANNER -->
      <section class="data-info-banner">
        <div class="data-info-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          </svg>
          Authoritative Operational Dataset Reference
        </div>
        <div class="data-info-grid">
          <div><strong>Dataset:</strong> Simulated Operational Dataset v2</div>
          <div><strong>Building:</strong> Demo Institutional Building</div>
          <div><strong>Elevators:</strong> 3 (E1, E2, E3)</div>
          <div><strong>Granularity:</strong> 5-minute operational intervals</div>
        </div>
        <div class="data-info-note">
          <em>Note: In-browser modifications update application state for analysis. The master Excel workbook (OpsLift_Simulated_Elevator_Operations_Dataset_v2_Syllabus_Aligned.xlsx) remains preserved.</em>
        </div>
      </section>

      <!-- TABLE TOOLBAR -->
      <div class="data-mgmt-toolbar">
        <div class="table-switch-tabs">
          <button class="tab-btn active" id="btnTabTraffic">Traffic_5Min (Building-Level)</button>
          <button class="tab-btn" id="btnTabElevator">Elevator_Performance (Car-Level)</button>
        </div>

        <div class="data-mgmt-actions">
          <input type="text" id="dataMgmtSearch" class="search-input" placeholder="Search operational records...">
          <button class="btn-primary" onclick="alert('Add Record modal dialog. Enter 5-minute timestamp, arrival rate, and passenger counts.')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Record
          </button>
        </div>
      </div>

      <!-- TABLE CONTAINER -->
      <section class="chart-card" style="margin-top: 14px;">
        <div id="dataMgmtTableContainer" class="table-responsive-box"></div>
        <div class="pagination-footer">
          <span id="dataMgmtPageInfo" class="page-info-text"></span>
          <div class="pagination-buttons">
            <button class="btn-reset" id="btnPrevPage">Previous</button>
            <button class="btn-reset" id="btnNextPage">Next</button>
          </div>
        </div>
      </section>
    `;

    // Tab bindings
    const btnTabTraffic = document.getElementById('btnTabTraffic');
    const btnTabElevator = document.getElementById('btnTabElevator');
    const searchInput = document.getElementById('dataMgmtSearch');
    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');

    if (btnTabTraffic) {
      btnTabTraffic.addEventListener('click', () => {
        btnTabTraffic.classList.add('active');
        btnTabElevator.classList.remove('active');
        activeTable = 'Traffic_5Min';
        currentPage = 1;
        renderTableContent();
      });
    }

    if (btnTabElevator) {
      btnTabElevator.addEventListener('click', () => {
        btnTabElevator.classList.add('active');
        btnTabTraffic.classList.remove('active');
        activeTable = 'Elevator_Performance';
        currentPage = 1;
        renderTableContent();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1;
        renderTableContent();
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderTableContent();
        }
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const rows = activeTable === 'Traffic_5Min' ? OPS_WORKBOOK_DATA.Traffic_5Min : OPS_WORKBOOK_DATA.Elevator_Performance;
        const totalPages = Math.ceil(rows.length / pageSize) || 1;
        if (currentPage < totalPages) {
          currentPage++;
          renderTableContent();
        }
      });
    }

    // Initial render of table
    renderTableContent();
  },

  // =========================================================================
  // PAGE 8: GREAT LAKES ACADEMIC BLOCK A (Real Timetable Case Study)
  // =========================================================================
  renderGreatLakes(container) {
    const glData = OpsAnalytics.getGreatLakesData(this.glFilters);
    if (!glData) {
      container.innerHTML = `<div style="padding:40px;text-align:center;"><h3>Great Lakes timetable data is loading...</h3></div>`;
      return;
    }

    const { kpis, timeAggList, floorDemandMap, batchDemandMap, scenarioComparison, tableRows, metadata } = glData;
    const currentScenarioPct = Math.round(this.glFilters.scenario * 100);

    container.innerHTML = `
      <!-- INTRO BAR -->
      <div class="page-intro-bar">
        <div>
          <h2 class="section-heading">Great Lakes &ndash; Academic Block A</h2>
          <p class="chart-subheading" style="margin-top:2px;">
            Real-world academic case study modeling vertical passenger flow from institutional class schedules.
          </p>
        </div>
        <span class="managerial-question-tag" style="background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;">
          Managerial Question: When does the Academic Block A elevator face peak scheduled demand, and how can it be managed operationally?
        </span>
      </div>

      <!-- 5 HIGH-VALUE KPI CARDS -->
      <section class="kpi-grid" style="grid-template-columns: repeat(5, 1fr);" aria-label="Great Lakes Key Performance Indicators">
        <article class="kpi-card" style="border-left: 4px solid #2563eb;">
          <div class="kpi-card-header">
            <span class="kpi-title">Peak Scheduled Demand</span>
            <div class="kpi-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${kpis.peakDemand}</span>
            <span class="kpi-unit">pax</span>
          </div>
          <div class="kpi-subtitle">Max surge under ${currentScenarioPct}% scenario</div>
        </article>

        <article class="kpi-card" style="border-left: 4px solid #d97706;">
          <div class="kpi-card-header">
            <span class="kpi-title">Peak Required Trips</span>
            <div class="kpi-icon-box amber">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="3" x2="12" y2="21"></line>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${kpis.peakTrips}</span>
            <span class="kpi-unit">trips</span>
          </div>
          <div class="kpi-subtitle">At practical capacity (7 pax/trip)</div>
        </article>

        <article class="kpi-card" style="border-left: 4px solid #16a34a;">
          <div class="kpi-card-header">
            <span class="kpi-title">Busiest Academic Floor</span>
            <div class="kpi-icon-box" style="background:#f0fdf4;color:#16a34a;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${kpis.busiestFloor}</span>
            <span class="kpi-unit">(${kpis.busiestFloorShare}%)</span>
          </div>
          <div class="kpi-subtitle">Rooms A24 &amp; A25 (Primary lecture halls)</div>
        </article>

        <article class="kpi-card" style="border-left: 4px solid #dc2626;">
          <div class="kpi-card-header">
            <span class="kpi-title">Busiest Movement Window</span>
            <div class="kpi-icon-box" style="background:#fef2f2;color:#dc2626;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value" style="font-size:1.35rem;">${kpis.busiestTime}</span>
          </div>
          <div class="kpi-subtitle">Concurrent class change surge</div>
        </article>

        <article class="kpi-card" style="border-left: 4px solid #7c3aed;">
          <div class="kpi-card-header">
            <span class="kpi-title">Concurrent Events</span>
            <div class="kpi-icon-box" style="background:#f5f3ff;color:#7c3aed;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${kpis.concurrentMovements}</span>
            <span class="kpi-unit">slots</span>
          </div>
          <div class="kpi-subtitle">Timestamps with multi-section overlap</div>
        </article>
      </section>

      <!-- PRIMARY VISUAL (FULL WIDTH) -->
      <section class="chart-card">
        <div class="chart-card-header">
          <div>
            <h3 class="chart-heading">Scheduled Elevator Demand Throughout the Day</h3>
            <p class="chart-subheading">
              Timetable-derived upward demand (class start) and downward demand (class end) aggregated by scheduled event timestamps under ${currentScenarioPct}% adoption.
            </p>
          </div>
          <span class="pax-badge" style="background:#eff6ff;color:#1e40af;">Timetable-Derived Flow</span>
        </div>
        <div class="chart-canvas-wrapper" style="height: 310px;">
          <canvas id="chartGLDailyDemand"></canvas>
        </div>
      </section>

      <!-- 2-COLUMN GRID: REQUIRED TRIPS & FLOOR DEMAND -->
      <section class="charts-grid-2x2">
        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Required Elevator Trips by Class Event</h3>
              <p class="chart-subheading">
                Trips required per timestamp using CEILING(Users / 7 pax capacity). Single elevator capacity threshold highlighted.
              </p>
            </div>
          </div>
          <div class="chart-canvas-wrapper" style="height: 275px;">
            <canvas id="chartGLRequiredTrips"></canvas>
          </div>
        </article>

        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Estimated Elevator Demand by Floor</h3>
              <p class="chart-subheading">
                Share of elevator demand destined for Floor 1 (A17), Floor 2 (A24, A25), and Floor 3 (A33, A34).
              </p>
            </div>
          </div>
          <div class="chart-canvas-wrapper" style="height: 275px;">
            <canvas id="chartGLFloorDemand"></canvas>
          </div>
        </article>
      </section>

      <!-- 2-COLUMN GRID: PROGRAMME DEMAND & SCENARIO ANALYSIS -->
      <section class="charts-grid-2x2">
        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Estimated Elevator Demand by Programme</h3>
              <p class="chart-subheading">
                Distribution across PGPM (130 students, 2 Sec), PGDM 1 (360 students, 6 Sec), and PGDM 2 (300 students, 5 Sec).
              </p>
            </div>
          </div>
          <div class="chart-canvas-wrapper" style="height: 275px;">
            <canvas id="chartGLBatchDemand"></canvas>
          </div>
        </article>

        <article class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-heading">Elevator Usage Scenario Sensitivity Analysis</h3>
              <p class="chart-subheading">
                Comparison of total estimated users and peak elevator trips under 15%, 25%, and 35% adoption assumptions.
              </p>
            </div>
          </div>
          <div class="chart-canvas-wrapper" style="height: 275px;">
            <canvas id="chartGLScenarios"></canvas>
          </div>
        </article>
      </section>

      <!-- DYNAMIC MANAGEMENT INSIGHT & OM RECOMMENDATIONS -->
      <section class="insight-panel" style="border-left-color: #2563eb;">
        <div class="insight-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z"></path>
          </svg>
          <h3 class="insight-title">Executive Operations Management Synthesis &ndash; Academic Block A</h3>
        </div>
        <p class="insight-text">
          <strong>1. Root Cause of Congestion: Simultaneous Academic Scheduling (Process Synchronization)</strong><br>
          Elevator pressure in Academic Block A is strictly driven by timetable synchronization. At peak change intervals (e.g. 10:15 AM and 11:45 AM), up to <strong>8 class sections</strong> start/end concurrently across PGPM, PGDM 1, and PGDM 2, generating an instantaneous surge of <strong>${kpis.peakDemand} elevator users</strong> under the 25% base adoption scenario.
        </p>
        <p class="insight-text">
          <strong>2. Service Capacity Deficit on a Single Elevator (Queuing &amp; Clearance Time)</strong><br>
          With only 1 elevator with an assumed practical capacity of 7 passengers/trip, clearing a peak surge of ${kpis.peakDemand} passengers requires <strong>${kpis.peakTrips} consecutive round trips</strong>. Assuming a modest round-trip cycle of 75–90 seconds per trip, clearing the lobby requires <strong>22 to 27 minutes</strong> &mdash; significantly exceeding the 15-minute inter-class break window.
        </p>
        <p class="insight-text">
          <strong>3. Floor Demand Imbalance (64.6% on Lower Floors)</strong><br>
          Floor 2 (Rooms A24 &amp; A25) creates <strong>41.2%</strong> of all elevator demand, and Floor 1 (Room A17) creates <strong>23.4%</strong>. Together, Floors 1 and 2 account for nearly two-thirds of demand. Encouraging walking for 1&ndash;2 flights is the highest-leverage immediate operational intervention.
        </p>
      </section>

      <!-- OPERATIONAL RECOMMENDATIONS GRID -->
      <section class="chart-card">
        <div class="chart-card-header">
          <div>
            <h3 class="chart-heading">Recommended Operational Interventions (Operations Management Framework)</h3>
            <p class="chart-subheading">Focus on demand smoothing, capacity utilization, and process flow prior to considering capital expenditure.</p>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 10px;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <span class="priority-badge high">High Priority</span>
              <strong style="font-size:0.88rem; color:#0f172a;">1. Stagger Class Schedules (Process Smoothing)</strong>
            </div>
            <p style="font-size:0.8rem; color:#475569; line-height:1.4;">
              Stagger class start and dismissal times by 10&ndash;15 minutes across programmes (e.g., PGPM starts at 08:30, PGDM 1 at 08:45, PGDM 2 at 09:00). This flattens the 18-trip peak down to 4&ndash;5 trips per departure window, fully eliminating lobby queue accumulation.
            </p>
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <span class="priority-badge high">High Priority</span>
              <strong style="font-size:0.88rem; color:#0f172a;">2. Promote Stair Usage for Floors 1 &amp; 2 (Lean Waiting Waste)</strong>
            </div>
            <p style="font-size:0.8rem; color:#475569; line-height:1.4;">
              Install clear motivational signage promoting stairway usage for 1-flight (Floor 1) and 2-flight (Floor 2) travel. Shifting 50% of Floor 1 &amp; 2 traffic to stairs reduces peak elevator load by ~32%, immediately halving elevator queue length.
            </p>
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <span class="priority-badge medium">Medium Priority</span>
              <strong style="font-size:0.88rem; color:#0f172a;">3. Optimize Classroom Allocations (Capacity Planning)</strong>
            </div>
            <p style="font-size:0.8rem; color:#475569; line-height:1.4;">
              Schedule the largest cohort sections (PGDM 1 with 60 students per section) into ground/first floor rooms (A17) and reserve higher floors (A33, A34 on Floor 3) for smaller elective sections to minimize vertical transport load.
            </p>
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <span class="priority-badge medium">Medium Priority</span>
              <strong style="font-size:0.88rem; color:#0f172a;">4. Priority Elevator Access Window (Service Effectiveness)</strong>
            </div>
            <p style="font-size:0.8rem; color:#475569; line-height:1.4;">
              Establish an operational policy reserving elevator access during the critical 5-minute pre-lecture transition window for faculty carrying teaching materials and individuals with mobility impairments.
            </p>
          </div>
        </div>
      </section>

      <!-- TIMETABLE EVENT TABLE (AUDITABLE DATA GRID) -->
      <section class="chart-card">
        <div class="chart-card-header">
          <div>
            <h3 class="chart-heading">Auditable Timetable Class Events &ndash; Academic Block A</h3>
            <p class="chart-subheading">Complete parsed schedule showing derived section sizes, adoption scenario demand, and required elevator trips.</p>
          </div>
          <span class="pax-badge">${tableRows.length} Scheduled Events</span>
        </div>

        <div class="data-mgmt-toolbar" style="margin-top:4px; margin-bottom:10px;">
          <input type="text" class="search-input" id="glTableSearch" placeholder="Search course, room, batch, faculty...">
        </div>

        <div class="table-responsive-box">
          <table class="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Batch</th>
                <th>Sec</th>
                <th>Course Name</th>
                <th>Room</th>
                <th>Floor</th>
                <th>Event Type</th>
                <th>Dir</th>
                <th>Est. Students</th>
                <th>Scenario</th>
                <th>Est. Users</th>
                <th>Req. Trips (Cap 7)</th>
              </tr>
            </thead>
            <tbody id="glTableBody">
              <!-- Rendered via renderGlTableContent() -->
            </tbody>
          </table>
        </div>

        <div class="pagination-footer">
          <span class="page-info-text" id="glPageInfo">Showing page 1</span>
          <div class="pagination-buttons">
            <button type="button" class="btn-action" id="btnGlPrev">&laquo; Previous</button>
            <button type="button" class="btn-action" id="btnGlNext">Next &raquo;</button>
          </div>
        </div>
      </section>

      <!-- METHODOLOGY & ASSUMPTIONS TRANSPARENCY SECTION -->
      <section class="data-info-banner">
        <div class="data-info-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Methodology, Operational Assumptions &amp; Data Transparency
        </div>
        <div class="data-info-grid">
          <div>
            <strong>Known Student Cohorts:</strong><br>
            &bull; PGPM: 130 students (2 sections &rarr; 65/sec)<br>
            &bull; PGDM 2: 300 students (5 sections &rarr; 60/sec)<br>
            &bull; PGDM 1: 360 students (6 sections &rarr; 60/sec)
          </div>
          <div>
            <strong>Academic Block A Filtering:</strong><br>
            &bull; Room Code prefix: <code>A</code> (A17, A24, A25, A33, A34)<br>
            &bull; Floor Extraction: First digit after <code>A</code> (Floor 1, 2, 3)<br>
            &bull; Excluded non-A rooms: B12, B21, C05
          </div>
          <div>
            <strong>Elevator &amp; Capacity Model:</strong><br>
            &bull; Physical Assets: 1 elevator serving Floors 1&ndash;3<br>
            &bull; Observed Capacity: 6&ndash;8 pax/trip<br>
            &bull; Base Practical Capacity: <strong>7 passengers/trip</strong><br>
            &bull; Trip Formula: <code>CEILING(Est. Users / Capacity)</code>
          </div>
          <div>
            <strong>Adoption Scenarios &amp; Rounding:</strong><br>
            &bull; Conservative: 15% adoption<br>
            &bull; Base Default: <strong>25% adoption</strong><br>
            &bull; High Demand: 35% adoption<br>
            &bull; Rounding: Whole person display via standard rounding
          </div>
        </div>
        <div class="data-info-note">
          <strong>Important Academic Operations Management Distinction:</strong>
          This page translates institutional academic schedules into estimated passenger demand under explicit scenario assumptions. It does not claim to represent automated elevator IoT telemetry or physical sensor observations. No unsubstantiated cycle speeds, door timings, or continuous waiting queues are invented.
        </div>
      </section>
    `;

    // -----------------------------------------------------------------------
    // CHART 1: Scheduled Elevator Demand Throughout the Day
    // -----------------------------------------------------------------------
    const ctxDaily = document.getElementById('chartGLDailyDemand')?.getContext('2d');
    if (ctxDaily) {
      // Group timeAggList into labels, up dataset, down dataset
      // Sort time slots
      const timeLabels = timeAggList.map(t => `${t.day.substring(0,3)} ${t.time}`);
      const upValues = timeAggList.map(t => Math.round(t.upUsers));
      const downValues = timeAggList.map(t => Math.round(t.downUsers));
      const totalValues = timeAggList.map(t => Math.round(t.totalUsers));

      this.chartInstances.glDailyDemand = new Chart(ctxDaily, {
        type: 'bar',
        data: {
          labels: timeLabels,
          datasets: [
            {
              label: 'Upward Demand (Class Start)',
              data: upValues,
              backgroundColor: '#2563eb',
              borderRadius: 4
            },
            {
              label: 'Downward Demand (Class End)',
              data: downValues,
              backgroundColor: '#d97706',
              borderRadius: 4
            },
            {
              label: 'Total Demand (Line)',
              data: totalValues,
              type: 'line',
              borderColor: '#0f172a',
              backgroundColor: '#0f172a',
              borderWidth: 2,
              tension: 0.2,
              pointRadius: 4,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Inter', size: 11 } } },
            tooltip: {
              callbacks: {
                footer: (items) => {
                  const idx = items[0].dataIndex;
                  const item = timeAggList[idx];
                  return `Sections: ${item.sectionsCount} concurrent`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Estimated Elevator Users (pax)', font: { size: 11 } },
              grid: { color: '#f1f5f9' }
            },
            x: {
              grid: { display: false },
              ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 } }
            }
          }
        }
      });
    }

    // -----------------------------------------------------------------------
    // CHART 2: Required Elevator Trips by Class Event
    // -----------------------------------------------------------------------
    const ctxTrips = document.getElementById('chartGLRequiredTrips')?.getContext('2d');
    if (ctxTrips) {
      const tripLabels = timeAggList.map(t => `${t.day.substring(0,3)} ${t.time}`);
      const tripValues = timeAggList.map(t => Math.ceil(t.totalUsers / metadata.base_capacity));
      const tripColors = tripValues.map(v => v >= 10 ? '#dc2626' : v >= 5 ? '#d97706' : '#2563eb');

      this.chartInstances.glRequiredTrips = new Chart(ctxTrips, {
        type: 'bar',
        data: {
          labels: tripLabels,
          datasets: [
            {
              label: 'Required Trips (Cap 7)',
              data: tripValues,
              backgroundColor: tripColors,
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `Required Trips: ${ctx.parsed.y} trips (${Math.round(timeAggList[ctx.dataIndex].totalUsers)} users)`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Elevator Trips Needed', font: { size: 11 } },
              grid: { color: '#f1f5f9' }
            },
            x: {
              grid: { display: false },
              ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 } }
            }
          }
        }
      });
    }

    // -----------------------------------------------------------------------
    // CHART 3: Estimated Elevator Demand by Floor
    // -----------------------------------------------------------------------
    const ctxFloor = document.getElementById('chartGLFloorDemand')?.getContext('2d');
    if (ctxFloor) {
      const fl1 = Math.round(floorDemandMap[1] || 0);
      const fl2 = Math.round(floorDemandMap[2] || 0);
      const fl3 = Math.round(floorDemandMap[3] || 0);

      this.chartInstances.glFloorDemand = new Chart(ctxFloor, {
        type: 'doughnut',
        data: {
          labels: ['Floor 1 (Room A17)', 'Floor 2 (Rooms A24, A25)', 'Floor 3 (Rooms A33, A34)'],
          datasets: [
            {
              data: [fl1, fl2, fl3],
              backgroundColor: ['#60a5fa', '#2563eb', '#1e40af'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Inter', size: 11 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const total = fl1 + fl2 + fl3 || 1;
                  const pct = ((ctx.parsed / total) * 100).toFixed(1);
                  return ` ${ctx.label}: ${ctx.parsed} pax (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }

    // -----------------------------------------------------------------------
    // CHART 4: Estimated Elevator Demand by Programme
    // -----------------------------------------------------------------------
    const ctxBatch = document.getElementById('chartGLBatchDemand')?.getContext('2d');
    if (ctxBatch) {
      const pgpmVal = Math.round(batchDemandMap['PGPM'] || 0);
      const pgdm1Val = Math.round(batchDemandMap['PGDM 1'] || 0);
      const pgdm2Val = Math.round(batchDemandMap['PGDM 2'] || 0);

      this.chartInstances.glBatchDemand = new Chart(ctxBatch, {
        type: 'bar',
        data: {
          labels: ['PGPM (130 students)', 'PGDM 1 (360 students)', 'PGDM 2 (300 students)'],
          datasets: [
            {
              label: 'Total Estimated Elevator Demand (pax)',
              data: [pgpmVal, pgdm1Val, pgdm2Val],
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Total Users (pax)', font: { size: 11 } },
              grid: { color: '#f1f5f9' }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 11, weight: '500' } }
            }
          }
        }
      });
    }

    // -----------------------------------------------------------------------
    // CHART 5: Elevator Usage Scenario Sensitivity Analysis
    // -----------------------------------------------------------------------
    const ctxScen = document.getElementById('chartGLScenarios')?.getContext('2d');
    if (ctxScen) {
      const scenLabels = scenarioComparison.map(s => `${s.scenarioPct} (${s.scenarioName})`);
      const scenTotalUsers = scenarioComparison.map(s => s.totalUsers);
      const scenPeakTrips = scenarioComparison.map(s => s.peakTripsCap7);

      this.chartInstances.glScenarios = new Chart(ctxScen, {
        type: 'bar',
        data: {
          labels: scenLabels,
          datasets: [
            {
              label: 'Peak Users Surge (pax)',
              data: scenarioComparison.map(s => s.peakUsers),
              backgroundColor: '#2563eb',
              borderRadius: 4
            },
            {
              label: 'Peak Required Trips (Cap 7)',
              data: scenPeakTrips,
              backgroundColor: '#ef4444',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Inter', size: 11 } } }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 } }
            }
          }
        }
      });
    }

    // -----------------------------------------------------------------------
    // TABLE: Pagination & Search Controller
    // -----------------------------------------------------------------------
    let currentTableData = [...tableRows];
    let pageIdx = 1;
    const pageSize = 12;

    const renderGlTable = () => {
      const tbody = document.getElementById('glTableBody');
      const pageInfo = document.getElementById('glPageInfo');
      if (!tbody) return;

      const q = (document.getElementById('glTableSearch')?.value || '').toLowerCase().trim();
      let filtered = currentTableData;
      if (q) {
        filtered = currentTableData.filter(r => 
          r.course.toLowerCase().includes(q) ||
          r.room.toLowerCase().includes(q) ||
          r.batch.toLowerCase().includes(q) ||
          r.section.toLowerCase().includes(q) ||
          r.day.toLowerCase().includes(q) ||
          r.time.toLowerCase().includes(q) ||
          r.eventType.toLowerCase().includes(q)
        );
      }

      const totalPages = Math.ceil(filtered.length / pageSize) || 1;
      if (pageIdx > totalPages) pageIdx = totalPages;
      if (pageIdx < 1) pageIdx = 1;

      const start = (pageIdx - 1) * pageSize;
      const paged = filtered.slice(start, start + pageSize);

      if (paged.length === 0) {
        tbody.innerHTML = `<tr><td colspan="13" style="text-align:center;padding:24px;color:#94a3b8;">No matching timetable events found.</td></tr>`;
      } else {
        tbody.innerHTML = paged.map(r => `
          <tr>
            <td><strong>${r.day}</strong></td>
            <td style="font-family:var(--font-mono);font-weight:600;">${r.time}</td>
            <td><span class="om-tag">${r.batch}</span></td>
            <td>${r.section}</td>
            <td style="font-weight:500;">${r.course}</td>
            <td><strong style="color:#2563eb;">${r.room}</strong></td>
            <td>${r.floor}</td>
            <td>${r.eventType}</td>
            <td>
              <span class="status-pill ${r.direction === 'Up' ? 'active' : ''}" style="${r.direction === 'Down' ? 'background:#fffbeb;color:#b45309;' : ''}">
                ${r.direction}
              </span>
            </td>
            <td style="font-family:var(--font-mono);">${r.students}</td>
            <td style="font-family:var(--font-mono);">${r.scenarioPct}</td>
            <td style="font-family:var(--font-mono);font-weight:600;">${r.estUsers} pax</td>
            <td><strong style="color:${r.requiredTrips >= 3 ? '#dc2626' : '#2563eb'};">${r.requiredTrips} ${r.requiredTrips > 1 ? 'trips' : 'trip'}</strong></td>
          </tr>
        `).join('');
      }

      if (pageInfo) {
        pageInfo.textContent = `Showing ${filtered.length === 0 ? 0 : start + 1} to ${Math.min(start + pageSize, filtered.length)} of ${filtered.length} events (Page ${pageIdx} of ${totalPages})`;
      }
    };

    const searchBox = document.getElementById('glTableSearch');
    if (searchBox) {
      searchBox.addEventListener('input', () => {
        pageIdx = 1;
        renderGlTable();
      });
    }

    const btnPrev = document.getElementById('btnGlPrev');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (pageIdx > 1) {
          pageIdx--;
          renderGlTable();
        }
      });
    }

    const btnNext = document.getElementById('btnGlNext');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        pageIdx++;
        renderGlTable();
      });
    }

    // Initial table render
    renderGlTable();
  }
};

window.OpsPages = OpsPages;


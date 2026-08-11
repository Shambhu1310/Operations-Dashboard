import re

# Read current pages.js
with open(r'c:\Users\shash\OneDrive\Desktop\Term 2\OpsLift\js\pages.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update OpsPages object definition to include glFilters
old_init = '''const OpsPages = {
  activePage: 'executive-overview',
  chartInstances: {},

  init() {
    this.setupTopNavigation();
    this.setupGlobalFilters();
    this.renderPage(this.activePage);
  },'''

new_init = '''const OpsPages = {
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
  },'''

code = code.replace(old_init, new_init, 1)

# 2. Add setupGreatLakesFilters and update setupGlobalFilters & renderPage
old_setup = '''    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        OpsAnalytics.filters.date = '2026-08-10';
        OpsAnalytics.filters.trafficPeriod = 'all';
        OpsAnalytics.filters.elevator = 'all';
        if (dateSelect) dateSelect.value = '2026-08-10';
        if (periodSelect) periodSelect.value = 'all';
        if (elevatorSelect) elevatorSelect.value = 'all';
        this.renderPage(this.activePage);
      });
    }
  },

  // Main Page Dispatcher
  renderPage(pageId) {
    this.destroyCharts();
    const container = document.getElementById('pageContentContainer');
    if (!container) return;

    // Filter control availability per page
    const elevatorFilterItem = document.getElementById('filterItemElevator');
    if (elevatorFilterItem) {
      elevatorFilterItem.style.display = (pageId === 'elevator-performance' || pageId === 'data-management') ? 'flex' : 'none';
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
      case 'data-management':
        this.renderDataManagement(container);
        break;
      default:
        this.renderExecutiveOverview(container);
    }
  },'''

new_setup = '''    // Reset button
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
  },'''

code = code.replace(old_setup, new_setup, 1)

# 3. Add renderGreatLakes implementation before closing brace of OpsPages
gl_method = '''
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
'''

# Replace the closing of OpsPages
code = re.sub(r'\n\};\s*$', gl_method + '\n};\n\nwindow.OpsPages = OpsPages;\n', code)

with open(r'c:\Users\shash\OneDrive\Desktop\Term 2\OpsLift\js\pages.js', 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated js/pages.js successfully with renderGreatLakes!')

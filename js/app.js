/**
 * OpsLift - Executive Overview Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize simple executive charts
  initCharts(OPS_DATA.intervals);

  // Setup header filter controls
  setupFilterControls();

  // Setup navigation feedback
  setupSidebarNavigation();
});

function setupFilterControls() {
  const periodFilter = document.getElementById('periodFilter');
  const elevatorFilter = document.getElementById('elevatorFilter');
  const dateFilter = document.getElementById('dateFilter');
  const resetBtn = document.getElementById('resetFiltersBtn');

  function applyActiveFilters() {
    const periodVal = periodFilter?.value || 'all';
    let filtered = [...OPS_DATA.intervals];

    if (periodVal === 'morning') {
      filtered = filtered.filter(i => i.timeVal >= 8.5 && i.timeVal <= 10.0);
    } else if (periodVal === 'lunch') {
      filtered = filtered.filter(i => i.timeVal >= 12.5 && i.timeVal <= 14.0);
    } else if (periodVal === 'evening') {
      filtered = filtered.filter(i => i.timeVal >= 17.0 && i.timeVal <= 18.5);
    } else if (periodVal === 'offpeak') {
      filtered = filtered.filter(i => 
        !(i.timeVal >= 8.5 && i.timeVal <= 10.0) &&
        !(i.timeVal >= 12.5 && i.timeVal <= 14.0) &&
        !(i.timeVal >= 17.0 && i.timeVal <= 18.5)
      );
    }

    renderDemandChart(filtered);
  }

  if (periodFilter) periodFilter.addEventListener('change', applyActiveFilters);
  if (elevatorFilter) elevatorFilter.addEventListener('change', applyActiveFilters);
  if (dateFilter) dateFilter.addEventListener('change', applyActiveFilters);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (periodFilter) periodFilter.value = 'all';
      if (elevatorFilter) elevatorFilter.value = 'all';
      if (dateFilter) dateFilter.value = 'today';
      renderDemandChart(OPS_DATA.intervals);
    });
  }
}

function setupSidebarNavigation() {
  const navLinks = document.querySelectorAll('.nav-link:not(.active)');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageTitle = link.querySelector('.nav-text')?.innerText || 'This page';
      showSimpleNotice(`${pageTitle} is scheduled for Phase 2.`);
    });
  });
}

function showSimpleNotice(msg) {
  let toast = document.getElementById('simpleNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'simpleNotice';
    toast.className = 'simple-notice-toast';
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

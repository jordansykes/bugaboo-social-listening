// ── Chart instances ─────────────────────────────────────────────────
const charts = {};

// ── Tab navigation ──────────────────────────────────────────────────
function showPage(id, tabEl) {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
  var page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');
  if (tabEl) tabEl.classList.add('active');
  try { if (id === 'compare') drawCompareChart(); } catch(e) { console.error('compare chart:', e); }
  try { if (id === 'overview') drawWoWChart(); } catch(e) { console.error('wow chart:', e); }
  try { if (id === 'comp-strollers') drawCompStrollerChart(); } catch(e) { console.error('stroller chart:', e); }
  try { if (id === 'comp-carriers') drawCompCarrierChart(); } catch(e) { console.error('carrier chart:', e); }
}

// ── Wire up tabs (script is at end of <body>, DOM is ready — no DOMContentLoaded needed) ──
document.querySelectorAll('.tab[data-page]').forEach(function(tab) {
  tab.addEventListener('click', function() {
    showPage(tab.dataset.page, tab);
  });
});

// "Go to Recalls" links inside alert banners
document.querySelectorAll('.goto-recalls').forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    var recallTab = document.querySelector('.tab[data-page="recalls"]');
    showPage('recalls', recallTab);
  });
});

// ── Week-on-week chart ───────────────────────────────────────────────
function drawWoWChart() {
  const ctx = document.getElementById('wowChart');
  if (!ctx || charts.wow) return;

  // Prior week (2 Jun 2026) vs this week (3 Jun 2026)
  const metrics = [
    { label: 'Bugaboo Sentiment',       prev: 0.70,  curr: 0.72,  color: '#e63946' },
    { label: 'Bugaboo Reviews (×100)',  prev: 30.0,  curr: 30.0,  color: '#e63946' },
    { label: 'Joolz Trustpilot ★',     prev: 3.1,   curr: 3.1,   color: '#6366f1' },
    { label: 'Joolz Reviews (×100)',    prev: 10.31, curr: 10.34, color: '#6366f1' },
    { label: 'Joolz Sentiment',         prev: 0.22,  curr: 0.20,  color: '#6366f1' },
    { label: 'Artipoppe Sentiment',     prev: 0.25,  curr: 0.23,  color: '#f59e0b' },
  ];

  const labels = metrics.map(m => m.label);
  const deltas = metrics.map(m => parseFloat((m.curr - m.prev).toFixed(3)));
  const bgColors = metrics.map((m, i) => deltas[i] > 0 ? '#16a34a99' : deltas[i] < 0 ? '#dc262699' : '#88888844');
  const borderColors = metrics.map((m, i) => deltas[i] > 0 ? '#16a34a' : deltas[i] < 0 ? '#dc2626' : '#888888');

  charts.wow = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Change vs prev week',
        data: deltas,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 6,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw;
              const sign = val > 0 ? '+' : '';
              return ` ${sign}${val.toFixed(3)} vs prev week`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#f0f0f0' },
          ticks: { font: { size: 11 }, callback: v => v > 0 ? '+' + v : v },
          title: { display: true, text: 'Change from prior week', font: { size: 11 }, color: '#888' }
        },
        y: {
          ticks: { font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

// ── Compare chart ───────────────────────────────────────────────────
function drawCompareChart() {
  const ctx = document.getElementById('compareChart');
  if (!ctx || charts.compare) return;
  charts.compare = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Bugaboo', 'Joolz', 'Artipoppe'],
      datasets: [
        {
          label: 'Trustpilot (/5)',
          data: [4.0, 3.1, null],
          backgroundColor: ['#e6394633', '#6366f133', '#f59e0b33'],
          borderColor: ['#e63946', '#6366f1', '#f59e0b'],
          borderWidth: 2, borderRadius: 4, yAxisID: 'y1',
        },
        {
          label: 'Sentiment Score',
          data: [0.72, 0.20, 0.23],
          backgroundColor: ['#e63946aa', '#6366f1aa', '#f59e0baa'],
          borderColor: ['#e63946', '#6366f1', '#f59e0b'],
          borderWidth: 2, borderRadius: 4, yAxisID: 'y2',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { font: { size: 12 }, boxWidth: 12 } } },
      scales: {
        y1: { position: 'left', min: 0, max: 5, title: { display: true, text: 'Trustpilot (/5)', font: { size: 11 } }, ticks: { font: { size: 11 } }, grid: { color: '#f0f0f0' } },
        y2: { position: 'right', min: -1, max: 1, title: { display: true, text: 'Sentiment', font: { size: 11 } }, ticks: { font: { size: 11 } }, grid: { display: false } },
        x: { ticks: { font: { size: 12 } }, grid: { display: false } }
      }
    }
  });
}

// ── Competitor stroller chart ───────────────────────────────────────
function drawCompStrollerChart() {
  const ctx = document.getElementById('compStrollerChart');
  if (!ctx || charts.compStroller) return;
  charts.compStroller = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Bugaboo ★', 'UPPAbaby', 'BabyZen/Stokke', 'Nuna', 'Cybex', 'Joolz ★'],
      datasets: [{
        label: 'Sentiment Score',
        data: [0.72, 0.65, 0.60, 0.45, 0.42, 0.20],
        backgroundColor: ['#e63946cc', '#0ea5e9cc', '#d97706cc', '#059669cc', '#7c3aedcc', '#6366f1cc'],
        borderColor: ['#e63946', '#0ea5e9', '#d97706', '#059669', '#7c3aed', '#6366f1'],
        borderWidth: 2, borderRadius: 6,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` Sentiment: +${ctx.raw.toFixed(2)}` } }
      },
      scales: {
        x: { min: 0, max: 1, grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 } }, title: { display: true, text: 'Sentiment Score (0 to +1.0)  · ★ = Bugaboo Group brand', font: { size: 11 }, color: '#888' } },
        y: { ticks: { font: { size: 12 } }, grid: { display: false } }
      }
    }
  });
}

// ── Competitor carrier chart ────────────────────────────────────────
function drawCompCarrierChart() {
  const ctx = document.getElementById('compCarrierChart');
  if (!ctx || charts.compCarrier) return;
  charts.compCarrier = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Wildbird', 'Ergobaby', 'Tula', 'Sakura Bloom', 'Mabe', 'Artipoppe'],
      datasets: [{
        label: 'Sentiment Score',
        data: [0.75, 0.70, 0.68, 0.65, 0.52, 0.23],
        backgroundColor: ['#10b981cc', '#0891b2cc', '#ca8a04cc', '#8b5cf6cc', '#f43f5ecc', '#f59e0bcc'],
        borderColor: ['#10b981', '#0891b2', '#ca8a04', '#8b5cf6', '#f43f5e', '#f59e0b'],
        borderWidth: 2, borderRadius: 6,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` Sentiment: +${ctx.raw.toFixed(2)}` } }
      },
      scales: {
        x: { min: 0, max: 1, grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 } }, title: { display: true, text: 'Sentiment Score (0 to +1.0)', font: { size: 11 }, color: '#888' } },
        y: { ticks: { font: { size: 12 } }, grid: { display: false } }
      }
    }
  });
}

// Draw on load
window.addEventListener('load', function() {
  setTimeout(function() {
    try { drawWoWChart(); } catch(e) { console.error('initial wow chart:', e); }
  }, 150);
});
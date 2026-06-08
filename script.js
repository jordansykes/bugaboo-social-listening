// ── Chart instances ─────────────────────────────────────────────────
var charts = {};

// ── Tab active-class management + chart triggers ─────────────────────
// CSS :target handles show/hide — JS just manages the active highlight
// and triggers charts when tabs are clicked.
// Script is at end of <body>, so all elements exist here.

function setActiveTab(href) {
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
  var tab = document.querySelector('a.tab[href="' + href + '"]');
  if (tab) tab.classList.add('active');
}

function triggerChartForHash(hash) {
  var id = (hash || '').replace('#page-', '');
  try { if (id === 'compare') drawCompareChart(); } catch(e) { console.error('compare chart:', e); }
  try { if (id === 'comp-strollers') drawCompStrollerChart(); } catch(e) { console.error('stroller chart:', e); }
  try { if (id === 'comp-carriers') drawCompCarrierChart(); } catch(e) { console.error('carrier chart:', e); }
  try { if (id === 'overview' || id === '') drawWoWChart(); } catch(e) { console.error('wow chart:', e); }
}

// Wire up tab clicks
document.querySelectorAll('a.tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    setActiveTab(tab.getAttribute('href'));
    triggerChartForHash(tab.getAttribute('href'));
  });
});

// "Go to Recalls" links
document.querySelectorAll('.goto-recalls').forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    location.hash = '#page-recalls';
    setActiveTab('#page-recalls');
  });
});

// Set initial active tab on page load
(function() {
  var hash = location.hash || '#page-overview';
  setActiveTab(hash);
})();

// Sync active tab if user navigates back/forward
window.addEventListener('hashchange', function() {
  setActiveTab(location.hash);
  triggerChartForHash(location.hash);
});

// Draw overview chart on load
window.addEventListener('load', function() {
  setTimeout(function() {
    try { drawWoWChart(); } catch(e) { console.error('initial wow chart:', e); }
  }, 150);
});

// ── Week-on-week chart ───────────────────────────────────────────────
function drawWoWChart() {
  var ctx = document.getElementById('wowChart');
  if (!ctx || charts.wow) return;

  var metrics = [
    { label: 'Bugaboo Sentiment',       prev: 0.70,  curr: 0.72  },
    { label: 'Bugaboo Reviews (×100)',  prev: 30.0,  curr: 30.0  },
    { label: 'Joolz Trustpilot ★',     prev: 3.1,   curr: 3.1   },
    { label: 'Joolz Reviews (×100)',    prev: 10.31, curr: 10.34 },
    { label: 'Joolz Sentiment',         prev: 0.22,  curr: 0.20  },
    { label: 'Artipoppe Sentiment',     prev: 0.25,  curr: 0.23  },
  ];

  var labels = metrics.map(function(m) { return m.label; });
  var deltas = metrics.map(function(m) { return parseFloat((m.curr - m.prev).toFixed(3)); });
  var bgColors = deltas.map(function(d) { return d > 0 ? '#16a34a99' : d < 0 ? '#dc262699' : '#88888844'; });
  var borderColors = deltas.map(function(d) { return d > 0 ? '#16a34a' : d < 0 ? '#dc2626' : '#888888'; });

  charts.wow = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
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
            label: function(ctx) {
              var val = ctx.raw;
              var sign = val > 0 ? '+' : '';
              return ' ' + sign + val.toFixed(3) + ' vs prev week';
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#f0f0f0' },
          ticks: { font: { size: 11 }, callback: function(v) { return v > 0 ? '+' + v : v; } },
          title: { display: true, text: 'Change from prior week', font: { size: 11 }, color: '#888' }
        },
        y: { ticks: { font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

// ── Compare chart ───────────────────────────────────────────────────
function drawCompareChart() {
  var ctx = document.getElementById('compareChart');
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
  var ctx = document.getElementById('compStrollerChart');
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
        tooltip: { callbacks: { label: function(ctx) { return ' Sentiment: +' + ctx.raw.toFixed(2); } } }
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
  var ctx = document.getElementById('compCarrierChart');
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
        tooltip: { callbacks: { label: function(ctx) { return ' Sentiment: +' + ctx.raw.toFixed(2); } } }
      },
      scales: {
        x: { min: 0, max: 1, grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 } }, title: { display: true, text: 'Sentiment Score (0 to +1.0)', font: { size: 11 }, color: '#888' } },
        y: { ticks: { font: { size: 12 } }, grid: { display: false } }
      }
    }
  });
}

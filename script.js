
const charts = {};

function showPage(id, tabEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');
  if (tabEl) tabEl.classList.add('active');
  if (id === 'compare') drawCompareChart();
  if (id === 'overview') drawWoWChart();
  if (id === 'comp-strollers') drawCompStrollerChart();
  if (id === 'comp-carriers') drawCompCarrierChart();
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.tab[data-page]').forEach(function(tab) {
    tab.addEventListener('click', function() {
      showPage(tab.dataset.page, tab);
    });
  });
  document.querySelectorAll('.goto-recalls').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var recallTab = document.querySelector('.tab[data-page="recalls"]');
      showPage('recalls', recallTab);
    });
  });
  drawWoWChart();
});

function drawWoWChart() {
  const ctx = document.getElementById('wowChart');
  if (!ctx || charts.wow) return;
  // Prior week (6 Jul 2026) vs this week (13 Jul 2026)
  var metrics = [
    { label: 'Bugaboo Trustpilot ★',     prev: 4.00,  curr: 4.00  },
    { label: 'Bugaboo Reviews (×100)',   prev: 27.00, curr: 26.00 },
    { label: 'Bugaboo Sentiment',        prev: 0.73,  curr: 0.65  },
    { label: 'Joolz Trustpilot ★',      prev: 3.10,  curr: 3.10  },
    { label: 'Joolz Reviews (×100)',     prev: 9.99,  curr: 9.99  },
    { label: 'Joolz Sentiment',          prev: 0.24,  curr: 0.20  },
    { label: 'Artipoppe Sentiment',      prev: 0.23,  curr: 0.17  },
  ];
  const labels = metrics.map(m => m.label);
  const deltas = metrics.map(m => parseFloat((m.curr - m.prev).toFixed(3)));
  const bgColors = metrics.map((m, i) => deltas[i] > 0 ? '#16a34a99' : deltas[i] < 0 ? '#dc262699' : '#88888844');
  const borderColors = metrics.map((m, i) => deltas[i] > 0 ? '#16a34a' : deltas[i] < 0 ? '#dc2626' : '#888888');
  charts.wow = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Change vs prev week', data: deltas, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 2, borderRadius: 6 }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => { const val = ctx.raw; const sign = val > 0 ? '+' : ''; return ` ${sign}${val.toFixed(3)} vs prev week`; } } }
      },
      scales: {
        x: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 }, callback: v => v > 0 ? '+' + v : v }, title: { display: true, text: 'Change from prior week', font: { size: 11 }, color: '#888' } },
        y: { ticks: { font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

function drawCompareChart() {
  const ctx = document.getElementById('compareChart');
  if (!ctx || charts.compare) return;
  charts.compare = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Bugaboo', 'Joolz', 'Artipoppe'],
      datasets: [
        { label: 'Trustpilot (/5)', data: [4.0, 3.1, null], backgroundColor: ['#e6394633', '#6366f133', '#f59e0b33'], borderColor: ['#e63946', '#6366f1', '#f59e0b'], borderWidth: 2, borderRadius: 4, yAxisID: 'y1' },
        { label: 'Sentiment Score', data: [0.65, 0.20, 0.17], backgroundColor: ['#e63946aa', '#6366f1aa', '#f59e0baa'], borderColor: ['#e63946', '#6366f1', '#f59e0b'], borderWidth: 2, borderRadius: 4, yAxisID: 'y2' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
      scales: {
        y1: { type: 'linear', position: 'left', min: 0, max: 5, title: { display: true, text: 'Trustpilot ★', font: { size: 11 } }, ticks: { font: { size: 11 } }, grid: { color: '#f0f0f0' } },
        y2: { type: 'linear', position: 'right', min: 0, max: 1, title: { display: true, text: 'Sentiment (0–1)', font: { size: 11 } }, ticks: { font: { size: 11 } }, grid: { display: false } },
        x: { ticks: { font: { size: 12 } }, grid: { display: false } }
      }
    }
  });
}

function drawCompStrollerChart() {
  const ctx = document.getElementById('compStrollerChart');
  if (!ctx || charts.compStroller) return;
  charts.compStroller = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Bugaboo', 'Wildbird', 'UPPAbaby', 'BabyZen/Stokke', 'Nuna', 'Maxi-Cosi', 'Cybex', 'Joolz'],
      datasets: [{
        label: 'Sentiment Score',
        data: [0.65, null, 0.65, 0.60, 0.40, 0.57, 0.45, 0.20],
        backgroundColor: ['#e63946cc', '#10b98133', '#0ea5e9cc', '#d97706cc', '#059669cc', '#db2777cc', '#7c3aedcc', '#6366f1cc'],
        borderColor:      ['#e63946',   '#10b981',   '#0ea5e9',   '#d97706',   '#059669',   '#db2777',   '#7c3aed',   '#6366f1'],
        borderWidth: 2, borderRadius: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` Sentiment: ${c.raw !== null ? c.raw.toFixed(2) : 'N/A'}` } } },
      scales: {
        y: { min: 0, max: 1, grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 } }, title: { display: true, text: 'Sentiment Score (0–1)', font: { size: 11 }, color: '#888' } },
        x: { ticks: { font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

function drawCompCarrierChart() {
  const ctx = document.getElementById('compCarrierChart');
  if (!ctx || charts.compCarrier) return;
  charts.compCarrier = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Wildbird', 'Ergobaby', 'Tula', 'Sakura Bloom', 'Mabe', 'Artipoppe'],
      datasets: [{
        label: 'Sentiment Score',
        data: [0.75, 0.70, 0.70, 0.65, 0.48, 0.17],
        backgroundColor: ['#10b981cc', '#0891b2cc', '#ca8a04cc', '#8b5cf6cc', '#f43f5ecc', '#f59e0bcc'],
        borderColor:      ['#10b981',   '#0891b2',   '#ca8a04',   '#8b5cf6',   '#f43f5e',   '#f59e0b'],
        borderWidth: 2, borderRadius: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` Sentiment: ${c.raw.toFixed(2)}` } } },
      scales: {
        y: { min: 0, max: 1, grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 } }, title: { display: true, text: 'Sentiment Score (0–1)', font: { size: 11 }, color: '#888' } },
        x: { ticks: { font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

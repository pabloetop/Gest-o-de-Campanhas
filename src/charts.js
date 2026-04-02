// ============================================================
// ETOP — charts.js  |  Gráficos com Chart.js
// ============================================================
console.log('ETOP: charts.js carregado');

let gerenteBarChart = null;

function destroyCharts() {
  if (gerenteBarChart) { gerenteBarChart.destroy(); gerenteBarChart = null; }
}

// =====================================================
// GRÁFICO DE BARRAS: Planejado vs Vendido por Vendedor
// (Dashboard do Gerente)
// =====================================================
function renderEquipeChart(vendedores, campanhas) {
  const canvas = document.getElementById('chart-equipe');
  if (!canvas || typeof Chart === 'undefined') return;
  if (gerenteBarChart) { gerenteBarChart.destroy(); gerenteBarChart = null; }

  const ativas = campanhas.filter(c => c.status === 'ativa');
  const labels = vendedores.map(v => v.nome.split(' ')[0]);

  const planejados = vendedores.map(v =>
    ativas.reduce((a, c) => {
      const p = c.planejamentos?.[v.id];
      return a + (p ? (p.valor_planejado ?? p.planejado ?? 0) : 0);
    }, 0)
  );

  const vendidos = vendedores.map(v =>
    ativas.reduce((a, c) => {
      const p = c.planejamentos?.[v.id];
      return a + (p ? (p.valor_vendido ?? p.vendido ?? 0) : 0);
    }, 0)
  );

  const isDark = document.body.classList.contains('dark');
  const textColor   = isDark ? '#94A3B8' : '#6B7280';
  const gridColor   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';

  gerenteBarChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Planejado',
          data: planejados,
          backgroundColor: 'rgba(98,70,234,0.25)',
          borderColor: 'rgba(98,70,234,0.8)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: 'Vendido',
          data: vendidos,
          backgroundColor: 'rgba(0,209,141,0.35)',
          borderColor: 'rgba(0,209,141,0.9)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: { family: 'DM Sans', size: 11 },
            boxWidth: 12,
            boxHeight: 12,
          }
        },
        tooltip: {
          backgroundColor: isDark ? '#1C1C2E' : '#FFFFFF',
          titleColor: isDark ? '#F8F9FD' : '#1A1A2E',
          bodyColor: textColor,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: ctx => ` ${(ctx.raw || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { family: 'DM Sans', size: 11 } },
          grid: { display: false },
          border: { display: false }
        },
        y: {
          ticks: {
            color: textColor,
            font: { family: 'DM Sans', size: 10 },
            callback: v => v >= 1000 ? `R$${(v/1000).toFixed(0)}k` : `R$${v}`
          },
          grid: { color: gridColor },
          border: { display: false }
        }
      }
    }
  });
}

// =====================================================
// MINI DONUT: Progresso de uma campanha individual
// =====================================================
function renderMiniDonut(canvasId, pct, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return;
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [Math.min(pct, 100), Math.max(100 - pct, 0)],
        backgroundColor: [color, 'rgba(0,0,0,0.06)'],
        borderWidth: 0,
        circumference: 240,
        rotation: -120,
      }]
    },
    options: {
      responsive: false,
      cutout: '78%',
      plugins: { legend: { display: false }, tooltip: { enabled: false } }
    }
  });
}

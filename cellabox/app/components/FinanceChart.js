'use client'

import { useEffect, useRef, useState } from 'react';
import styles from './finance.module.css';

export default function FinanceChart({ series }) {
  const canvasRef = useRef();
  const chartRef = useRef(null);
  const [chartAvailable, setChartAvailable] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!canvasRef.current) return;

      try {
        const ChartModule = await import('chart.js/auto');
        const Chart = ChartModule && (ChartModule.default || ChartModule);

        const ctx = canvasRef.current.getContext('2d');

        const labels = (series || []).map((s) => s.label);

        const data = {
          labels,
          datasets: [
            {
              label: 'Receita',
              data: (series || []).map((s) => s.receita || 0),
              borderColor: '#34a853',
              backgroundColor: 'rgba(52,168,83,0.12)',
              tension: 0.3,
              fill: true,
            },
            {
              label: 'Gastos',
              data: (series || []).map((s) => s.gastos || 0),
              borderColor: '#ea4335',
              backgroundColor: 'rgba(234,67,53,0.08)',
              tension: 0.3,
              fill: true,
            },
            {
              label: 'Lucro',
              data: (series || []).map((s) => s.lucro || 0),
              borderColor: '#8f5d43',
              backgroundColor: 'rgba(143,93,67,0.08)',
              tension: 0.3,
              fill: false,
            },
          ],
        };

        if (!mounted) return;

        if (chartRef.current) {
          try { chartRef.current.destroy(); } catch (e) {}
        }

        chartRef.current = new Chart(ctx, {
          type: 'line',
          data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top' },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.dataset.label}: R$ ${Number(context.raw || 0).toFixed(2)}`,
                },
              },
            },
            scales: { x: { grid: { display: false } }, y: { grid: { color: '#f4f4f4' } } },
          },
        });
      } catch (err) {
        console.warn('Chart.js não disponível:', err);
        if (mounted) setChartAvailable(false);
      }
    }

    init();

    return () => {
      mounted = false;
      if (chartRef.current) {
        try { chartRef.current.destroy(); } catch (e) {}
      }
    };
  }, [series]);

  if (!chartAvailable) {
    return (
      <div className={styles.chartContainer} style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div>Gráfico indisponível (instale chart.js com <strong>npm install</strong>)</div>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <canvas ref={canvasRef} />
    </div>
  );
}

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useProject } from '../context/ProjectContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const IntensityChart = () => {
  const { nodes, threadOrder, subplots } = useProject();

  const orderedNodes = threadOrder.map(id => nodes.find(n => n.id === id)).filter(Boolean);

  const getSubplotColor = (id) => subplots.find(s => s.id === id)?.color || '#94a3b8';

  const data = {
    labels: orderedNodes.map((_, i) => `Scene ${i + 1}`),
    datasets: [
      {
        label: 'Tension/Intensity',
        data: orderedNodes.map(n => n.intensity),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        pointBackgroundColor: orderedNodes.map(n => getSubplotColor(n.subplotId)),
        pointBorderColor: '#fff',
        pointRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const node = orderedNodes[context.dataIndex];
            return `Intensity: ${node.intensity} - ${node.text.substring(0, 30)}...`; // Escape backticks if needed, but in this string block it's fine.
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: {
          display: false
        },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div className="chart-container">
      <h3>Narrative Arc</h3>
      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
      <style>{`
            .chart - container {
                background: var(--bg - card);
        padding: 1rem;
        margin- top: auto; /* Push to bottom if flex column */
    border - top: 1px solid var(--border - color);
}
        .chart - wrapper {
    height: 200px;
    margin - top: 1rem;
}
        h3 {
    font - size: 1rem;
    color: var(--text - secondary);
    margin - bottom: 0.5rem;
}
`}</style>
    </div>
  );
};

export default IntensityChart;

import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './App.css';

const CPUVisualizer = ({ processes }) => {
  const colors = ['#c8c8c8', '#ffd700', '#90ee90', '#87cefa', '#ff69b4', '#ff4500'];

  // Map the data for visualization
  const processNames = processes.map((p) => `P${p.id}`);
  const responseTimes = processes.map((p) => p.responseTime);
  const completionTimes = processes.map((p) => p.ct);
  const waitingTimes = processes.map((p) => p.waitingTime);

  const data = {
    labels: processNames,
    datasets: [
      {
        label: 'Response Time',
        data: responseTimes,
        borderColor: '#1f77b4',
        backgroundColor: '#1f77b4',
        fill: false,
        pointRadius: 5,
      },
      {
        label: 'Completion Time',
        data: completionTimes,
        borderColor: '#ff7f0e',
        backgroundColor: '#ff7f0e',
        fill: false,
        pointRadius: 5,
      },
      {
        label: 'Waiting Time',
        data: waitingTimes,
        borderColor: '#2ca02c',
        backgroundColor: '#2ca02c',
        fill: false,
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="visualizer-container">
      <h3>Visualized Graph 📉 & CPU Table 💻</h3>

      {/* Process Execution Order Table */}
      <div className="process-order-table">
        <table>
          <thead>
            <tr>
              {processes.map((process, index) => (
                <th key={index} style={{ backgroundColor: colors[index % colors.length] }}>
                  {process.id === -1 ? 'CPU Idle' : `P${process.id}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {processes.map((process, index) => (
                <td key={index}>{process.burstTime}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Line Graph */}
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default CPUVisualizer;

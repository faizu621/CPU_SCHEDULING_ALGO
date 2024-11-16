import React, { useState } from 'react';
import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import './App.css';

const ProcessOrderTable = ({ schedule }) => {
  return (
    <div className="process-order-table">
      <h3>Execution Order</h3>
      <table>
        <thead>
          <tr>
            {schedule.map((item, index) => (
              <th key={index} style={{ backgroundColor: item.color }}>
                {item.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {schedule.map((item, index) => (
              <td key={index}>{item.time}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

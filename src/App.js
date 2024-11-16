import React, { useState } from 'react';
import "./App.css"

function App() {
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [isPreemptive, setIsPreemptive] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [averageCT, setAverageCT] = useState(0);
  const [averageTAT, setAverageTAT] = useState(0);

  // Handler for adding a new process
  const addProcess = (arrivalTime, burstTime) => {
    const newProcess = {
      id: `P${processes.length + 1}`,
      arrivalTime: parseInt(arrivalTime, 10),
      burstTime: parseInt(burstTime, 10),
    };
    setProcesses([...processes, newProcess]);
  };

  // Main scheduling function
  const calculateScheduling = () => {
    if (algorithm === 'FCFS' && !isPreemptive) {
      calculateFCFS();
    } else if (algorithm === 'SJF' && isPreemptive) {
      calculateSRTF();
    } else {
      alert('Invalid option for the selected algorithm and preemption mode');
    }
  };

  // Non-Preemptive FCFS Calculation
  const calculateFCFS = () => {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);

    let currentTime = 0;
    const updatedProcesses = sortedProcesses.map((process) => {
      if (currentTime < process.arrivalTime) {
        currentTime = process.arrivalTime;
      }
      const startTime = currentTime;
      const completionTime = startTime + process.burstTime;
      const turnaroundTime = completionTime - process.arrivalTime;
      const waitingTime = turnaroundTime - process.burstTime;
      const responseTime = startTime - process.arrivalTime;
      currentTime = completionTime;

      return {
        ...process,
        ct: completionTime,
        tat: turnaroundTime,
        waitingTime: waitingTime,
        responseTime: responseTime,
      };
    });

    updatedProcesses.sort((a, b) => parseInt(a.id.substring(1)) - parseInt(b.id.substring(1)));


    const totalCT = updatedProcesses.reduce((acc, p) => acc + p.ct, 0);
    const totalTAT = updatedProcesses.reduce((acc, p) => acc + p.tat, 0);

    setAverageCT((totalCT / updatedProcesses.length).toFixed(2));
    setAverageTAT((totalTAT / updatedProcesses.length).toFixed(2));
    setProcesses(updatedProcesses);
  };

  // Preemptive SRTF Calculation
  const calculateSRTF = () => {
    const processesCopy = [...processes].map(p => ({ ...p, remainingTime: p.burstTime }));
    let currentTime = 0;
    const completedProcesses = [];

    while (processesCopy.length > 0) {
      const availableProcesses = processesCopy.filter(p => p.arrivalTime <= currentTime);

      if (availableProcesses.length > 0) {
        availableProcesses.sort((a, b) => a.remainingTime - b.remainingTime);
        const currentProcess = availableProcesses[0];

        currentProcess.remainingTime -= 1;
        currentTime += 1;

        if (currentProcess.remainingTime === 0) {
          const completionTime = currentTime;
          const turnaroundTime = completionTime - currentProcess.arrivalTime;
          const waitingTime = turnaroundTime - currentProcess.burstTime;
          const responseTime = currentProcess.startTime
              ? currentProcess.startTime - currentProcess.arrivalTime
              : currentTime - currentProcess.arrivalTime;

          completedProcesses.push({
            ...currentProcess,
            ct: completionTime,
            tat: turnaroundTime,
            waitingTime: waitingTime,
            responseTime: responseTime+processes.arrivalTime,
          });

          processesCopy.splice(processesCopy.indexOf(currentProcess), 1);
        } else if (!currentProcess.startTime) {
          currentProcess.startTime = currentTime - 1;
        }
      } else {
        currentTime += 1;
      }
    }

    completedProcesses.sort((a, b) => parseInt(a.id.substring(1)) - parseInt(b.id.substring(1)));

    const totalCT = completedProcesses.reduce((acc, p) => acc + p.ct, 0);
    const totalTAT = completedProcesses.reduce((acc, p) => acc + p.tat, 0);

    setAverageCT((totalCT / completedProcesses.length).toFixed(2));
    setAverageTAT((totalTAT / completedProcesses.length).toFixed(2));
    setProcesses(completedProcesses);
  };

  return (
    <div>
      <h2>Select Your CPU Algorithm</h2>
      <select onChange={(e) => setAlgorithm(e.target.value)}>
        <option value="FCFS">FCFS (First Come First Serve)</option>
        <option value="SJF">SJF (Shortest Job First)</option>
      </select>
      
      <label>
        <input 
          type="checkbox" 
          checked={isPreemptive} 
          onChange={(e) => setIsPreemptive(e.target.checked)} 
        />
        Preemptive
      </label>

      <h3>Add Process</h3>
      <input
        type="number"
        placeholder="Arrival Time"
        id="arrivalTime"
      />
      <input
        type="number"
        placeholder="Burst Time"
        id="burstTime"
      />
      <button onClick={() => {
        const arrivalTime = document.getElementById('arrivalTime').value;
        const burstTime = document.getElementById('burstTime').value;
        if (arrivalTime && burstTime) addProcess(arrivalTime, burstTime);
      }}>Add Process</button>

      <button onClick={calculateScheduling}>Calculate Scheduling</button>

      <h3>Process Table</h3>
      <table>
        <thead>
          <tr>
            <th>Process ID</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
            <th>Completion Time</th>
            <th>Turnaround Time</th>
            <th>Waiting Time</th>
            <th>Response Time</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((process, index) => (
            <tr key={index}>
              <td>{process.id}</td>
              <td>{process.arrivalTime}</td>
              <td>{process.burstTime}</td>
              <td>{process.ct}</td>
              <td>{process.tat}</td>
              <td>{process.waitingTime}</td>
              <td>{process.responseTime}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Average Times</h3>
      <p>Average Completion Time: {averageCT}</p>
      <p>Average Turnaround Time: {averageTAT}</p>
      
    </div>
  );
}

export default App;

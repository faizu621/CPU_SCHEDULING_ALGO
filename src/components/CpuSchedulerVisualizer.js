

// src/components/CpuSchedulerVisualizer.js
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './CpuSchedulerVisualizer.css';

class Queue {
  constructor() {
    this.items = [];
  }

  // Enqueue - Adds an element to the end of the queue
  enqueue(element) {
    this.items.push(element);
  }

  // Dequeue - Removes the first element from the queue
  dequeue() {
    if (this.isEmpty()) {
      console.log("Queue is empty");
      return null;
    }
    return this.items.shift();
  }

  // Peek - Returns the first element in the queue without removing it
  peek() {
    if (this.isEmpty()) {
      console.log("Queue is empty");
      return null;
    }
    return this.items[0];
  }

  // isEmpty - Checks if the queue is empty
  isEmpty() {
    return this.items.length === 0;
  }

  // size - Returns the number of elements in the queue
  size() {
    return this.items.length;
  }

  // print - Prints the elements in the queue
  print() {
    console.log(this.items.join(" "));
  }
}

console.log("Hello, World!");


const CpuSchedulerVisualizer = () => {
  const [processes, setProcesses] = useState([]);
  const [arrivalTime, setArrivalTime] = useState('');
  const [burstTime, setBurstTime] = useState('');
  const [priority, setPriority] = useState('');
  const [algorithm, setAlgorithm] = useState('fcfs');
  const [preemptive, setPreemptive] = useState(false);
  const [visualized, setVisualized] = useState(false);
  const [avgWaitingTime, setAvgWaitingTime] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [avgCompletionTime,setAvgCompletionTime]=useState(0);
  const [avgTAT,setAvgTAT]=useState(0);
  const [timeQuantum,setTimeQuantum]=useState(0);

  const handleAddProcess = () => {
    const newProcess = {
      id: `P${processes.length + 1}`,
      arrivalTime: parseInt(arrivalTime),
      burstTime: parseInt(burstTime),
      priority: priority ? parseInt(priority) : null,
      responseTime: -1, // To detect if the process has started
      completionTime: 0,
      waitingTime: 0,
      tat: 0,
      originalBurstTime: parseInt(burstTime), // Save for calculations
    };
    setProcesses([...processes, newProcess]);
    setArrivalTime('');
    setBurstTime('');
    setPriority('');
  };

  const handleDeleteProcess = (idx) => {
    // Remove the object immutably by filtering
    const updatedProcesses = processes.filter(item => item.id !== idx);
    setProcesses(updatedProcesses); // Update the state
  };

  const calculateScheduling = () => {

    for(let i=0;i<processes.length;i++){
      processes[i].responseTime=-1;
    }
    let sortedProcesses = [];
    let time = 0;
    let completed = 0;
    let totalWaitingTime = 0;
    let totalResponseTime = 0;
    let totalCompletionTime=0;
    let totalTAT=0;

    // Implement different algorithms
    switch (algorithm) {
      case 'fcfs':
        sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
        sortedProcesses.forEach(process => {
          time = Math.max(time, process.arrivalTime);
          if (process.responseTime === -1) {
            process.responseTime = time;
            totalResponseTime += process.responseTime;
          }
          process.completionTime = time + process.burstTime;
          process.tat = process.completionTime - process.arrivalTime;
          process.waitingTime = process.tat - process.originalBurstTime;
          totalWaitingTime += process.waitingTime;
          time += process.burstTime;
          totalTAT+=process.tat;
          totalCompletionTime+=process.completionTime;
          completed++;
        });
        break;

      case 'sjf':{
        sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
          let ans=[];
          let arr=[];
          arr.push(sortedProcesses[0]);
          let i=1;
          while(i<sortedProcesses.length && sortedProcesses[i].arrivalTime===arr[0].arrivalTime){
            arr.push(sortedProcesses[i]);
            i++;
          }

          while(arr.length>0){
            let process=arr[0];
            arr.shift();
            time = Math.max(time, process.arrivalTime);
            if (process.responseTime === -1) {
              process.responseTime = time;
              totalResponseTime += process.responseTime;
            }
            process.completionTime = time + process.burstTime;
            process.tat = process.completionTime - process.arrivalTime;
            process.waitingTime = process.tat - process.originalBurstTime;
            totalWaitingTime += process.waitingTime;
            time += process.burstTime;
            totalTAT+=process.tat;
            totalCompletionTime+=process.completionTime;
            completed++;
            
            while(i<sortedProcesses.length && sortedProcesses[i].arrivalTime<=time){
              arr.push(sortedProcesses[i]);
              i++;
            }
            arr.sort((a,b) => a.burstTime - b.burstTime);
            ans.push(process);
          }
          sortedProcesses=ans;
          break;
        }
        
      case 'srtf':{
          sortedProcesses = [...processes];
          
          while (completed < processes.length) {
            let idx = -1;
            let minBurst = Number.MAX_VALUE;
            for (let i = 0; i < processes.length; i++) {
              if (
                processes[i].arrivalTime <= time &&
                processes[i].burstTime > 0 &&
                processes[i].burstTime < minBurst
              ) {
                minBurst = processes[i].burstTime;
                idx = i;
              }
            }
            if (idx !== -1) {
              if (processes[idx].responseTime === -1) {
                processes[idx].responseTime = time+1;
                totalResponseTime += processes[idx].responseTime;
              }
              processes[idx].burstTime -= 1;
              time += 1;
              if (processes[idx].burstTime === 0) {
                processes[idx].completionTime = time;
                processes[idx].tat = processes[idx].completionTime - processes[idx].arrivalTime;
                processes[idx].waitingTime = processes[idx].tat - processes[idx].originalBurstTime;
                totalWaitingTime += processes[idx].waitingTime;
                completed++;
              }
            } else {
              time++;
            }
          }
          break;
        }  

      case 'rr':
        const quantum = timeQuantum; // Define your time quantum
        sortedProcesses = [...processes].sort((a,b)=>a.arrivalTime-b.arrivalTime);
        let queue = [];
        let index = 0;
        while (completed <sortedProcesses.length) {
          while (index < sortedProcesses.length && sortedProcesses[index].arrivalTime <= time) {
            queue.push(index);
            index++;
          }
          if (queue.length > 0) {
            const idx = queue.shift();
            const execTime = Math.min(quantum, sortedProcesses[idx].burstTime);
            if (sortedProcesses[idx].responseTime === -1) {
              sortedProcesses[idx].responseTime = time +1;
              totalResponseTime += sortedProcesses[idx].responseTime;
            }
            time += execTime;
            sortedProcesses[idx].burstTime -= execTime;
            if (sortedProcesses[idx].burstTime > 0) {
              queue.push(idx);
            } else {
              sortedProcesses[idx].completionTime = time;
              sortedProcesses[idx].tat = sortedProcesses[idx].completionTime - sortedProcesses[idx].arrivalTime;
              sortedProcesses[idx].waitingTime = sortedProcesses[idx].tat - sortedProcesses[idx].originalBurstTime;
              totalWaitingTime += sortedProcesses[idx].waitingTime;
              completed++;
            }
          } else {
            time++;
          }
        }
        break;
      case 'ljf':{
        sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
          let ans=[];
          let arr=[];
          arr.push(sortedProcesses[0]);
          let i=1;
          while(i<sortedProcesses.length && sortedProcesses[i].arrivalTime===arr[0].arrivalTime){
            arr.push(sortedProcesses[i]);
            i++;
          }

          while(arr.length>0){
            let process=arr[0];
            arr.shift();
            time = Math.max(time, process.arrivalTime);
            if (process.responseTime === -1) {
              process.responseTime = time;
              totalResponseTime += process.responseTime;
            }
            process.completionTime = time + process.burstTime;
            process.tat = process.completionTime - process.arrivalTime;
            process.waitingTime = process.tat - process.originalBurstTime;
            totalWaitingTime += process.waitingTime;
            time += process.burstTime;
            totalTAT+=process.tat;
            totalCompletionTime+=process.completionTime;
            completed++;
            
            while(i<sortedProcesses.length && sortedProcesses[i].arrivalTime<=time){
              arr.push(sortedProcesses[i]);
              i++;
            }
            arr.sort((a,b) => b.burstTime - a.burstTime);
            ans.push(process);
          }
          sortedProcesses=ans;
          break;
      }  
      case 'lrtf':{
        sortedProcesses = [...processes];
          
          while (completed < processes.length) {
            let idx = -1;
            let minBurst = Number.MAX_VALUE;
            for (let i = 0; i < processes.length; i++) {
              if (
                processes[i].arrivalTime <= time &&
                processes[i].burstTime > 0 &&
                processes[i].burstTime < minBurst
              ) {
                minBurst = processes[i].burstTime;
                idx = i;
              }
            }
            if (idx !== -1) {
              if (processes[idx].responseTime === -1) {
                processes[idx].responseTime = time+1;
                totalResponseTime += processes[idx].responseTime;
              }
              processes[idx].burstTime -= 1;
              time += 1;
              if (processes[idx].burstTime === 0) {
                processes[idx].completionTime = time;
                processes[idx].tat = processes[idx].completionTime - processes[idx].arrivalTime;
                processes[idx].waitingTime = processes[idx].tat - processes[idx].originalBurstTime;
                totalWaitingTime += processes[idx].waitingTime;
                completed++;
              }
            } else {
              time++;
            }
          }
        break;
      }
      case 'priority':{
        break;
      }
      default:
        break;
    }
    sortedProcesses.sort((a, b) => parseInt(a.id.substring(1)) - parseInt(b.id.substring(1)));
    setProcesses(sortedProcesses);
    setAvgWaitingTime(totalWaitingTime / processes.length);
    setAvgResponseTime(totalResponseTime / processes.length);
    setAvgCompletionTime(totalCompletionTime/processes.length);
    setAvgTAT(totalTAT/processes.length);
    setVisualized(true);
  };

  const chartData = {
    labels: processes.map((process) => process.id),
    datasets: [
      {
        label: 'Response Time',
        data: processes.map((process) => process.responseTime),
        borderColor: 'blue',
        fill: false,
      },
      {
        label: 'Completion Time',
        data: processes.map((process) => process.completionTime),
        borderColor: 'green',
        fill: false,
      },
      {
        label: 'Waiting Time',
        data: processes.map((process) => process.waitingTime),
        borderColor: 'red',
        fill: false,
      },
    ],
  };

  return (
    <div className="scheduler-container">
      <h1>CPU Scheduling Algorithm Visualizer</h1>
      <div className="input-section">
        <div>
          <h3>Select Your CPU Algorithm</h3>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="algorithm"
                value="fcfs"
                checked={algorithm === 'fcfs'}
                onChange={(e) => setAlgorithm(e.target.value)}
              /> FCFS (First Come First Serve)
            </label>
            <label>
              <input
                type="radio"
                name="algorithm"
                value="sjf"
                checked={algorithm === 'sjf'}
                onChange={(e) => setAlgorithm(e.target.value)}
              /> SJF (Shortest Job First)
            </label>
            <label>
              <input
                type="radio"
                name="algorithm"
                value="srtf"
                checked={algorithm === 'srtf'}
                onChange={(e) => setAlgorithm(e.target.value)}
              /> SRTF (Shortest Remaining Time First)
            </label>

            <label>
              <input
                type="radio"
                name="algorithm"
                value="ljf"
                checked={algorithm === 'ljf'}
                onChange={(e) => setAlgorithm(e.target.value)}
              /> LJF (Longest Job First )
            </label>

            <label>
              <input
                type="radio"
                name="algorithm"
                value="lrtf"
                checked={algorithm === 'lrtf'}
                onChange={(e) => setAlgorithm(e.target.value)}
              /> LRTF (Longest Remaining Time First)
            </label>

            <label>
              <input
                type="radio"
                name="algorithm"
                value="rr"
                checked={algorithm === 'rr'}
                onChange={(e) => setAlgorithm(e.target.value)}
              /> RRS (Round Robin Scheduling)
            </label>
            
            <label>
              <input
                type="radio"
                name="algorithm"
                value="priority"
                checked={algorithm === 'priority'}
                onChange={(e) => setAlgorithm(e.target.value)}
              /> Priority  Scheduling
            </label>
            
            
          </div>
          {algorithm === 'priority' && (
            <label>
              <input
                type="checkbox"
                checked={preemptive}
                onChange={() => setPreemptive(!preemptive)}
              /> Enable Preemption
            </label>
          )}

          {algorithm === 'rr' && (
            <label>
              <input
                type="number"
                placeholder='Time Quantum'
                onChange={(e) => setTimeQuantum(e.target.value)}
              /> 
            </label>
          )}

          {}
          <h3>Enter Process Details</h3>
          <input
            type="number"
            placeholder="Arrival Time"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
          />
          <input
            type="number"
            placeholder="Burst Time"
            value={burstTime}
            onChange={(e) => setBurstTime(e.target.value)}
          />
          {algorithm === 'priority' && (
            <input
              type="number"
              placeholder="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            />
          )}
          <button className="add-task" onClick={handleAddProcess}>Add Task</button>
          <button className="visualize" onClick={calculateScheduling}>Visualize</button>
        </div>
        <div>
          <h3>CPU Scheduling Table</h3>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Process ID</th>
                <th>Arrival Time</th>
                <th>Burst Time</th>
                <th>Response Time</th>
                <th>TAT</th>
                <th>CT</th>
                <th>Waiting Time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process, index) => (
                <tr key={index}>
                  <td>{process.id}</td>
                  <td>{process.arrivalTime}</td>
                  <td>{process.originalBurstTime}</td>
                  <td>{process.responseTime}</td>
                  <td>{process.tat}</td>
                  <td>{process.completionTime}</td>
                  <td>{process.waitingTime}</td>
                  <td><button onClick={()=>handleDeleteProcess(process.id)}>delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="average-times">
            <p>Average Waiting Time: {avgWaitingTime.toFixed(2)}</p>
            <p>Average Response Time: {avgResponseTime.toFixed(2)}</p>
            <p>Average Completion Time: {avgCompletionTime.toFixed(2)}</p>
            <p>Average TAT Time: {avgTAT.toFixed(2)}</p>

          </div>
        </div>
      </div>
      {visualized && (
        <div className="chart-section">
          <h3>Visualized Graph & CPU Table</h3>
          <Line data={chartData} />
        </div>
      )}
    </div>
  );
};

export default CpuSchedulerVisualizer;


/**
 * OpsLift - Elevator Operations & Capacity Dashboard
 * Executive Overview Dataset (Simulated Operational Data)
 */

const OPS_DATA = {
  metadata: {
    building: "Demo Institutional Building",
    elevators: "3 Elevators",
    datasetType: "Simulated Operational Data",
    timeGranularity: "5-minute intervals",
    serviceCapacity: 45, // pax / 5 min
  },
  
  // Executive Overview 4 Primary KPIs
  executiveKpis: {
    avgWaitingTime: 24.4,         // sec
    elevatorUtilization: 63.0,    // %
    peakDemand: 47,               // pax / 5 min
    bottleneckIntervals: 39       // intervals
  },

  // Traffic Period Aggregations for Secondary Bar Chart
  periodDemand: [
    { period: 'Morning Peak', demand: 37.4, timeRange: '08:30 - 09:30', isPeak: true },
    { period: 'Class Change', demand: 27.8, timeRange: '10:45 - 11:15', isPeak: false },
    { period: 'Normal Hours', demand: 12.2, timeRange: 'Steady Flow', isPeak: false },
    { period: 'Lunch Peak', demand: 36.2, timeRange: '12:30 - 13:45', isPeak: true },
    { period: 'Post-Lunch', demand: 18.5, timeRange: '14:00 - 15:15', isPeak: false },
    { period: 'Evening Peak', demand: 33.6, timeRange: '17:00 - 18:15', isPeak: true }
  ],

  // 132 Five-Minute Interval Records from 08:00 to 19:00
  intervals: []
};

// Generate realistic 5-minute time series
(function generateIntervalData() {
  const startHour = 8;
  const endHour = 19;
  const capacity = OPS_DATA.metadata.serviceCapacity;

  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += 5) {
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const timeVal = h + m / 60;

      let baseArrival = 12;

      // Morning Class Peak: 08:30 - 09:30 (Reaches 47)
      if (timeVal >= 8.5 && timeVal <= 9.6) {
        const peakFactor = Math.sin(((timeVal - 8.5) / 1.1) * Math.PI);
        baseArrival = 18 + peakFactor * 29;
      }
      // Mid-Morning Class Change: 10:45 - 11:15
      else if (timeVal >= 10.75 && timeVal <= 11.25) {
        const peakFactor = Math.sin(((timeVal - 10.75) / 0.5) * Math.PI);
        baseArrival = 16 + peakFactor * 16;
      }
      // Lunch Peak: 12:30 - 13:45 (Reaches 43)
      else if (timeVal >= 12.5 && timeVal <= 13.75) {
        const peakFactor = Math.sin(((timeVal - 12.5) / 1.25) * Math.PI);
        baseArrival = 16 + peakFactor * 27;
      }
      // Post-Lunch / Afternoon Transition: 15:15 - 15:45
      else if (timeVal >= 15.25 && timeVal <= 15.75) {
        const peakFactor = Math.sin(((timeVal - 15.25) / 0.5) * Math.PI);
        baseArrival = 14 + peakFactor * 17;
      }
      // Evening Peak: 17:00 - 18:15 (Reaches 41)
      else if (timeVal >= 17.0 && timeVal <= 18.25) {
        const peakFactor = Math.sin(((timeVal - 17.0) / 1.25) * Math.PI);
        baseArrival = 15 + peakFactor * 26;
      }
      // Steady normal hours
      else {
        const pseudoNoise = (Math.sin(timeVal * 13.7) * 2.2 + Math.cos(timeVal * 7.1) * 1.8);
        baseArrival = 12 + pseudoNoise;
      }

      const demand = Math.max(6, Math.min(47, Math.round(baseArrival * 10) / 10));

      let periodLabel = 'Normal Hours';
      if (timeVal >= 8.5 && timeVal <= 9.6) periodLabel = 'Morning Peak';
      else if (timeVal >= 10.75 && timeVal <= 11.25 || (timeVal >= 15.25 && timeVal <= 15.75)) periodLabel = 'Class Change';
      else if (timeVal >= 12.5 && timeVal <= 13.75) periodLabel = 'Lunch Peak';
      else if (timeVal > 13.75 && timeVal < 15.25) periodLabel = 'Post-Lunch';
      else if (timeVal >= 17.0 && timeVal <= 18.25) periodLabel = 'Evening Peak';

      OPS_DATA.intervals.push({
        time: timeStr,
        timeVal: timeVal,
        demand: demand,
        capacity: capacity,
        period: periodLabel,
        isOverCapacity: demand > capacity
      });
    }
  }
})();

# OpsLift – Elevator Operations & Capacity Dashboard

**Academic Course Project:** Operations Management (Term 2)  
**Target Facility:** Great Lakes – Academic Block A (4-Elevator Bank)  
**Current Phase:** Page 1 – Executive Overview  

---

## 🎯 Executive Overview (Page 1)

OpsLift is an enterprise operational dashboard designed for facility and operations managers to assess elevator system capacity, passenger arrival demand, lobby queues, and operational bottlenecks within 20–30 seconds.

The application is grounded strictly in **Operations Management (OM) concepts** from the course syllabus, without extraneous AI/ML or financial ROI buzzwords.

---

## 📊 Core Operations Management Metrics

| Operational Metric | Notation | Dashboard Value | Operations Management Formula / Definition |
| :--- | :---: | :---: | :--- |
| **Average Arrival Rate** | $\lambda$ | **19.9 pax / 5 min** | Passenger demand entering elevator landing lobbies per 5-minute interval. |
| **Service Rate** | $\mu$ | **45.0 pax / 5 min** | Maximum design transit throughput of the 4-elevator bank per 5-minute interval. |
| **Capacity Utilization** | $U$ | **63.0%** | $\text{Capacity Used} \div \text{Best Operating Level}$ (where BOL = 38 pax / 5 min). |
| **Average Waiting Time** | $W_q$ | **24.4 sec** | Mean passenger delay waiting in queue prior to boarding car. |
| **Peak System Load** | $\rho_{\text{peak}}$ | **104.4%** | $\text{Peak Arrival Rate} \div \text{Service Rate}$ (47 pax vs 45 capacity $\to$ Capacity Warning). |
| **Bottleneck Intervals** | — | **39 intervals** | Operational intervals requiring attention where load reaches or exceeds capacity pressure. |

---

## 📈 Visualizations Grounded in OM Theory

1. **Demand vs Service Capacity (Time-Series)**
   - Tracks 132 five-minute operational intervals across the operating day (08:00 to 19:00).
   - Identifies specific peak intervals (e.g., Morning Peak 08:30–10:00, Lunch Peak 12:30–14:00, Evening Peak 17:00–18:30) where passenger arrival rate $\lambda$ approaches or exceeds available service capacity $\mu$.
   - Highlights the **Best Operating Level (BOL = 38 pax / 5 min)** and the **Service Capacity Threshold ($\mu = 45$ pax / 5 min)**.

2. **Waiting Time vs System Load (Queuing Congestion Curve)**
   - Demonstrates the non-linear relationship between System Load ($\rho = \lambda / \mu$) and Average Waiting Time ($W_q$).
   - Shows rapid queue escalation as system utilization exceeds 85–90% toward and beyond 100%.

---

## 🚦 Operational Status Categorization

- 🟢 **Normal Flow** (70.5% of day / 93 intervals): Low utilization ($\rho < 75\%$) and smooth passenger movement.
- 🟡 **Capacity Pressure** (18.2% of day / 24 intervals): Demand approaching available service capacity ($75\% \le \rho < 95\%$).
- 🔴 **Bottleneck** (11.4% of day / 15 intervals): Demand exceeds or critically approaches service capacity ($\rho \ge 95\%$).

---

## 💡 Executive Management Insight & Recommendation

> **Management Insight:**  
> *"The elevator system operates within available capacity during most periods. However, selected peak intervals experience high system load, increasing passenger waiting time and creating potential bottlenecks."*

> **Recommended Action:**  
> *"Investigate peak-period passenger flow and capacity utilization before considering additional physical elevator capacity."*

---

## 🗺️ Project Navigation Roadmap

- [x] **Page 1: Executive Overview** (Built & Active)
- [ ] **Page 2: Capacity Analysis** (Upcoming)
- [ ] **Page 3: Traffic & Flow** (Upcoming)
- [ ] **Page 4: Floor Analysis** (Upcoming)
- [ ] **Page 5: Elevator Performance** (Upcoming)
- [ ] **Page 6: Decision Support** (Upcoming)
- [ ] **Page 7: Great Lakes Academic Block A** (Upcoming)
- [ ] **Page 8: Data Management** (Upcoming)

---

## 🚀 How to Run

1. Open `index.html` directly in any modern browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
2. All styling, charts (via Chart.js CDN), and dataset interactivity are bundled and run instantly with zero build step required.

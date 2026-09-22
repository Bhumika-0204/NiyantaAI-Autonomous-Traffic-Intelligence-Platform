# Niyanta AI Architecture Documentation

## 1. Executive Summary & Core Engineering Paradigm

**Niyanta AI** is an enterprise-grade, distributed AI-powered API Gateway & Security Platform. It protects upstream backend services from congestion, DDoS spikes, and erratic traffic through the real-time application of **Reinforcement Learning (PyTorch PPO)**, **Redis-backed distributed Token Bucket rate limiting**, **Scikit-Learn Isolation Forest DDoS Anomaly Scoring**, **GenAI RAG & Agentic AI Reasoning**, **WAF Payload Inspection**, **Bot Fingerprinting**, **Global Load Balancer Multi-Region Anycast Router**, **Chaos Engineering Studio**, **GraphQL Depth & Complexity Guard**, **Threat Intelligence Feeds**, and **20 computer networking protection mechanisms** implemented directly at the application gateway layer.

---

## 2. Core Machine Learning & AI Components

### 2.1 PyTorch PPO Reinforcement Learning Policy Engine
* **File**: `backend/app/ml/ppo_agent.py`
* **Architecture**: Dual-Head Actor-Critic Multi-Layer Perceptron (`State(4) → 64 → 64 → Action(3)`).
* **State Space**: `[cpu, latency_ms, packet_loss, request_rate]`.
* **Action Space**: `0: ALLOW`, `1: THROTTLE`, `2: BLOCK`.
* **Reward Function**:
  $$R(s,a) = (0.01 \times \text{Throughput}) - (0.05 \times \text{SLA\_Latency\_Penalty}) - (100 \times \text{Crash\_Penalty})$$

### 2.2 Scikit-Learn Isolation Forest DDoS Anomaly Scorer
* **File**: `backend/app/ml/anomaly_detector.py`
* **Ensemble Config**: 100 Decision Tree Estimators with a \(0.05\) contamination factor.
* **Feature Vector**: 5 dimensions (`cpu`, `latency_ms`, `packet_loss`, `request_rate`, `payload_bytes`).
* **Sub-Millisecond Inference**: Evaluates streaming traffic spikes in \(< 0.8\text{ ms}\) on Kafka streams.

### 2.3 Autonomous Agentic Multi-Agent System (MAS)
* **`MonitoringAgent`**: Continuous sensing of host CPU, memory, bandwidth, and packet rates.
* **`PolicyAgent`**: Real-time evaluation of PPO RL policy actions and anomaly thresholds.
* **`ExecutionAgent`**: Gateway rate enforcement & **Online ML Feedback Loop** ("Flag False Positive").

### 2.4 GenAI ChromaDB RAG Knowledge Engine & Query Terminal
* **File**: `backend/app/services/rag_service.py` & `backend/app/services/llm_service.py`
* **Vector Store**: ChromaDB persistent vector collection indexing system architecture & threat docs.
* **Telemetry API**: `GET /api/v1/ai/model-status` returns model architectures, loss metrics, and agent states.
* **Frontend UI**: High-Level AI Hub on `AiInsights.jsx` with natural language RAG knowledge terminal.

---

## 3. Computer Networking & Security Protection Stack (20 Mechanisms)

1. **WAF Payload Inspector**: SQLi, XSS, and Command Injection regex scanner (`waf_scanner.py`).
2. **Bot Fingerprinting (JA4)**: Header cadence & `User-Agent` score inspector (`bot_detector.py`).
3. **GraphQL Depth & Complexity Guard**: AST query complexity analyzer restricting depth \(\le 7\) and complexity score \(\le 100\) (`graphql_analyzer.py`).
4. **gRPC & HTTP/2 Inspector**: Multiplexed stream cap (max 100 concurrent streams) & Protobuf frame inspector (`grpc_inspector.py`).
5. **Threat Intelligence Feeds**: Live reputational lookup against AbuseIPDB, AlienVault OTX, Tor Exits (`threat_intel.py`).
6. **Global Load Balancer (GLB)**: Multi-Region Anycast routing score engine for US East, EU West, AP South Mumbai (`glb_router.py`).
7. **Chaos Engineering Studio**: Fault injection engine simulating latency, packet loss, and Redis outages (`ChaosStudio.jsx`).
8. **Downstream Circuit Breakers**: Circuit breaker pattern (`CLOSED`, `OPEN`, `HALF-OPEN`) per route (`circuit_breaker.py`).
9. **RED (Random Early Detection)**: Probabilistic drops between 50–85% queue CPU load (`network_protection.py`).
10. **CoDel (Controlled Delay)**: Queue delay monitoring emitting `X-Niyanta-CoDel: congested` header (`network_protection.py`).
11. **Leaky Bucket Smoothing**: Output rate smoothing absorbing burst spikes (`network_protection.py`).
12. **Slow Loris Prevention**: 30s request timeout enforcement (`network_protection.py`).
13. **AIMD Adaptive Throttle**: Additive Increase Multiplicative Decrease rate tuning (`network_protection.py`).
14. **RFC 6585 Headers**: Standard `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After` headers (`gateway.py`).
15. **Tiered API Key Quotas**: Free (100/min), Pro (5k/min), Enterprise (50k/min) plans (`gateway.py`).
16. **Shadow Mode**: Silent AI risk evaluation without blocking production requests (`gateway.py`).
17. **Connection Draining**: SIGTERM connection draining signal (`network_protection.py`).
18. **Real-Time Alert Webhooks**: Webhook dispatchers for Slack, Discord, and Telegram (`alert_service.py`).
19. **SIEM Log Exporter**: Structured CEF and JSON security log exporter for Datadog / Splunk (`siem_exporter.py`).
20. **Executive Audit Reports**: SOC2 / ISO27001 CSV and JSON audit report downloads (`routes.py`).

---

## 4. Operational & Testing Command Playbook

### 1. Launch Backend API Gateway
```bash
cd backend && ..\.venv\Scripts\activate && python -m uvicorn app.main:app --port 8000
```

### 2. Launch React Control Dashboard
```bash
cd frontend && npm run dev
```

### 3. Run Automated Automated Verification Suite
```bash
python scratch/test_phase3_features.py
```
   

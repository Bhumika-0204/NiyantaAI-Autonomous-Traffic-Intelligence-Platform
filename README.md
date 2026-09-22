# Niyanta AI 

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg) ![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

**Niyanta AI** is an enterprise-grade, distributed AI-powered API Gateway & Security Platform. It protects upstream backend services from congestion, DDoS spikes, and erratic traffic through the real-time application of **Reinforcement Learning (PPO)**, **Redis-backed distributed Token Bucket rate limiting**, **WAF Payload Inspection**, **Bot Fingerprinting**, **Global Load Balancer Multi-Region Anycast Router**, **Chaos Engineering Studio**, **GraphQL Depth & Complexity Guard**, **Threat Intelligence Feeds**, and **20 computer networking protection mechanisms** implemented directly at the application gateway layer.

---

## 🧠 AI & Machine Learning Suite

| Component | Technology | Purpose |
|:---|:---|:---|
| Congestion Prediction | PPO Reinforcement Learning (PyTorch) | Dynamic allow/throttle/block decisions |
| DDoS Detection | Isolation Forest (Scikit-Learn) | Unsupervised anomaly scoring |
| Online Feedback Loop | Live Weight Tuning Engine | "Flag False Positive" live unblocking & model calibration |
| Explainability | ChromaDB + OpenAI RAG + SHAP | Human-readable audit logs |
| Attack Simulation | What-If Replay Studio | Dynamic policy scenario simulation |
| Chaos Engineering | Fault Injection Engine | Latency, packet loss & Redis outage auto-healing verification |
| MLOps Lifecycle | MLflow | Versioning, canary deploy, rollback |

---

## 🛡️ Computer Networking & Enterprise Security Stack (20 Mechanisms)

### Layer 7 — Application, WAF & Next-Gen Layer
| # | Mechanism | Description |
|:--|:---|:---|
| 1 | **WAF Payload Inspector** | Real-time regex & heuristic inspection for SQL Injection (SQLi), Cross-Site Scripting (XSS), and Command Injection. |
| 2 | **Bot Fingerprinting (JA4)** | Header order, `User-Agent`, and `Sec-Ch-UA` analysis to isolate automated scripts (`curl`, `python-requests`, `Puppeteer`) from human web browsers. |
| 3 | **GraphQL Depth & Complexity Guard** | AST complexity analyzer that restricts query depth (max 7) and complexity score (max 100) to block recursive GraphQL DoS attacks. |
| 4 | **gRPC & HTTP/2 Inspector** | Stream concurrency enforcer (max 100 multiplexed streams) and Protobuf frame boundary inspector to prevent HTTP/2 Rapid Reset attacks. |
| 5 | **Threat Intelligence Feeds** | Live reputation scoring with blocklist lookup against AbuseIPDB, AlienVault OTX, and Tor Exit Node databases. |
| 6 | **Slow Loris Prevention** | Abort connections that don't complete headers within 30s. Prevents thread exhaustion from slow HTTP attacks. |
| 7 | **AIMD Adaptive Throttle** | Additive Increase Multiplicative Decrease. Halves rate allocation when latency > 500ms, grows it additively when fast. |
| 8 | **RFC 6585 Rate Headers** | Standardized response headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`). |
| 9 | **Tiered API Key Quotas** | Scoped quotas per API plan (Free Tier: 100 req/min, Pro Tier: 5,000 req/min, Enterprise Tier: 50,000 req/min). |
| 10 | **Shadow Mode (Dark Launch)**| Silent AI risk scoring mode that evaluates traffic without blocking production users. |
| 11 | **Connection Draining Signal** | On SIGTERM, sets a drain flag returning `503 + Retry-After` for new connections while completing existing ones. |

### Layer 4 & Multi-Region Global Routing
| # | Mechanism | Description |
|:--|:---|:---|
| 12 | **Global Load Balancer (GLB)** | Multi-Region Anycast routing score engine that continuously selects the lowest latency & healthiest cloud ingress region (US East, EU West, AP South Mumbai). |
| 13 | **Chaos Engineering Studio** | Simulated fault injection engine (artificial latency, packet loss, Redis outage) to verify automated circuit breaker recovery. |
| 14 | **Downstream Circuit Breaker** | Circuit Breaker pattern (`CLOSED`, `OPEN`, `HALF-OPEN`) per endpoint route. Trips when error rate > 50% or latency > 2000ms to shield databases. |
| 15 | **RED (Random Early Detection)** | Probabilistically drops packets as queue load rises between 50–85% CPU, triggering sender-side congestion control before queue overflow. |
| 16 | **CoDel (Controlled Delay)** | Measures per-request queue sojourn time. Emits `X-Niyanta-CoDel: congested` header when delay > 5ms (Google standard). Prevents bufferbloat. |
| 17 | **Leaky Bucket Smoothing** | Maintains a constant output drain rate to the upstream service regardless of token bucket burst allowance. Absorbs thundering herds. |

### Enterprise SIEM & Compliance Reporting
| # | Mechanism | Description |
|:--|:---|:---|
| 18 | **Real-Time Alert Webhooks** | Automated webhook dispatchers for Slack, Discord, and Telegram when CPU > 80% or DDoS detected. |
| 19 | **SIEM Log Exporter** | Structured CEF (Common Event Format - Splunk) and JSON (Datadog/Syslog) security log exporter. |
| 20 | **One-Click Audit Reports** | Executive CSV and JSON compliance report download (SOC2 / ISO27001). |

---

## 🏗️ Architecture Summary

```
[Client] → [WafScannerMiddleware] → [ZeroTrustMiddleware] → [NetworkProtectionMiddleware] → [TrafficGatewayMiddleware]
                ↓                          ↓                           ↓                           ↓
          SQLi/XSS/Cmd           HMAC / JWT Validation        RED / CoDel Queueing         Token Bucket Rate Limiter
          Bot Fingerprint        Replay Protection            Leaky Bucket Drain           PPO RL Policy Inference
          GraphQL Guard                                       gRPC Stream Cap              Circuit Breaker Manager
          Threat Intel Lookups                                Shadow Mode Evaluator
```

---

## 💻 Full Tech Stack

### Core System & Security
- **Framework**: `FastAPI` (Python 3.10+, fully async)
- **State Store**: `Redis` Cluster + atomic Lua scripts
- **Event Streaming**: `Apache Kafka`
- **Security Protocols**: `Zero Trust JWT/HMAC`, `WAF Regex Engine`, `JA4 Bot Fingerprinter`, `GraphQL Depth Guard`, `gRPC Protocol Inspector`
- **Global Routing**: `Multi-Region GLB Anycast Router`

### Machine Learning & Analytics
- **RL Agent**: `PyTorch PPO`
- **Anomaly Detection**: `Scikit-Learn Isolation Forest`
- **Explainability**: `ChromaDB`, `OpenAI`, `SHAP`
- **Simulation & Resilience**: What-If Attack Replay Engine, Chaos Engineering Studio

---

## ⚙️ Setup & Testing Instructions

### 1. Run Automated Live Test Suite
```bash
# Start Backend
cd backend && ..\.venv\Scripts\activate && python -m uvicorn app.main:app --port 8000

# Run Phase 3 Automated Verification Test Suite
python scratch/test_phase3_features.py
```

### 2. Access Web Control Dashboard
- **React Dashboard**: `http://localhost:5173`
- **Chaos Engineering Studio**: `http://localhost:5173/chaos`
- **Attack Replay Studio**: `http://localhost:5173/attack-replay`
- **API Docs**: `http://localhost:8000/docs`

---

## 📁 Repository Structure

```
├── backend/
│   ├── app/
│   │   ├── middleware/
│   │   │   ├── gateway.py              # Token bucket + RFC 6585 headers + Shadow Mode
│   │   │   ├── waf_scanner.py          # SQLi, XSS, and Cmd Injection WAF scanner
│   │   │   ├── zero_trust.py           # Zero Trust JWT & HMAC validation
│   │   │   └── network_protection.py   # CoDel, RED, and Slow Loris protections
│   │   ├── services/
│   │   │   ├── bot_detector.py         # Bot Fingerprinting & JA4 header scanner
│   │   │   ├── graphql_analyzer.py     # GraphQL Depth & Complexity Guard
│   │   │   ├── glb_router.py           # Multi-Region Global Load Balancer
│   │   │   ├── threat_intel.py         # AbuseIPDB & AlienVault Threat Feeds
│   │   │   ├── grpc_inspector.py       # gRPC & HTTP/2 Binary Protocol Inspector
│   │   │   ├── circuit_breaker.py      # Downstream Endpoint Circuit Breakers
│   │   │   ├── alert_service.py        # Slack/Discord/Telegram Webhook alerts
│   │   │   ├── siem_exporter.py        # CEF / JSON SIEM log exporter
│   │   │   └── distributed_limiter.py  # Redis Lua token bucket
│   │   └── api/routes.py              # Enterprise FastAPI endpoints
├── frontend/                           # React Real-Time Dashboard
│   ├── src/pages/
│   │   ├── Dashboard.jsx               # Live network tracking + GLB Router & Threat Intel Cards
│   │   ├── ChaosStudio.jsx             # Chaos Engineering Fault Injection Studio
│   │   ├── AiInsights.jsx              # AI Reasoning Insights & High-Level Model Telemetry Hub
│   │   ├── Security.jsx                # WAF status, Bot ratios, Circuit Breakers & CSV export
│   │   ├── AttackReplay.jsx            # What-If Attack Replay Simulation Studio
│   │   ├── Policies.jsx                # Alert Webhooks & Shadow Mode controls
│   │   └── Analytics.jsx               # SIEM Log Exporter & Decision charts
└── scratch/test_phase3_features.py     # Automated feature test script
```

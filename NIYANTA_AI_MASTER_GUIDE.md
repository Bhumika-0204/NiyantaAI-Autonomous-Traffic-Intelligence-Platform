# 🌟 Niyanta AI: Master Architecture, Tech Stack & Operational Guide

Welcome to **Niyanta AI**! If you have zero prior experience with complex distributed systems, container orchestration (Kubernetes/Docker), event streams (Kafka), or reinforcement learning (PPO), don't worry. This guide arranges all the pieces in a clear, sequential, and easy-to-understand manual.

---

## 💡 Part 1: The Tech Stack & Security Suite Demystified

Here is a breakdown of every technology and security module used in Niyanta AI:

1. **Docker & Docker Compose (Containerization)**: Runs Python backend, Redis, and React frontend simultaneously.
2. **Kubernetes (K8s) (Orchestration)**: Deployment manifests for HPA scaling (3 → 50 pods) and kernel node-hardening.
3. **FastAPI (The Web Framework & API Gateway)**: High-performance async gateway handling all incoming traffic.
4. **WAF Payload Inspector**: Intercepts URIs and POST body payloads to block SQL Injection (SQLi), Cross-Site Scripting (XSS), and Command Injection before routing.
5. **Bot Fingerprinting (JA4)**: Evaluates header cadences, User-Agent, and `Sec-Ch-UA` headers to isolate automated scripts (`curl`, `python-requests`, `Puppeteer`).
6. **GraphQL Query Depth & Complexity Guard**: Restricts recursive GraphQL AST query nesting (max 7) and complexity scores (max 100) to block GraphQL DoS.
7. **gRPC & HTTP/2 Binary Protocol Inspector**: Enforces multiplexed stream concurrency (max 100 per connection) and Protobuf boundary checks to prevent HTTP/2 Rapid Reset attacks.
8. **Global Load Balancer (GLB) Multi-Region Router**: Computes live Anycast routing scores across global ingress regions (US East, EU West, AP South Mumbai).
9. **Threat Intelligence Feeds**: Scans IP reputations against live AbuseIPDB, AlienVault OTX, and Tor Exit Node databases.
10. **Chaos Engineering Studio**: Injects artificial fault modes (latency, packet loss, Redis outages) to verify automated auto-healing resiliency.
11. **PPO Reinforcement Learning (PyTorch)**: Dynamically computes allow, throttle, or block ratios based on host CPU, RAM, and latency.
12. **Isolation Forest (The DDoS Detector)**: Unsupervised anomaly detection flagging burst traffic spikes on Kafka event streams.
13. **Downstream API Circuit Breaker**: Tracks downstream endpoint health (`CLOSED`, `OPEN`, `HALF-OPEN`) to shield databases during downstream failures.
14. **Real-Time Webhook Alerts**: Automatically dispatches threat alerts to Slack, Discord, or Telegram channels.
15. **SIEM Log Exporter**: Formats Common Event Format (CEF) and JSON security event logs for Splunk and Datadog.
16. **Attack Replay Studio**: Allows security analysts to run "What-If" policy simulations on attack snapshots directly from the UI.
17. **ChromaDB & OpenAI (Explainability / RAG)**: Generates human-readable audit logs in plain English.
18. **React Dashboard**: Live telemetry UI featuring real-time charts, GLB routing status, Threat Intel feeds, WAF stats, bot ratios, and one-click SOC2 CSV/JSON report exports.

---

## 🔗 Part 2: The Complete Request Lifecycle

When a client makes a request to Niyanta AI, it flows through the components in this exact order:

```
[ Client Request ]
       │
       ▼
 1. WafScannerMiddleware ─────────► - Scans query/body for SQLi, XSS, and Command Injection.
       │                             - Validates GraphQL query depth & complexity limits.
       │                             (Blocks with 403 / 400 if malicious or recursive)
       ▼
 2. ZeroTrustMiddleware ──────────► Validates JWT Bearer & Replay Timestamp signature.
       │
       ▼
 3. NetworkProtectionMiddleware ──► - Checks Slow Loris, BCP38, RED, and CoDel delay headers.
       │                             - Enforces gRPC / HTTP/2 multiplexed stream caps (100 max).
       ▼
 4. TrafficGatewayMiddleware ─────► - Evaluates Tiered API Key Quotas (Free, Pro, Enterprise).
       │                             - Injects RFC 6585 headers (X-RateLimit-Limit, Remaining, Reset, Retry-After).
       │                             - Checks Shadow Mode: if active, logs AI risk silently without blocking.
       │                             - Queries Threat Intel feeds (AbuseIPDB / AlienVault).
       │                             - Runs PPO Agent & Redis Token Bucket rate limiter.
       │
       ▼
 5. Downstream Circuit Breaker ──► If endpoint healthy (CLOSED), forwards request to database.
       │                             If failing (OPEN), returns 503 fallback.
       ▼
 6. Asynchronous Logging ─────────► Emits telemetry to Kafka & SIEM Exporter (CEF/JSON).
       │
       ▼
 7. React UI & Webhooks ──────────► Streams live updates to React Dashboard & dispatches Slack alerts.
```

---

## 📁 Part 3: Folder & File Playbook

| File | Path & Purpose |
|:---|:---|
| [`main.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/main.py) | Entrypoint. Configures FastAPI middlewares, router mounts, and startup handlers. |
| [`gateway.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/middleware/gateway.py) | Core Traffic Gateway (Token Bucket + RFC 6585 + Shadow Mode). |
| [`waf_scanner.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/middleware/waf_scanner.py) | WAF Payload Inspector (SQLi, XSS, Cmd Injection). |
| [`network_protection.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/middleware/network_protection.py) | RED, CoDel, Slow Loris, BCP38, H2 stream caps. |
| [`zero_trust.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/middleware/zero_trust.py) | Zero Trust HMAC/JWT and Request Replay validation. |
| [`bot_detector.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/services/bot_detector.py) | Bot Fingerprinting & JA4 header scanner. |
| [`graphql_analyzer.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/services/graphql_analyzer.py) | GraphQL Depth & Complexity Guard. |
| [`glb_router.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/services/glb_router.py) | Multi-Region Global Load Balancer Router. |
| [`threat_intel.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/services/threat_intel.py) | AbuseIPDB & AlienVault Threat Feeds. |
| [`grpc_inspector.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/services/grpc_inspector.py) | gRPC & HTTP/2 Binary Protocol Inspector. |
| [`circuit_breaker.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/services/circuit_breaker.py) | Downstream Endpoint Circuit Breakers. |
| [`alert_service.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/services/alert_service.py) | Slack/Discord/Telegram Webhook alert dispatcher. |
| [`siem_exporter.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/services/siem_exporter.py) | CEF / JSON SIEM log exporter. |
| [`distributed_limiter.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/services/distributed_limiter.py) | Redis Lua Token Bucket. |
| [`ppo_agent.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/ml/ppo_agent.py) | PPO PyTorch model + fallback heuristics. |
| [`anomaly_detector.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/ml/anomaly_detector.py) | Isolation Forest unsupervised DDoS scorer. |
| [`routes.py`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/backend/app/api/routes.py) | FastAPI routes (`/ai/model-status`, `/chaos/inject`, `/glb/status`, `/graphql/analyze`, `/threat-intel/status`). |
| [`Dashboard.jsx`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/frontend/src/pages/Dashboard.jsx) | Real-time traffic, latency, GLB Router & Threat Intel status. |
| [`ChaosStudio.jsx`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/frontend/src/pages/ChaosStudio.jsx) | Chaos Engineering fault injection & auto-healing studio. |
| [`AiInsights.jsx`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/frontend/src/pages/AiInsights.jsx) | AI Reasoning Insights & High-Level Model Telemetry Hub. |
| [`Security.jsx`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/frontend/src/pages/Security.jsx) | Live WAF status, Bot ratios, Circuit Breakers & CSV export. |
| [`AttackReplay.jsx`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/frontend/src/pages/AttackReplay.jsx) | What-If Attack Replay Simulation Studio. |
| [`Policies.jsx`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/frontend/src/pages/Policies.jsx) | Webhook alerts & Shadow Mode controls. |
| [`Analytics.jsx`](file:///c:/Users/Bhumika%20Kumari/OneDrive/Desktop/ml-network-congestion/frontend/src/pages/Analytics.jsx) | SIEM Log Exporter & decision charts. |
| [`test_phase3_features.py`](file:///C:/Users/Bhumika%20Kumari/.gemini/antigravity-ide/brain/00c2a452-16b6-4980-b276-345fe346d97e/scratch/test_phase3_features.py) | Comprehensive test script for Phase 3 features. |


---

## 🛠️ Part 4: Operational Command Playbook

### 1. Launch Backend API Gateway
```bash
cd backend
..\.venv\Scripts\activate
python -m uvicorn app.main:app --port 8000
```

### 2. Launch React Control Dashboard
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your web browser.

### 3. Run Automated Feature Verification Test
```bash
.\.venv\Scripts\activate
python scratch/test_phase3_features.py
```

---

## 🛡️ Part 5: Resilience & Degradation Matrix

1. **What if an attacker tries SQL Injection or XSS?**
   * `WafScannerMiddleware` intercepts the URI or body payload, matches regex signatures, and drops the request instantly with `403 Forbidden` before running database queries.

2. **What if an attacker tries recursive GraphQL query depth attacks?**
   * `GraphQLAnalyzerService` computes AST depth. If depth > 7 or complexity > 100, drops the query immediately with `400 Bad Request`.

3. **What if a botnet rotates IP addresses?**
   * `BotDetectorService` analyzes header order and missing browser headers (`Sec-Ch-UA`, `Accept-Language`), flagging automated scripts even if IP address changes.

4. **What if a cloud region experiences high latency or outage?**
   * `GlobalLoadBalancer` detects latency degradation or high CPU (> 85%), dynamically re-routing ingress traffic to the next optimal Anycast node (e.g. AP South Mumbai).

5. **What if a downstream database service crashes?**
   * `CircuitBreakerManager` trips from `CLOSED` to `OPEN`, immediately returning `503 Service Unavailable (Circuit Breaker Open)` to shield the database until health probes pass.


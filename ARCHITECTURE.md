# Niyanta AI - Architecture & System Design

This document details the engineering paradigms, agent-to-agent communication, and 5-plane security architecture within **Niyanta AI**.

---

## 🏗️ 5-Plane Security Architecture

Niyanta AI follows a clean separation of concerns across 5 distinct planes:

```
┌─────────────────────────────────────────────────────────┐
│                 1. Control Plane & UI                   │
│  React Dashboard · Chaos Studio · Attack Replay Studio  │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                 2. Intelligence & Routing Plane         │
│  Isolation Forest · PPO RL · GLB Multi-Region Anycast   │
│  Threat Intel Feeds · GraphQL Depth & Complexity Guard  │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                 3. Enforcement Plane                    │
│   Token Bucket · Circuit Breakers · WAF Scanner         │
│   gRPC & HTTP/2 Stream Concurrency Inspector            │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                 4. Data Plane (Gateway)                 │
│   FastAPI Middleware · Redis Lua · RFC 6585 Headers     │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                 5. Kernel Fast Path                     │
│   eBPF / XDP Ingress Filtering · BCP38 Spoof Filter     │
└─────────────────────────────────────────────────────────┘
```

---

## 🛡️ Core Interceptor Pipeline

Every incoming HTTP request flows through 4 asynchronous FastAPI middleware interceptors before hitting internal route handlers:

1. **`WafScannerMiddleware`**:
   * Scans URIs and POST body payloads for SQL Injection, XSS, and Command Injection attacks.
   * Enforces AST query depth and complexity scoring for GraphQL endpoints.
   * Returns HTTP `403 Forbidden` for malicious strings.

2. **`ZeroTrustMiddleware`**:
   * Validates JWT Bearer tokens and request timestamp signatures (`X-Timestamp`, `X-Signature`) for replay attack protection.

3. **`NetworkProtectionMiddleware`**:
   * Applies Layer 7 Slow Loris timeouts and Layer 4 RED/CoDel queueing delay headers (`X-Niyanta-CoDel: congested`).
   * Enforces gRPC & HTTP/2 multiplexed stream caps (max 100 concurrent streams per IP).

4. **`TrafficGatewayMiddleware`**:
   * Queries `ExecutionAgent` for cached IP verdicts.
   * Executes Redis-backed Token Bucket rate limiting.
   * Checks **Shadow Mode** status: if active, evaluates AI risk scores silently without dropping production requests.
   * Injects standard **RFC 6585 Headers** (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`).

---

## 📡 Microservice Components & Intelligence Agents

* **Monitoring Agent** (`monitoring_agent.py`): Tracks real-time host hardware metrics via `psutil` (CPU %, memory, bandwidth, packet rates).
* **Bot Detector Service** (`bot_detector.py`): Analyzes header order, User-Agent, and `Sec-Ch-UA` headers to calculate bot ratios.
* **Global Load Balancer Router** (`glb_router.py`): Evaluates multi-region latency & health metrics to select optimal Anycast ingress node.
* **GraphQL Complexity Guard** (`graphql_analyzer.py`): Parses GraphQL queries to compute depth and field complexity scores.
* **Threat Intelligence Service** (`threat_intel.py`): Queries live blocklists (AbuseIPDB, AlienVault OTX, Tor Exit Nodes).
* **gRPC Binary Inspector** (`grpc_inspector.py`): Inspects Protobuf binary frame headers and HTTP/2 stream multiplexing bounds.
* **Circuit Breaker Manager** (`circuit_breaker.py`): Manages downstream endpoint health (`CLOSED`, `OPEN`, `HALF-OPEN`).
* **Alert Service** (`alert_service.py`): Formats and dispatches real-time webhooks to Slack, Discord, and Telegram.
* **SIEM Exporter** (`siem_exporter.py`): Formats structured Common Event Format (CEF) and JSON logs for Splunk and Datadog.

---

## 🔗 Endpoint API Registry

* `POST /api/v1/analyze`: Full ML pipeline evaluation (Isolation Forest + PPO + Bot Fingerprinting).
* `POST /api/v1/analyze-request`: Atomic sub-millisecond Redis Lua token bucket check + PPO inference.
* `POST /api/v1/chaos/inject`: Chaos Engineering fault injection (latency, packet loss, Redis outage).
* `GET /api/v1/glb/status`: Multi-Region Global Load Balancer optimal routing status.
* `POST /api/v1/graphql/analyze`: GraphQL query depth & complexity security analysis.
* `GET /api/v1/threat-intel/status`: Real-time AbuseIPDB & AlienVault threat feed integration status.
* `GET /api/v1/waf/stats`: Real-time WAF violation statistics.
* `GET /api/v1/bot/stats`: Bot vs Human traffic ratio telemetry.
* `POST /api/v1/feedback/false-positive`: Live AI feedback loop for IP unblocking.
* `GET /api/v1/circuit-breaker/status`: Health status of all downstream route circuit breakers.
* `POST /api/v1/shadow-mode/toggle`: Enable/disable silent AI evaluation.
* `POST /api/v1/replay-attack`: What-If attack scenario simulation.
* `GET /api/v1/reports/export`: Executive CSV / JSON audit log export (SOC2).
* `GET /api/v1/siem/export`: CEF / JSON log stream export for Splunk / Datadog.


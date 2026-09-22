# API Documentation (Initial FAANG Specification)

This document outlines the core interacting endpoints for the **Niyanta AI** API Gateway. All endpoints are heavily optimized for asynchronous execution and designed to interface properly with downstream microservices.

---

## 1. Core Ingress / Policy Enforcement

### `POST /analyze-request`
Acts as the central proxy evaluation point. Before a request hits the upstream targets or ML pipeline, it routes through this endpoint for immediate Redis Lua token checks and cached RL policy inference.

**Headers:**
- `Authorization: Bearer <JWT>`
- `X-Client-IP: <IP Address>`
- `X-API-Key: <Key>` (Optional fallback)

**Request Payload (Example from load balancer metrics):**
```json
{
  "client_ip": "10.0.0.52",
  "request_size_bytes": 1024,
  "endpoint_targeted": "/api/v1/payments"
}
```

**Response (200 OK - Allowed):**
```json
{
  "status": "success",
  "action": "allow",
  "ml_confidence_score": 0.98,
  "rate_limit_remaining": 4900,
  "trace_id": "req_5f2b8a..."
}
```

**Response (429 Too Many Requests - Throttled/Blocked):**
```json
{
  "status": "error",
  "action": "throttle",
  "reason": "AI Policy Enforcement: System CPU > 85%, reducing bandwidth.",
  "retry_after_seconds": 15,
  "trace_id": "req_2x8k9m..."
}
```

---

## 2. Observability & Telemetry

### `GET /metrics`
Exposes system-level operations and business-logic matrices directly to Prometheus. This endpoint uses the `prometheus_client` format and is scraped every 5 seconds.

**Request:** `GET /metrics`

**Response (`text/plain`):**
```text
# HELP niyanta_active_connections Current active gateway sockets
# TYPE niyanta_active_connections gauge
niyanta_active_connections{region="us-east-1"} 1543.0

# HELP niyanta_ml_inference_time_ms Histogram of PPO inference speeds
# TYPE niyanta_ml_inference_time_ms histogram
niyanta_ml_inference_time_ms_bucket{le="1.0"} 5000
niyanta_ml_inference_time_ms_bucket{le="5.0"} 9982

# HELP niyanta_redis_failures_total Total circuit trips for Redis
# TYPE niyanta_redis_failures_total counter
niyanta_redis_failures_total 0.0
```

---

## 4. Phase 3 Next-Gen & High-Level AI Endpoints

### `GET /api/v1/ai/model-status`
Returns high-level model architectures, neural parameters, loss metrics, and active agent statuses (PyTorch PPO, Isolation Forest, Agentic MAS, ChromaDB RAG).

**Response (200 OK):**
```json
{
  "models": {
    "ppo_reinforcement_learning": {
      "name": "PyTorch PPO Actor-Critic Neural Agent",
      "type": "Reinforcement Learning (PPO)",
      "status": "ACTIVE_INFERENCE",
      "architecture": "Actor-Critic Dual-Head MLP (State: 4, Action: 3)"
    },
    "isolation_forest_ddos": {
      "name": "Isolation Forest Anomaly Detector",
      "type": "Unsupervised Machine Learning",
      "estimators": 100,
      "contamination_rate": 0.05
    },
    "agentic_ai_cluster": {
      "name": "Autonomous Agentic AI Network Triad",
      "type": "Multi-Agent System (MAS)"
    },
    "rag_genai_explainer": {
      "name": "Generative AI RAG Explanation Engine",
      "vector_store": "ChromaDB Persistent Collection"
    }
  }
}
```

### `POST /api/v1/chaos/inject`
Chaos Engineering fault injection studio. Injects latency, packet loss, or Redis outages to test auto-healing resiliency.

### `GET /api/v1/glb/status`
Returns Multi-Region Anycast Global Load Balancer optimal cloud region selection and latency scores.

### `POST /api/v1/graphql/analyze`
Scans GraphQL AST queries to enforce max depth (7) and complexity score (100) limits.

### `GET /api/v1/threat-intel/status`
Scans IP reputations against AbuseIPDB, AlienVault OTX, and Tor Exit Node databases.

### `POST /api/v1/feedback/false-positive`
Online ML Feedback Loop: unblocks flagged IPs live and auto-tunes sensitivity without restarting.

### `GET /api/v1/reports/export?format=csv`
Exports executive SOC2 / ISO27001 security compliance audit logs in CSV or JSON.

### `GET /api/v1/siem/export?format=cef`
Exports Common Event Format (CEF) and JSON security events for Datadog, Splunk, and Syslog SOC ingestion.


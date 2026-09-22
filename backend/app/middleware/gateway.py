import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.agents.monitoring_agent import monitor
from app.agents.execution_agent import execution_agent
from app.services.rate_limiter import rate_limiter_manager
from app.core.logger import logger
from app.services.siem_exporter import siem_exporter

shadow_mode_enabled = False

def set_shadow_mode(enabled: bool):
    global shadow_mode_enabled
    shadow_mode_enabled = enabled

def get_shadow_mode() -> bool:
    return shadow_mode_enabled

# Tiered API Key Quota Map
API_KEY_TIERS = {
    "FREE_KEY_123": {"tier": "Free", "limit": 100},
    "PRO_KEY_456": {"tier": "Pro", "limit": 5000},
    "ENT_KEY_789": {"tier": "Enterprise", "limit": 50000}
}

class TrafficGatewayMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)

        client_ip = request.client.host or "unknown"
        api_key = request.headers.get("X-API-Key", "")
        tier_info = API_KEY_TIERS.get(api_key, {"tier": "Default", "limit": 1000})
        limit_val = tier_info["limit"]
        
        # 1. AI Execution Verdict
        action = execution_agent.get_action(client_ip)
        
        # If Shadow Mode is enabled, evaluate AI silently without blocking production
        if action == "block":
            siem_exporter.record_event(client_ip, "BLOCK", "PPO RL Anomaly Isolation", "CRITICAL", str(request.url.path))
            if shadow_mode_enabled:
                logger.info(f"SHADOW MODE: Would block IP {client_ip}, but allowing request silently.")
            else:
                logger.warning(f"Gateway: Dropping request. IP {client_ip} is blocked.")
                res = JSONResponse(status_code=403, content={"detail": "Traffic blocked by Niyanta AI."})
                res.headers["Retry-After"] = "60"
                res.headers["X-RateLimit-Limit"] = str(limit_val)
                res.headers["X-RateLimit-Remaining"] = "0"
                return res

        is_throttled = (action == "throttle")
        
        # 2. Rate Limiter & Token Bucket
        if not rate_limiter_manager.is_allowed(client_ip, throttle=is_throttled):
            logger.warning(f"Gateway: Rate limiting activated for IP {client_ip} (Tier: {tier_info['tier']})")
            siem_exporter.record_event(client_ip, "THROTTLE", "Rate Limit Exceeded", "MEDIUM", str(request.url.path))
            if not shadow_mode_enabled:
                res = JSONResponse(status_code=429, content={"detail": "Too many requests. Please slow down. Rate limit exceeded."})
                res.headers["Retry-After"] = "5"
                res.headers["X-RateLimit-Limit"] = str(limit_val)
                res.headers["X-RateLimit-Remaining"] = "0"
                return res

        monitor.log_request()
        start_time = time.time()
        
        try:
            response = await call_next(request)
        except Exception as e:
            monitor.end_request()
            logger.error(f"Gateway: Unhandled request error {e}")
            raise e
            
        process_time = (time.time() - start_time) * 1000 
        monitor.end_request()

        # Ingest RFC 6585 Standard Headers
        response.headers["X-Process-Time"] = str(round(process_time, 2))
        response.headers["X-RateLimit-Limit"] = str(limit_val)
        response.headers["X-RateLimit-Remaining"] = str(max(1, limit_val - monitor.total_requests))
        response.headers["X-RateLimit-Reset"] = str(int(time.time() + 60))
        response.headers["X-Niyanta-Shadow-Mode"] = "true" if shadow_mode_enabled else "false"
        
        return response

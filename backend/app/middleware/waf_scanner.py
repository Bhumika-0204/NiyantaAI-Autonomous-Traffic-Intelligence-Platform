import re
import json
from typing import Dict, Any, Tuple
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.core.logger import logger

# High-precision security inspection signatures
SQLI_PATTERNS = [
    re.compile(r"(\b(UNION(\s+ALL)?|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|EXECUTE)\b)", re.IGNORECASE),
    re.compile(r"('|\"|%27|%22)\s*(OR|AND)\s*('|\"|%27|%22)?\s*([0-9a-zA-Z]+)\s*=\s*('|\"|%27|%22)?\s*\4", re.IGNORECASE),
    re.compile(r"INFORMATION_SCHEMA|BENCHMARK\(|PG_SLEEP\(|WAITFOR\s+DELAY", re.IGNORECASE),
    re.compile(r"--;|#|\/\*|\*\/", re.IGNORECASE)
]

XSS_PATTERNS = [
    re.compile(r"<\s*script[^>]*>", re.IGNORECASE),
    re.compile(r"javascript\s*:", re.IGNORECASE),
    re.compile(r"on(error|load|click|mouseover|submit|focus|blur)\s*=", re.IGNORECASE),
    re.compile(r"<\s*(iframe|embed|object|img|svg|body|link)\b[^>]*>", re.IGNORECASE),
    re.compile(r"document\.(cookie|location|referrer)", re.IGNORECASE)
]

CMD_INJECTION_PATTERNS = [
    re.compile(r"(;\s*(rm|cat|ls|chmod|chown|wget|curl|nc|bash|sh|exec|id|whoami)\b)", re.IGNORECASE),
    re.compile(r"(\|\s*(rm|cat|ls|bash|sh|wget|curl)\b)", re.IGNORECASE),
    re.compile(r"(\$\(.*\)|`.*`)", re.IGNORECASE),
    re.compile(r"(/etc/passwd|/etc/shadow|/dev/null)", re.IGNORECASE)
]

class WafStatsManager:
    def __init__(self):
        self.total_scanned = 0
        self.sqli_blocked = 0
        self.xss_blocked = 0
        self.cmd_blocked = 0

    def log_sqli(self):
        self.total_scanned += 1
        self.sqli_blocked += 1

    def log_xss(self):
        self.total_scanned += 1
        self.xss_blocked += 1

    def log_cmd(self):
        self.total_scanned += 1
        self.cmd_blocked += 1

    def log_clean(self):
        self.total_scanned += 1

    def get_stats(self) -> Dict[str, Any]:
        return {
            "total_scanned": self.total_scanned,
            "sqli_blocked": self.sqli_blocked,
            "xss_blocked": self.xss_blocked,
            "cmd_blocked": self.cmd_blocked,
            "total_blocked": self.sqli_blocked + self.xss_blocked + self.cmd_blocked
        }

waf_stats = WafStatsManager()

class WafScannerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Exclude static/health endpoints
        if request.url.path in ["/", "/metrics", "/ecmp-status", "/docs", "/openapi.json"]:
            return await call_next(request)

        client_ip = request.client.host or "unknown"
        
        # 1. Inspect URL & Query String
        raw_url = str(request.url)
        is_violation, threat_type, matched_rule = self.inspect_text(raw_url)
        
        if is_violation:
            self.record_violation(threat_type)
            logger.warning(f"WAF BLOCK: {threat_type} detected in URL from IP {client_ip}. Pattern: '{matched_rule}'")
            return JSONResponse(
                status_code=403,
                content={
                    "detail": f"Request blocked by Niyanta WAF Payload Inspector ({threat_type} Detected)",
                    "threat_type": threat_type,
                    "matched_pattern": matched_rule,
                    "client_ip": client_ip
                }
            )

        # 2. Inspect Body Payload for POST/PUT/PATCH
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body_bytes = await request.body()
                if body_bytes:
                    body_text = body_bytes.decode('utf-8', errors='ignore')
                    is_violation, threat_type, matched_rule = self.inspect_text(body_text)
                    if is_violation:
                        self.record_violation(threat_type)
                        logger.warning(f"WAF BLOCK: {threat_type} detected in Payload from IP {client_ip}. Pattern: '{matched_rule}'")
                        return JSONResponse(
                            status_code=403,
                            content={
                                "detail": f"Request blocked by Niyanta WAF Payload Inspector ({threat_type} Detected)",
                                "threat_type": threat_type,
                                "matched_pattern": matched_rule,
                                "client_ip": client_ip
                            }
                        )

                    # Re-populate request body stream so downstream route handlers can consume it
                    async def receive():
                        return {"type": "http.request", "body": body_bytes}
                    request._receive = receive
            except Exception as e:
                logger.error(f"WAF Scanner payload parse error: {e}")

        waf_stats.log_clean()
        return await call_next(request)

    def inspect_text(self, text: str) -> Tuple[bool, str, str]:
        # SQL Injection Check
        for pattern in SQLI_PATTERNS:
            match = pattern.search(text)
            if match:
                return True, "SQL Injection (SQLi)", match.group(0)

        # XSS Check
        for pattern in XSS_PATTERNS:
            match = pattern.search(text)
            if match:
                return True, "Cross-Site Scripting (XSS)", match.group(0)

        # Command Injection Check
        for pattern in CMD_INJECTION_PATTERNS:
            match = pattern.search(text)
            if match:
                return True, "Command Injection", match.group(0)

        return False, "", ""

    def record_violation(self, threat_type: str):
        if "SQL" in threat_type:
            waf_stats.log_sqli()
        elif "Cross-Site" in threat_type or "XSS" in threat_type:
            waf_stats.log_xss()
        else:
            waf_stats.log_cmd()

import time
from typing import Dict, Any

STATE_CLOSED = "CLOSED"      # Normal operation
STATE_OPEN = "OPEN"          # Trip open (block/fallback calls)
STATE_HALF_OPEN = "HALF_OPEN"# Testing recovery

class CircuitBreaker:
    def __init__(self, endpoint: str, error_threshold: int = 5, recovery_timeout_sec: int = 15):
        self.endpoint = endpoint
        self.error_threshold = error_threshold
        self.recovery_timeout_sec = recovery_timeout_sec
        self.state = STATE_CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.total_count = 0
        self.last_state_change = time.time()

    def can_execute(self) -> bool:
        now = time.time()
        if self.state == STATE_OPEN:
            if now - self.last_state_change > self.recovery_timeout_sec:
                self.state = STATE_HALF_OPEN
                self.last_state_change = now
                return True
            return False
        return True

    def record_success(self):
        self.total_count += 1
        if self.state == STATE_HALF_OPEN:
            self.success_count += 1
            if self.success_count >= 3:
                self.state = STATE_CLOSED
                self.failure_count = 0
                self.success_count = 0
                self.last_state_change = time.time()

    def record_failure(self):
        self.total_count += 1
        self.failure_count += 1
        if self.failure_count >= self.error_threshold:
            self.state = STATE_OPEN
            self.last_state_change = time.time()

    def get_status(self) -> Dict[str, Any]:
        return {
            "endpoint": self.endpoint,
            "state": self.state,
            "failure_count": self.failure_count,
            "total_count": self.total_count,
            "last_state_change": round(time.time() - self.last_state_change, 1)
        }

class CircuitBreakerManager:
    def __init__(self):
        self.breakers: Dict[str, CircuitBreaker] = {
            "/api/v1/payment": CircuitBreaker("/api/v1/payment"),
            "/api/v1/users": CircuitBreaker("/api/v1/users"),
            "/api/v1/analytics": CircuitBreaker("/api/v1/analytics")
        }

    def get_breaker(self, endpoint: str) -> CircuitBreaker:
        if endpoint not in self.breakers:
            self.breakers[endpoint] = CircuitBreaker(endpoint)
        return self.breakers[endpoint]

    def get_all_status(self) -> Dict[str, Any]:
        return {ep: b.get_status() for ep, b in self.breakers.items()}

circuit_breaker_manager = CircuitBreakerManager()

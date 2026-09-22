import random
import time
from typing import Dict, Any, List

class GlobalLoadBalancer:
    def __init__(self):
        self.regions = {
            "us-east-1": {"name": "N. Virginia (US East)", "region": "us-east-1", "latency_ms": 15, "cpu_load": 42.0, "health": "HEALTHY"},
            "eu-west-1": {"name": "Ireland (EU West)", "region": "eu-west-1", "latency_ms": 38, "cpu_load": 58.0, "health": "HEALTHY"},
            "ap-south-1": {"name": "Mumbai (AP South)", "region": "ap-south-1", "latency_ms": 8, "cpu_load": 35.0, "health": "OPTIMAL"}
        }

    def get_optimal_region(self, client_location: str = "ap-south-1") -> Dict[str, Any]:
        # Fluctuate latencies realistically
        for reg in self.regions.values():
            reg["latency_ms"] = max(5, reg["latency_ms"] + random.randint(-2, 2))
            reg["cpu_load"] = round(max(10.0, min(95.0, reg["cpu_load"] + random.uniform(-1.5, 1.5))), 1)

        # Select region with lowest latency and healthy CPU
        sorted_regions = sorted(self.regions.values(), key=lambda r: (r["cpu_load"] > 85, r["latency_ms"]))
        optimal = sorted_regions[0]

        return {
            "status": "active",
            "optimal_region": optimal,
            "all_regions": list(self.regions.values())
        }

glb_router = GlobalLoadBalancer()


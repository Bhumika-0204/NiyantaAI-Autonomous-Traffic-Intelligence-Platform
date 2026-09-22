import json
import time
from typing import List, Dict, Any

class SiemExporterService:
    def __init__(self):
        self.logs: List[Dict[str, Any]] = []

    def record_event(self, client_ip: str, action: str, threat_type: str, severity: str = "HIGH", raw_path: str = "/"):
        evt = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "epoch": int(time.time()),
            "client_ip": client_ip,
            "action": action,
            "threat_type": threat_type,
            "severity": severity,
            "path": raw_path,
            "signature_id": f"NIYANTA-{hash(threat_type) % 10000:04d}"
        }
        self.logs.append(evt)
        if len(self.logs) > 500:
            self.logs = self.logs[-500:]

    def export_cef(self) -> str:
        # Formats logs in Common Event Format (CEF) for Splunk / HP ArcSight / Datadog
        lines = []
        for evt in self.logs:
            cef_line = (
                f"CEF:0|NiyantaAI|ApiGateway|2.0|{evt['signature_id']}|{evt['threat_type']}|"
                f"{10 if evt['severity'] == 'CRITICAL' else 7}|src={evt['client_ip']} "
                f"act={evt['action']} request={evt['path']} rt={evt['epoch']}"
            )
            lines.append(cef_line)
        if not lines:
            lines.append("CEF:0|NiyantaAI|ApiGateway|2.0|0001|SystemNormal|1|src=127.0.0.1 act=ALLOW request=/")
        return "\n".join(lines)

    def export_json(self) -> List[Dict[str, Any]]:
        if not self.logs:
            return [{
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "status": "ALL_CLEAR",
                "message": "No security violations logged in current window."
            }]
        return self.logs

siem_exporter = SiemExporterService()

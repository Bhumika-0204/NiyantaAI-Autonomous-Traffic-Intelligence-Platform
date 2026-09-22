import urllib.request
import json
import asyncio
from typing import Dict, Any, Optional
from app.core.logger import logger

class AlertService:
    def __init__(self):
        self.webhook_url: Optional[str] = None
        self.webhook_type: str = "slack"  # slack, discord, telegram, custom
        self.alert_enabled: bool = True
        self.total_alerts_sent: int = 0

    def configure(self, webhook_url: str, webhook_type: str = "slack", alert_enabled: bool = True):
        self.webhook_url = webhook_url
        self.webhook_type = webhook_type.lower()
        self.alert_enabled = alert_enabled
        logger.info(f"AlertService configured: type={webhook_type}, enabled={alert_enabled}")

    def send_alert(self, title: str, description: str, severity: str = "CRITICAL", metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.alert_enabled or not self.webhook_url:
            return {"status": "skipped", "reason": "Webhook URL not configured or alerts disabled"}

        try:
            payload = self._format_payload(title, description, severity, metadata or {})
            data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(self.webhook_url, data=data, headers={"Content-Type": "application/json"})
            
            with urllib.request.urlopen(req, timeout=5) as resp:
                self.total_alerts_sent += 1
                logger.info(f"Alert webhook delivered successfully: {title}")
                return {"status": "success", "http_code": resp.status}
        except Exception as e:
            logger.error(f"Failed to dispatch alert webhook: {e}")
            return {"status": "error", "message": str(e)}

    def _format_payload(self, title: str, description: str, severity: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        if self.webhook_type == "discord":
            return {
                "embeds": [{
                    "title": f"🚨 [{severity}] {title}",
                    "description": description,
                    "color": 15158332 if severity == "CRITICAL" else 3066993,
                    "fields": [{"name": k, "value": str(v), "inline": True} for k, v in metadata.items()]
                }]
            }
        elif self.webhook_type == "telegram":
            text = f"🚨 *[{severity}] {title}*\n{description}\n\n" + "\n".join([f"• *{k}*: `{v}`" for k, v in metadata.items()])
            return {"text": text, "parse_mode": "Markdown"}
        else:
            # Default Slack / Standard JSON Webhook format
            return {
                "text": f"🚨 *[{severity}] {title}*\n{description}",
                "blocks": [
                    {
                        "type": "section",
                        "text": {"type": "mrkdwn", "text": f"*🚨 [{severity}] {title}*\n{description}"}
                    },
                    {
                        "type": "section",
                        "fields": [{"type": "mrkdwn", "text": f"*{k}:*\n{v}"} for k, v in metadata.items()]
                    }
                ]
            }

alert_service = AlertService()

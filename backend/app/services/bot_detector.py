import re
from typing import Dict, Any

SUSPICIOUS_BOT_AGENTS = [
    re.compile(r"python-requests|curl|wget|httpx|aiohttp|urllib|go-http-client|postman|insomnia", re.IGNORECASE),
    re.compile(r"puppeteer|playwright|selenium|phantomjs|headlesschrome|zgrab|nmap|nikto|sqlmap", re.IGNORECASE)
]

KNOWN_HUMAN_BROWSERS = [
    re.compile(r"Mozilla/5\.0.*(Chrome|Safari|Firefox|Edge|OPR)/", re.IGNORECASE)
]

class BotDetectorService:
    def __init__(self):
        self.bot_requests_count = 0
        self.human_requests_count = 0

    def analyze_request_headers(self, headers: Dict[str, str]) -> Dict[str, Any]:
        user_agent = headers.get("user-agent", "")
        accept_header = headers.get("accept", "")
        accept_lang = headers.get("accept-language", "")
        sec_ch_ua = headers.get("sec-ch-ua", "")
        
        bot_score = 0.0
        reasons = []

        if not user_agent:
            bot_score += 0.5
            reasons.append("Missing User-Agent Header")
        else:
            # Check suspicious scraper/script User-Agents
            for bot_re in SUSPICIOUS_BOT_AGENTS:
                if bot_re.search(user_agent):
                    bot_score += 0.8
                    reasons.append(f"Automation/Scraper tool detected in User-Agent ({user_agent})")
                    break

        if not accept_lang:
            bot_score += 0.2
            reasons.append("Missing Accept-Language header (characteristic of headless scripts)")

        if not sec_ch_ua and "Chrome" in user_agent:
            bot_score += 0.3
            reasons.append("Missing Sec-Ch-UA header for claimed Chrome client")

        # Determine classification
        is_bot = bot_score >= 0.5
        if is_bot:
            self.bot_requests_count += 1
        else:
            self.human_requests_count += 1

        total = max(1, self.bot_requests_count + self.human_requests_count)

        return {
            "is_bot": is_bot,
            "bot_score": min(1.0, round(bot_score, 2)),
            "reasons": reasons,
            "fingerprint_summary": {
                "bot_count": self.bot_requests_count,
                "human_count": self.human_requests_count,
                "bot_ratio_percent": round((self.bot_requests_count / total) * 100, 1)
            }
        }

bot_detector = BotDetectorService()

import re
from typing import Dict, Any

class GraphQLAnalyzer:
    def __init__(self, max_depth: int = 7, max_complexity: int = 100):
        self.max_depth = max_depth
        self.max_complexity = max_complexity

    def analyze_query(self, query_string: str) -> Dict[str, Any]:
        if not query_string:
            return {"valid": True, "depth": 0, "complexity": 0}

        # Calculate max nesting depth by counting bracket levels
        current_depth = 0
        max_depth_found = 0
        for char in query_string:
            if char == '{':
                current_depth += 1
                max_depth_found = max(max_depth_found, current_depth)
            elif char == '}':
                current_depth = max(0, current_depth - 1)

        # Estimate complexity based on field selections and arguments
        fields_count = len(re.findall(r'[a-zA-Z0-9_]+\s*\{|\b[a-zA-Z0-9_]+\b', query_string))
        complexity_score = fields_count * max_depth_found

        is_exceeded = max_depth_found > self.max_depth or complexity_score > self.max_complexity
        
        return {
            "valid": not is_exceeded,
            "depth": max_depth_found,
            "complexity": complexity_score,
            "max_depth_limit": self.max_depth,
            "max_complexity_limit": self.max_complexity,
            "reason": f"Depth {max_depth_found} > {self.max_depth} or Complexity {complexity_score} > {self.max_complexity}" if is_exceeded else "Query within safety boundaries"
        }

graphql_analyzer = GraphQLAnalyzer()

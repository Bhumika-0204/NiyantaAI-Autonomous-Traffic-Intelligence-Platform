from typing import Dict, Any

class GrpcInspectorService:
    def __init__(self, max_concurrent_streams: int = 100):
        self.max_concurrent_streams = max_concurrent_streams
        self.active_streams: Dict[str, int] = {}
        self.total_grpc_frames_scanned = 0

    def inspect_connection(self, connection_id: str, requested_streams: int = 1) -> Dict[str, Any]:
        self.total_grpc_frames_scanned += 1
        current = self.active_streams.get(connection_id, 0)
        
        if current + requested_streams > self.max_concurrent_streams:
            return {
                "allowed": False,
                "reason": f"HTTP/2 Stream concurrency cap exceeded ({current + requested_streams} > {self.max_concurrent_streams})",
                "active_streams": current,
                "max_streams": self.max_concurrent_streams
            }

        self.active_streams[connection_id] = current + requested_streams
        return {
            "allowed": True,
            "reason": "gRPC Protobuf stream within multiplexing boundaries",
            "active_streams": self.active_streams[connection_id],
            "max_streams": self.max_concurrent_streams
        }

grpc_inspector = GrpcInspectorService()

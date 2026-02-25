import type { Component } from "solid-js";
import type { StreamStatus } from "./CameraStream.tsx";

interface ConnectionStatusProps {
  ntConnected: boolean;
  streamStatus: StreamStatus;
}

const ConnectionStatus: Component<ConnectionStatusProps> = (props) => {
  return (
    <div class="connection-status">
      <span
        class="status-dot"
        classList={{
          connected: props.ntConnected,
          disconnected: !props.ntConnected,
        }}
      />
      <span>NT4: {props.ntConnected ? "Connected" : "Disconnected"}</span>

      <span
        class="status-dot"
        classList={{
          connected: props.streamStatus === "connected",
          reconnecting: props.streamStatus === "reconnecting",
          disconnected: props.streamStatus === "disconnected",
        }}
      />
      <span>Stream: {props.streamStatus}</span>
    </div>
  );
};

export default ConnectionStatus;

import type { Component } from "solid-js";
import type { StreamStatus } from "./CameraStream.tsx";

interface ConnectionStatusProps {
  ntConnected: boolean;
  streamStatus: StreamStatus;
}

const ConnectionStatus: Component<ConnectionStatusProps> = (props) => {
  return (
    <div class="flex items-center gap-1.5 text-xs">
      <span
        class={`w-2 h-2 rounded-full inline-block ${props.ntConnected ? "bg-green-500" : "bg-red-500"}`}
      />
      <span>NT4: {props.ntConnected ? "Connected" : "Disconnected"}</span>

      <span
        class={`w-2 h-2 rounded-full inline-block ${
          props.streamStatus === "connected"
            ? "bg-green-500"
            : props.streamStatus === "reconnecting"
              ? "bg-yellow-500 animate-pulse"
              : "bg-red-500"
        }`}
      />
      <span>Stream: {props.streamStatus}</span>
    </div>
  );
};

export default ConnectionStatus;

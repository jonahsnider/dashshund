import { createSignal, createEffect, on, onCleanup, type Component } from "solid-js";
import { NetworkTables } from "ntcore-ts-client";
import { createNTConnection } from "./lib/nt.ts";
import { createCameraDiscovery } from "./lib/cameras.ts";
import CameraStream, { type StreamStatus } from "./components/CameraStream.tsx";
import CameraSelect from "./components/CameraSelect.tsx";
import ConnectionStatus from "./components/ConnectionStatus.tsx";
import Settings, { loadTeamNumber } from "./components/Settings.tsx";

const App: Component = () => {
  const [teamNumber, setTeamNumber] = createSignal(loadTeamNumber());
  const [nt, setNt] = createSignal<NetworkTables>(
    NetworkTables.getInstanceByTeam(teamNumber()),
  );
  const [streamUrl, setStreamUrl] = createSignal<string | undefined>();
  const [streamStatus, setStreamStatus] = createSignal<StreamStatus>("disconnected");

  const ntConnected = createNTConnection(nt());
  const cameras = createCameraDiscovery(nt());

  // Reconnect NT4 when team number changes
  createEffect(
    on(teamNumber, (team, prevTeam) => {
      if (prevTeam !== undefined && team !== prevTeam) {
        const instance = NetworkTables.getInstanceByTeam(team);
        setNt(instance);
      }
    }),
  );

  return (
    <div class="flex flex-col h-full">
      <header class="flex items-center justify-between px-3 py-2 bg-[#252525] border-b border-[#333] gap-3 shrink-0">
        <Settings onTeamChange={setTeamNumber} />
        <ConnectionStatus
          ntConnected={ntConnected()}
          streamStatus={streamStatus()}
        />
      </header>

      <main class="flex-1 flex items-center justify-center overflow-hidden">
        <CameraStream url={streamUrl()} onStatusChange={setStreamStatus} />
      </main>

      <footer class="px-3 py-2 bg-[#252525] border-t border-[#333] shrink-0">
        <CameraSelect cameras={cameras()} onSelect={setStreamUrl} />
      </footer>
    </div>
  );
};

export default App;

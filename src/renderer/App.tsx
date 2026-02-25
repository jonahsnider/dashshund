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
    <div class="app">
      <header>
        <Settings onTeamChange={setTeamNumber} />
        <ConnectionStatus
          ntConnected={ntConnected()}
          streamStatus={streamStatus()}
        />
      </header>

      <main>
        <CameraStream url={streamUrl()} onStatusChange={setStreamStatus} />
      </main>

      <footer>
        <CameraSelect cameras={cameras()} onSelect={setStreamUrl} />
      </footer>
    </div>
  );
};

export default App;

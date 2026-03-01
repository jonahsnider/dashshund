import { createSignal, createEffect, on, type Component } from "solid-js";

export type StreamStatus = "connected" | "disconnected" | "reconnecting";

interface CameraStreamProps {
  url: string | undefined;
  onStatusChange?: (status: StreamStatus) => void;
}

const INITIAL_RETRY_MS = 500;
const MAX_RETRY_MS = 5000;

const CameraStream: Component<CameraStreamProps> = (props) => {
  const [status, setStatus] = createSignal<StreamStatus>("disconnected");
  const [imgSrc, setImgSrc] = createSignal<string>();
  let retryMs = INITIAL_RETRY_MS;
  let retryTimeout: ReturnType<typeof setTimeout> | undefined;

  function updateStatus(s: StreamStatus) {
    setStatus(s);
    props.onStatusChange?.(s);
  }

  function connect(url: string) {
    clearTimeout(retryTimeout);
    updateStatus("reconnecting");
    setImgSrc(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`);
  }

  function retry(url: string) {
    updateStatus("reconnecting");
    retryTimeout = setTimeout(() => {
      connect(url);
      retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
    }, retryMs);
  }

  // React to URL changes
  createEffect(
    on(
      () => props.url,
      (url) => {
        clearTimeout(retryTimeout);
        retryMs = INITIAL_RETRY_MS;

        if (url) {
          connect(url);
        } else {
          setImgSrc(undefined);
          updateStatus("disconnected");
        }
      },
    ),
  );

  return (
    <div class="relative w-full h-full flex items-center justify-center">
      {imgSrc() ? (
        <img
          src={imgSrc()}
          alt="Camera stream"
          class="w-full h-full object-contain"
          onLoad={() => {
            retryMs = INITIAL_RETRY_MS;
            updateStatus("connected");
          }}
          onError={() => {
            updateStatus("disconnected");
            if (props.url) {
              retry(props.url);
            }
          }}
        />
      ) : (
        <div class="text-[#666] text-lg">No camera URL</div>
      )}
      {status() !== "connected" && imgSrc() && (
        <div class="absolute top-2 right-2 px-2.5 py-1 bg-black/70 rounded text-xs capitalize">{status()}</div>
      )}
    </div>
  );
};

export default CameraStream;

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import type Player from "video.js/dist/types/player";
import { Monitor } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

interface VideoPlayerProps {
  video_url: string;
}

type ScreenMode =
  | "Original"
  | "Square"
  | "Classic"
  | "Wide"
  | "Cinema"
  | "Ultrawide"
  | "Fill";

const SCREEN_MODES: ScreenMode[] = [
  "Original",
  "Square",
  "Classic",
  "Wide",
  "Cinema",
  "Ultrawide",
  "Fill",
];

const ZOOM_MAP: Record<
  ScreenMode,
  { scaleX: number; scaleY: number; objectFit: string }
> = {
  Original: { scaleX: 1, scaleY: 1, objectFit: "contain" },
  Square: { scaleX: 0.75, scaleY: 1, objectFit: "fill" },
  Classic: { scaleX: 0.85, scaleY: 1, objectFit: "fill" },
  Wide: { scaleX: 1, scaleY: 1, objectFit: "contain" },
  Cinema: { scaleX: 1, scaleY: 0.76, objectFit: "fill" },
  Ultrawide: { scaleX: 1, scaleY: 0.56, objectFit: "fill" },
  Fill: { scaleX: 1, scaleY: 1, objectFit: "cover" },
};

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const MONITOR_SVG = renderToStaticMarkup(
  <Monitor size={16} color="white" strokeWidth={2} />
);

let registered = false;

function registerScreenModeComponents(
  onModeChange: (mode: ScreenMode) => void,
  getMode: () => ScreenMode,
) {
  if (registered) return;
  registered = true;

  const MenuItem = videojs.getComponent("MenuItem") as any;
  const MenuButton = videojs.getComponent("MenuButton") as any;

  class ScreenModeMenuItem extends MenuItem {
    private modeValue: ScreenMode;

    constructor(player: any, options: any) {
      const modeValue: ScreenMode = options.modeValue;
      super(player, {
        selectable: true,
        selected: getMode() === modeValue,
      });
      this.modeValue = modeValue;

      const textEl = this.el().querySelector(
        ".vjs-menu-item-text",
      ) as HTMLElement | null;
      if (textEl) textEl.textContent = this.modeValue;
    }

    handleClick() {
      super.handleClick();
      onModeChange(this.modeValue);
      const menuButton = this.player().controlBar?.getChild(
        "ScreenModeMenuButton",
      );
      menuButton?.menu?.children().forEach((item: any) => {
        if (item instanceof ScreenModeMenuItem) {
          item.selected(item.modeValue === this.modeValue);
        }
      });
    }
  }

  class ScreenModeMenuButton extends MenuButton {
    constructor(player: any) {
      super(player, {});
      const placeholder = this.el().querySelector(
        ".vjs-icon-placeholder",
      ) as HTMLElement | null;
      if (placeholder) {
        placeholder.style.display = "flex";
        placeholder.style.alignItems = "center";
        placeholder.style.justifyContent = "center";
        placeholder.innerHTML = MONITOR_SVG;
      }
    }

    buildCSSClass() {
      return `vjs-screen-mode-button ${super.buildCSSClass()}`;
    }

    createItems() {
      return SCREEN_MODES.map(
        (modeValue) => new ScreenModeMenuItem(this.player_, { modeValue }),
      );
    }

    controlText_ = "Screen";
  }

  videojs.registerComponent("ScreenModeMenuItem", ScreenModeMenuItem);
  videojs.registerComponent("ScreenModeMenuButton", ScreenModeMenuButton);
}

export default function VideoPlayer({ video_url }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const screenModeRef = useRef<ScreenMode>("Wide");
  const [screenMode, setScreenMode] = useState<ScreenMode>("Wide");

  const handleModeChange = (mode: ScreenMode) => {
    screenModeRef.current = mode;
    setScreenMode(mode);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const player = playerRef.current;
      if (!player || player.isDisposed()) return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      const duration = player.duration() ?? 0;

      const seek = (delta: number) => {
        const current = player.currentTime() ?? 0;
        player.currentTime(Math.max(0, Math.min(duration, current + delta)));
      };

      const changeVolume = (delta: number) => {
        const vol = Math.max(0, Math.min(1, (player.volume() ?? 1) + delta));
        player.volume(vol);
        if (player.muted() && delta > 0) player.muted(false);
      };

      const changeSpeed = (direction: 1 | -1) => {
        const idx = PLAYBACK_RATES.indexOf(player.playbackRate() ?? 1);
        const nextIdx = Math.max(
          0,
          Math.min(PLAYBACK_RATES.length - 1, idx + direction),
        );
        player.playbackRate(PLAYBACK_RATES[nextIdx]);
      };

      switch (e.key) {
        case " ":
        case "k":
        case "K":
          e.preventDefault();
          player.paused() ? player.play() : player.pause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(-5);
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(5);
          break;
        case "j":
        case "J":
          e.preventDefault();
          seek(-10);
          break;
        case "l":
        case "L":
          e.preventDefault();
          seek(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          changeVolume(0.05);
          break;
        case "ArrowDown":
          e.preventDefault();
          changeVolume(-0.05);
          break;
        case "m":
        case "M":
          e.preventDefault();
          player.muted(!player.muted());
          break;
        case "f":
        case "F":
          e.preventDefault();
          player.isFullscreen()
            ? player.exitFullscreen()
            : player.requestFullscreen();
          break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            player.currentTime(duration * parseInt(e.key, 10) * 0.1);
          }
          break;
        case "Home":
          e.preventDefault();
          player.currentTime(0);
          break;
        case "End":
          e.preventDefault();
          player.currentTime(duration);
          break;
        case ",":
          if (player.paused()) {
            e.preventDefault();
            player.currentTime((player.currentTime() ?? 0) - 1 / 30);
          }
          break;
        case ".":
          if (player.paused()) {
            e.preventDefault();
            player.currentTime((player.currentTime() ?? 0) + 1 / 30);
          }
          break;
        case ">":
          e.preventDefault();
          changeSpeed(1);
          break;
        case "<":
          e.preventDefault();
          changeSpeed(-1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    registerScreenModeComponents(handleModeChange, () => screenModeRef.current);

    if (!playerRef.current && containerRef.current) {
      const videoEl = document.createElement("video-js");
      videoEl.classList.add("vjs-big-play-centered");
      containerRef.current.appendChild(videoEl);

      playerRef.current = videojs(videoEl, {
        controls: true,
        fluid: true,
        aspectRatio: "16:9",
        autoplay: false,
        playbackRates: PLAYBACK_RATES,
        enableSmoothSeeking: true,
        sources: [
          { src: video_url, type: "video/mp4" },
          { src: video_url, type: "video/webm" },
        ],
        controlBar: {
          remainingTimeDisplay: true,
          currentTimeDisplay: false,
          timeDivider: false,
          durationDisplay: false,
          pictureInPictureToggle: false,
          skipButtons: { forward: 10, backward: 10 },
          children: [
            "playToggle",
            "skipBackward",
            "skipForward",
            "volumePanel",
            "progressControl",
            "remainingTimeDisplay",
            "playbackRateMenuButton",
            "ScreenModeMenuButton",
            "fullscreenToggle",
          ],
        },
        html5: {
          vhs: { overrideNative: true, withCredentials: true },
          nativeAudioTracks: false,
          nativeVideoTracks: false,
        },
      });

      playerRef.current.ready(() => {
        playerRef.current!.on("fullscreenchange", () => {
          if (playerRef.current!.isFullscreen() && screen.orientation) {
            screen.orientation.lock("landscape").catch(() => {});
          } else if (
            !playerRef.current!.isFullscreen() &&
            screen.orientation
          ) {
            screen.orientation.unlock();
          }
        });
      });
    } else if (playerRef.current) {
      playerRef.current.src([
        { src: video_url, type: "video/mp4" },
        { src: video_url, type: "video/webm" },
      ]);
    }
  }, [video_url]);

  useEffect(() => {
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!playerRef.current) return;

    const applyZoom = () => {
      const videoEl = playerRef.current!.el().querySelector("video");
      if (!videoEl) return;
      const { scaleX, scaleY, objectFit } = ZOOM_MAP[screenMode];
      videoEl.style.transition = "transform 0.3s ease";
      videoEl.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`;
      videoEl.style.objectFit = objectFit;
      videoEl.style.width = "100%";
      videoEl.style.height = "100%";
    };

    if ((playerRef.current as any).isReady_) {
      applyZoom();
    } else {
      playerRef.current.ready(applyZoom);
    }
  }, [screenMode]);

  return (
    <div className="w-full rounded-t-xl overflow-hidden bg-black">
      <div ref={containerRef} className="w-full" />
      <style>{`
        .vjs-screen-mode-button .vjs-icon-placeholder::before {
          content: none;
        }
        .vjs-screen-mode-button .vjs-icon-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .video-js .vjs-progress-control {
          flex: 1 1 auto;
          min-width: 0;
        }
      `}</style>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import type Player from "video.js/dist/types/player";

interface VideoPlayerProps {
  video_url: string;
}

type ScreenMode = "Original" | "Square" | "Classic" | "Wide" | "Cinema" | "Ultrawide" | "Fill";

const SCREEN_MODES: ScreenMode[] = ["Original", "Square", "Classic", "Wide", "Cinema", "Ultrawide", "Fill"];

const ZOOM_MAP: Record<ScreenMode, { scaleX: number; scaleY: number; objectFit: string }> = {
  Original:  { scaleX: 1,    scaleY: 1,    objectFit: "contain" },
  Square:    { scaleX: 0.75, scaleY: 1,    objectFit: "fill" },
  Classic:   { scaleX: 0.85, scaleY: 1,    objectFit: "fill" },
  Wide:      { scaleX: 1,    scaleY: 1,    objectFit: "contain" },
  Cinema:    { scaleX: 1,    scaleY: 0.76, objectFit: "fill" },
  Ultrawide: { scaleX: 1,    scaleY: 0.56, objectFit: "fill" },
  Fill:      { scaleX: 1,    scaleY: 1,    objectFit: "cover" },
};

let registered = false;

function registerScreenModeComponents(
  onModeChange: (mode: ScreenMode) => void,
  getMode: () => ScreenMode
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

      const textEl = this.el().querySelector(".vjs-menu-item-text") as HTMLElement | null;
      if (textEl) textEl.textContent = this.modeValue;
    }

    handleClick() {
      super.handleClick();
      onModeChange(this.modeValue);
      const menuButton = this.player().controlBar?.getChild("ScreenModeMenuButton") as any;
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
    }

    buildCSSClass() {
      return `vjs-screen-mode-button ${super.buildCSSClass()}`;
    }

    createItems() {
      return SCREEN_MODES.map((modeValue) => new ScreenModeMenuItem(this.player_, { modeValue }));
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
        playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
        poster: "https://cdn.jsdelivr.net/npm/@googledrive/index@2.2.3/images/poster.jpg",
        enableSmoothSeeking: true,
        sources: [
          { src: video_url, type: "video/mp4" },
          { src: video_url, type: "video/webm" },
        ],
        controlBar: {
          pictureInPictureToggle: false,
          skipButtons: { forward: 10, backward: 10 },
          children: [
            "playToggle",
            "skipBackward",
            "skipForward",
            "volumePanel",
            "currentTimeDisplay",
            "timeDivider",
            "durationDisplay",
            "progressControl",
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
          } else if (!playerRef.current!.isFullscreen() && screen.orientation) {
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
      const videoEl = playerRef.current!.el().querySelector("video") as HTMLVideoElement | null;
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
          content: "⛶";
          font-size: 1.1em;
          line-height: 3;
        }
      `}</style>
    </div>
  );
}
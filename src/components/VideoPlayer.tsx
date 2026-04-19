import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import type Player from "video.js/dist/types/player";

interface VideoPlayerProps {
  video_url: string;
}

export default function VideoPlayer({ video_url }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
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
        },
        html5: {
          vhs: { overrideNative: true, withCredentials: true },
          nativeAudioTracks: false,
          nativeVideoTracks: false,
        },
      });

      playerRef.current.ready(function () {
        playerRef.current!.on("fullscreenchange", function () {
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

  return (
    <div className="w-full rounded-t-xl overflow-hidden bg-black">
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
import { useState } from "react";
import type { PlayResponse } from "../types/play";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileVideo, HardDrive, User, Clock, Download, Play, Send } from "lucide-react";

const streamApps = (url: string, name: string) => [
  { id: "mx",       label: "MX Player",  href: `intent:${url}#Intent;package=com.mxtech.videoplayer.ad;S.title=${name};end` },
  { id: "vlc",      label: "VLC Mobile", href: `vlc://${url.replace(/^https?:\/\//, "")}` },
  { id: "playit",   label: "PlayIt",     href: `playit://playerv2/video?url=${url}&` },
  { id: "splayer",  label: "SPlayer",    href: `intent:${url}#Intent;action=com.young.simple.player.playback_online;package=com.young.simple.player;end` },
  { id: "jplayer",  label: "JPlayer",    href: `intent:${url}#Intent;package=com.qp.jplayer;end` },
  { id: "kmplayer", label: "KMPlayer",   href: `intent:${url}#Intent;package=com.kmplayer;end` },
  { id: "hdplayer", label: "HDPlayer",   href: `intent:${url}#Intent;package=uplayer.video.player;end` },
  { id: "nplayer",  label: "nPlayer",    href: `nplayer-${url}` },
];

export default function VideoInfo({
  video_url,
  f_name,
  f_size,
  f_owner,
  f_time,
  tg_file_url,
}: PlayResponse) {
  const [streamOpen, setStreamOpen] = useState(false);
  const apps = streamApps(video_url, encodeURIComponent(f_name));

  return (
    <div className="bg-card text-card-foreground rounded-b-xl p-3 space-y-4">
      <div className="space-y-2">

        <Button asChild className="w-full">
          <a href={video_url} download={f_name}>
            <Download className="size-4" />
            Download
            <Download className="size-4" />
          </a>
        </Button>

        <DropdownMenu open={streamOpen} onOpenChange={setStreamOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full">
              <Play className="size-4" />
              Stream
              <Play className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
          >
            {apps.map((app) => (
              <DropdownMenuItem
                key={app.id}
                className="justify-center cursor-pointer"
                onClick={() => { window.location.href = app.href; }}
              >
                {app.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button asChild variant="outline" className="w-full">
          <a href={tg_file_url} target="_blank" rel="noreferrer">
            <Send className="size-4" />
            Telegram Download
            <Send className="size-4" />
          </a>
        </Button>

      </div>

      <Separator />

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <FileVideo className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">File Name:</span>
          <span className="font-medium">{f_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <HardDrive className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">File Size:</span>
          <Badge variant="secondary">{f_size}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <User className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">File Owner:</span>
          <span>{f_owner}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Created Time:</span>
          <span>{f_time}</span>
        </div>
      </div>
    </div>
  );
}
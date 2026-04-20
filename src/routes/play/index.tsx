import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { fetchPlayByMeta } from "@/api/play";
import VideoPlayer from "@/components/VideoPlayer";
import VideoInfo from "@/components/VideoInfo";
import ErrorPage from "@/components/ErrorPage";
import { Spinner } from "@/components/ui/spinner";

const searchSchema = z.object({
  url: z.string().min(1, "url is required"),
  meta: z.string().min(1, "meta is required"),
});

export const Route = createFileRoute("/play/")({
  validateSearch: searchSchema,
  loader: async ({ location }) => {
    const { url, meta } = location.search as z.infer<typeof searchSchema>;
    return await fetchPlayByMeta(url, meta);
  },
  pendingComponent: () => (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Spinner className="size-6 text-primary" />
    </div>
  ),
  errorComponent: ({ error }) => (
    <ErrorPage
      message={error instanceof Error ? error.message : "Unknown error"}
    />
  ),
  component: PlayByMeta,
});

function PlayByMeta() {
  const data = Route.useLoaderData();
  return (
    <div className="flex justify-center items-start min-h-screen bg-background p-2">
      <div className="w-full max-w-md shadow-md rounded-xl">
        <VideoPlayer video_url={data.video_url} />
        <VideoInfo {...data} />
      </div>
    </div>
  );
}

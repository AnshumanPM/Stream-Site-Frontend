import { createFileRoute } from "@tanstack/react-router";
import { fetchPlayById } from "@/api/play";
import VideoPlayer from "@/components/VideoPlayer";
import VideoInfo from "@/components/VideoInfo";
import ErrorPage from "@/components/ErrorPage";

export const Route = createFileRoute("/play/$url_id")({
  loader: async ({ params }) => {
    return await fetchPlayById(params.url_id);
  },
  errorComponent: ({ error }) => (
    <ErrorPage
      message={error instanceof Error ? error.message : "Unknown error"}
    />
  ),
  component: PlayById,
});

function PlayById() {
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

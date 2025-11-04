import { NextRequest, NextResponse } from "next/server";

const YT_API = "https://www.googleapis.com/youtube/v3";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")!;
    const max = searchParams.get("max")!;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const searchUrl = new URL(`${YT_API}/search`);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("maxResults", max);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("key", process.env.YOUTUBE_API_KEY!);

    const response = await fetch(searchUrl.toString());
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to fetch Youtube data");
    }

    const videoIds = (data.items || [])
      .map((item: any) => item.id.videoId)
      .join(",");

    if (!videoIds) {
      return NextResponse.json(
        { error: "Failed to get video IDS" },
        { status: 400 }
      );
    }

    const detailsUrl = new URL(`${YT_API}/videos`);
    detailsUrl.searchParams.set("part", "contentDetails,snippet");
    detailsUrl.searchParams.set("id", videoIds);
    detailsUrl.searchParams.set("key", process.env.YOUTUBE_API_KEY!);

    const detailsRes = await fetch(detailsUrl.toString());
    const detailsData = await detailsRes.json();

    if (!detailsRes.ok) {
      throw new Error(detailsData.error?.message || "Failed to fetch details");
    }

    const combined = detailsData.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      thumbnail:
        video.snippet.thumbnails.medium?.url ||
        video.snippet.thumbnails.default?.url,
      duration: video.contentDetails?.duration || "PT0S",
      url: `https://www.youtube.com/watch?v=${video.id}`,
    }));

    return NextResponse.json(combined, { status: 200 });
  } catch (error) {
    console.error(`GET /api/youtube/search error`, error);
    const err = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

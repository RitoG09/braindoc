import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const searchQuery = searchParams.get('q');

        if (!searchQuery) {
            return NextResponse.json(
                { error: "Search query is required" },
                { status: 400 }
            );
        }

        const encodedQuery = encodeURIComponent(searchQuery);
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodedQuery}&videoDuration=medium&type=video&videoEmbeddable=true&maxResults=5&key=${process.env.YOUTUBE_API_KEY}`;
        const { data } = await axios.get(apiUrl);

        console.log("YouTube API response received:", data.items?.length || 0, "items");

        if (data.items && data.items.length > 0) {
            console.log("First item structure:", JSON.stringify(data.items[0], null, 2));
            console.log("First item ID:", data.items[0].id);
            console.log("First item snippet:", data.items[0].snippet);
        }

        if (!data || !data.items || data.items.length === 0) {
            console.log("No videos found in response");
            return NextResponse.json(
                { videos: [] },
                { status: 200 }
            );
        }

       //from docs (yt data v3)
        const videos = data.items
            .filter((item:any) => {
                //only process video results with required fields
                const isValid = item &&
                    item.id &&
                    item.id.kind === 'youtube#video' &&
                    item.id.videoId &&
                    item.snippet &&
                    item.snippet.title;

                if (!isValid) {
                    console.log("Filtered out invalid item:", item);
                }

                return isValid;
            })
            .map((item) => {
                try {
                    return {
                        videoId: item.id.videoId,
                        title: item.snippet.title || "Untitled Video",
                        description: item.snippet.description || "No description available",
                        thumbnail: item.snippet.thumbnails?.medium?.url ||
                            item.snippet.thumbnails?.default?.url ||
                            item.snippet.thumbnails?.high?.url ||
                            `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`,
                        channelTitle: item.snippet.channelTitle || "Unknown Channel",
                        publishedAt: item.snippet.publishedAt ?
                            new Date(item.snippet.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            }) : "Unknown Date"
                    };
                } catch (mapError) {
                    console.error("Error mapping video item:", mapError, "Item:", item);
                    return null;
                }
            })
            .filter(video => video !== null); //Remove any null entries

        console.log("Processed videos:", videos.length);

        if (videos.length === 0) {
            console.log("No valid video items found after filtering");
            return NextResponse.json(
                { videos: [], message: "No valid videos found in the search results" },
                { status: 200 }
            );
        }

        return NextResponse.json({ videos });

    } catch (error: any) {
        console.error("YouTube search error details:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText
        });
        if (error.response?.status === 403) {
            return NextResponse.json(
                { error: "YouTube API quota exceeded or invalid API key" },
                { status: 403 }
            );
        } else if (error.response?.status === 400) {
            return NextResponse.json(
                { error: "Invalid request to YouTube API" },
                { status: 400 }
            );
        } else {
            return NextResponse.json(
                { error: "Failed to search YouTube", details: error.message },
                { status: 500 }
            );
        }
    }
}
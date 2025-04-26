import { NextResponse } from "next/server";
import { getAppThumbnails } from "@/lib/imagekit";

export async function GET() {
  try {
    const images = await getAppThumbnails();
    const response = NextResponse.json(images);

    // Set Cache-Control header for 10 minutes
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=600, stale-while-revalidate=600"
    );

    return response;
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

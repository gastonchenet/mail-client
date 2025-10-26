import { NextResponse } from "next/server";

export function POST() {
  try {
    const upstream = fetch(`${process.env.API_BASE}/trash/empty`, {
      method: "POST",
      headers: {
        "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID!,
        "CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET!,
      },
    });

    return upstream;
  } catch (err) {
    console.error("send proxy error", err);
    return NextResponse.json("Server error", { status: 500 });
  }
}

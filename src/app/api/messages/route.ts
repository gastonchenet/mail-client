import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const upstream = fetch(`${process.env.API_BASE}/messages`, {
      method: "POST",
      body: formData,
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

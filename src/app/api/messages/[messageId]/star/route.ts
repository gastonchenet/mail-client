import { NextResponse } from "next/server";

type DeleteParams = {
  params: Promise<{ messageId: string }>;
};

export async function POST(_req: Request, { params: _params }: DeleteParams) {
  try {
    const params = await _params;

    const upstream = fetch(
      `${process.env.API_BASE}/messages/${params.messageId}/star`,
      {
        method: "POST",
        headers: {
          "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID!,
          "CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET!,
        },
      }
    );

    return upstream;
  } catch (err) {
    console.error("send proxy error", err);
    return NextResponse.json("Server error", { status: 500 });
  }
}

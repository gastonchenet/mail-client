import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gche.me",
      port: 587,
      secure: false,
      auth: { user: "mailuser", pass: process.env.SMTP_KEY },
    });

    const formData = await req.formData();

    const rawSender = formData.get("from") as string;
    const toAddresses = formData.getAll("to") as string[];
    const ccAddresses = formData.getAll("cc") as string[];
    const subject = formData.get("subject") as string;
    const textContent = formData.get("text") as string;
    const htmlContent = formData.get("html") as string;
    const attachments = formData.getAll("attachment") as File[];

    if (!rawSender)
      return new Response("You should enter sender data.", { status: 403 });

    if (toAddresses.length < 1)
      return new Response(
        "You should enter at least one destination address.",
        { status: 403 }
      );

    const sender = JSON.parse(rawSender);

    if (!sender.username || !sender.email)
      return new Response("You should enter sender data.", { status: 403 });

    await transporter.sendMail({
      from: `'${sender.username}' <${sender.email}>`,
      to: toAddresses,
      cc: ccAddresses,
      subject: subject || "(no subject)",
      text: textContent || "",
      html: htmlContent || "",
      attachments: await Promise.all(
        attachments.map(async (file) => ({
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
          contentType: file.type || "application/octet-stream",
        }))
      ),
    });

    return new Response("Sent", { status: 200 });
  } catch (err) {
    console.error("send proxy error", err);
    return NextResponse.json("Server error", { status: 500 });
  }
}

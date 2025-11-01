import { USER_EMAIL, USER_NAME } from "@/constants/User";

type Options = {
  to: string[];
  cc: string[];
  subject: string;
  text: string;
  html: string;
  attachments: File[];
  trackMessage: boolean;
};

export default async function sendMessage(options: Options) {
  const formData = new FormData();

  formData.append(
    "from",
    JSON.stringify({
      username: USER_NAME,
      email: USER_EMAIL,
    })
  );

  if (options.to.length < 1) return "You should enter at least one recipient.";
  if (options.subject === "") return "You should enter a subject.";
  if (options.attachments.length === 0 && options.text === "")
    return "You should enter some content to the email.";

  options.to.forEach((to) => formData.append("to", to));
  options.cc.forEach((cc) => formData.append("cc", cc));

  formData.append("subject", options.subject);
  formData.append("trackMessage", options.trackMessage ? "1" : "0");
  formData.append("text", options.text);
  formData.append("html", options.html);

  options.attachments.forEach((a) => formData.append("attachment", a));

  const res = await fetch("/api/messages", {
    method: "POST",
    body: formData,
  });

  return res.ok ? null : "Error while sending email.";
}

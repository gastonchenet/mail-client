import messages from "../routes/messages";
import trash from "../routes/trash";

export default async function fetch(request, env, _ctx) {
  const { pathname } = new URL(request.url);
  const { success } = await env.RATE_LIMITER.limit({ key: pathname });

  if (!success) {
    return new Response(`429 Failure - rate limit exceeded for '${pathname}'`, {
      status: 429,
    });
  }

  try {
    let response = null;

    response ||= await messages.call(request, env);
    response ||= await trash.call(request, env);
    response ||= new Response("Not Found", { status: 404 });

    return response;
  } catch (error) {
    return new Response(`Invalid token: ${error.message}`, {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

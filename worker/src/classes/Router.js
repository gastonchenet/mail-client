import { jwtVerify, createRemoteJWKSet } from "jose";

export default class Router {
  callbacks = [];

  #set(method, pathname, callback, bypassVerif) {
    this.callbacks.push({
      method,
      pathname,
      callback,
      bypassVerif,
    });
  }

  async call(request, env) {
    const token = request.headers.get("cf-access-jwt-assertion");
    const url = new URL(request.url);
    let response = null;

    await Promise.all(
      this.callbacks.map(async (c) => {
        if (response || request.method !== c.method) return null;

        let regex;

        if (c.pathname instanceof RegExp) {
          regex = c.pathname;
        } else {
          const parsedPathname = c.pathname.replace(
            /:([a-zA-Z0-9_-]+)/g,
            "(?<$1>[a-zA-Z0-9._-]+)"
          );

          regex = new RegExp("^" + parsedPathname + "$");
        }

        const matches = url.pathname.match(regex);
        if (!matches) return null;

        if (!c.bypassVerif && !token) {
          response = new Response("Missing required CF Access JWT", {
            status: 403,
            headers: { "Content-Type": "text/plain" },
          });
        }

        const JWKS = createRemoteJWKSet(
          new URL(`${env.TEAM_DOMAIN}/cdn-cgi/access/certs`)
        );

        await jwtVerify(token, JWKS, {
          issuer: env.TEAM_DOMAIN,
          audience: env.POLICY_AUD,
        });

        response ??= c.callback({
          params: { ...matches.groups },
          env,
          request,
        });

        return response;
      })
    );

    return response;
  }

  get = (pathname, callback, bypassVerif = false) =>
    this.#set("GET", pathname, callback, bypassVerif);

  post = (pathname, callback, bypassVerif = false) =>
    this.#set("POST", pathname, callback, bypassVerif);

  put = (pathname, callback, bypassVerif = false) =>
    this.#set("PUT", pathname, callback, bypassVerif);

  delete = (pathname, callback, bypassVerif = false) =>
    this.#set("DELETE", pathname, callback, bypassVerif);
}

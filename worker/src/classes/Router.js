export default class Router {
  callbacks = [];

  #set(method, pathname, callback) {
    this.callbacks.push({
      method,
      pathname,
      callback,
    });
  }

  call(request, env) {
    const url = new URL(request.url);
    let response = null;

    this.callbacks.find((c) => {
      if (request.method !== c.method) return null;

      let regex;

      if (c.pathname instanceof RegExp) {
        regex = c.pathname;
      } else {
        const parsedPathname = c.pathname.replace(
          /:([a-zA-Z0-9_-]+)/g,
          "(?<$1>[a-zA-Z0-9._-]+)"
        );

        regex = new RegExp("^" + parsedPathname);
      }

      const matches = url.pathname.match(regex);
      if (!matches) return null;

      response = c.callback({ params: { ...matches.groups }, env, request });
    });

    return response;
  }

  get = (pathname, callback) => this.#set("GET", pathname, callback);
  post = (pathname, callback) => this.#set("POST", pathname, callback);
  put = (pathname, callback) => this.#set("PUT", pathname, callback);
  delete = (pathname, callback) => this.#set("DELETE", pathname, callback);
}

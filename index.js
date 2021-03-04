const fs = require("fs/promises");

const reqResMapper = require("./lib/compatLayer");
const serveStatic = require('./lib/static')

const handler = (app, directory) => {
  const handle = app.getRequestHandler()

  return async (event, context) => {
    if (event.path.startsWith("/_next")) {
      const requestPath = `${directory}/${event.path.replace("/_next/", "/.next/")}`;
      return serveStatic(requestPath, context);
    }

    if (!event.path.endsWith('/')) {
      const requestPath = `${directory}/public${event.path}`
      try {
        await fs.access(requestPath)
        return serveStatic(requestPath, context);
      } catch(err) {
        console.debug('no static file found', { requestPath })
      }
    }

    return new Promise((resolve, reject) => {
      const { req, res } = reqResMapper(event, (err, response) => resolve(response));
      const parsedUrl = new URL(req.url, "http://w.w");
      const { pathname, query } = parsedUrl;

      console.log("rendering page", { pathname });
      handle(req, res, parsedUrl);
    })
  };
};

module.exports = handler;

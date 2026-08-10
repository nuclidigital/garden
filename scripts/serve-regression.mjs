import http from "node:http"
import serveHandler from "serve-handler"

const host = "127.0.0.1"
const port = 4173

const server = http.createServer((request, response) =>
  serveHandler(request, response, {
    public: "public",
    cleanUrls: true,
    directoryListing: false,
  }),
)

server.listen(port, host)

const shutdown = () => server.close(() => process.exit(0))
process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)

const express = require("express");
const next = require("next");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = next({ dev: true });
const handle = app.getRequestHandler();

app.prepare()
    .then(() => {
        //apply proxy in dev module
        const server = express();
        server.use(
            "/api",
            createProxyMiddleware({
                target: "http://localhost:8000",
                changeOrigin: true,
            })
        );
        server.all("*", (req, res) => {
            return handle(req, res);
        });
        server.listen(3000, (err) => {
            if (err) {
                throw err;
            }
            console.log("Ready on http://localhost:8000");
        });
    })
    .catch((e) => console.log(e));

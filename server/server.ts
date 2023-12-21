import http from "node:http";
import fs from "node:fs";
const PORT = process.env.PORT || 8080;
console.log(`running server on http://localhost:${PORT}`);

const handleGetRequest: http.RequestListener = (req, res) => {
    switch (req.url) {
        case "/styles.js":
            {
                fs.readFile("./dist/app/styles.js", (err, data) => {
                    if (err?.code === "ENOENT") {
                        console.log("file not found?", err.message);
                        res.writeHead(404, "not found");
                        res.end();
                    }
                    res.writeHead(200, { "Content-Type": "text/javascript" });
                    res.end(data, "utf-8");
                });
            }
            break;
        case "/index.js":
            {
                fs.readFile("./dist/app/index.js", (err, data) => {
                    if (err?.code === "ENOENT") {
                        console.log("file not found?", err.message);
                        res.writeHead(404, "not found");
                        res.end();
                    }
                    res.writeHead(200, { "Content-Type": "text/javascript" });
                    res.end(data, "utf-8");
                });
            }
            break;
        case "/":
            {
                fs.readFile("./dist/app/index.html", (err, data) => {
                    if (err?.code === "ENOENT") {
                        console.log("file not found?", err.message);
                        res.writeHead(404, "not found");
                        res.end();
                    }
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(data, "utf-8");
                });
            }
            break;
        default:
            res.writeHead(404);
            res.end();
    }
};

const router: http.RequestListener = (req, res) => {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Request methods you wish to allow
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", "true");

    console.log("someone made a request", req.url, req.method);
    if (req.method === "GET") {
        handleGetRequest(req, res);
    }
};

http.createServer(router).listen(PORT);

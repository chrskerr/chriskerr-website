"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const corsSettings = {
    origin: ["http://localhost:3000", "https://www.chriskerr.com.au"],
    credentials: true,
};
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: corsSettings,
});
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)(corsSettings));
app.post("/editor", (req, res) => {
    if (req.headers.token !== constants_1.apiToken)
        return res.status(500).end();
    const body = req.body;
    io.to(body.note_id).emit("change", body);
    return res.status(200).end();
});
io.on("connection", socket => {
    socket.on("join", room => {
        socket.join(room);
    });
});
const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`listening on *:${port}`);
});

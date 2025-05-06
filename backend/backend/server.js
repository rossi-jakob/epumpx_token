const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require('./config/db');
const config = require('./config/config');
const { getOffChainCurveInfo } = require("./utils/index")
const { startWebSocketServer } = require("./utils/websocket")
const tgLoginBot = require('./loginBot/bot');

const urlencodeParser = bodyParser.urlencoded({ extended: false });
var miscRouter = require("./routes/miscRouter");

getOffChainCurveInfo()
async function server() {
    db.mongoose
        .connect(db.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => {
            console.log("Connected to the database!");
        })
        .catch(err => {
            console.log("Cannot connect to the database!", err);
            process.exit();
        });

    app.use(bodyParser.json(), urlencodeParser);
    app.use(cors({
        origin: '*'
    }));

    app.use("/api/misc", miscRouter);

    app.use((req, res, next) => { //doesn't send response just adjusts it
        res.header("Access-Control-Allow-Origin", "*") //* to give access to any origin
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept, Authorization" //to give access to all the headers provided
        );
        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET'); //to give access to all the methods provided
            return res.status(200).json({});
        }
        next(); //so that other routes can take over
    })

    app.use((err, req, res, next) => {
        res.locals.error = err;
        if (err.status >= 100 && err.status < 600)
            res.status(err.status);
        else
            res.status(500);
        res.json({
            message: err.message,
            error: err
        });
    });   

    app.get('/', (req, res) => {
        res.send('API is runninmg');
    });

    app.use(express.static('uploads'));

    const httpServer = http.createServer(app);
    httpServer.listen(config.mainPort, () => {
        console.log(`Server is running on port ${config.mainPort}`);
    });

    startWebSocketServer(
        httpServer,
        async (socket) => {
            socket.emit("HELLO", JSON.stringify({ message: "OK" }));
        },
        async () => {
        }
    );

    tgLoginBot.init();
}

server();
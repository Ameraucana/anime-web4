const axios = require("axios");
const express = require("express");
const http = require("http");
const cors = require("cors");
const fs = require("fs").promises;

const app = express();
const port = 5000;

const server = http.Server(app);
server.listen(port, () => console.log(`now listening on port ${port}, env ${app.get("env")}`));
const io = require("socket.io")(server);

process.on("SIGINT", () => {
    server.close(() => {
        process.exit(0);
    });
});

const corsOptions = {
    origin: "http://localhost:3000"
};
app.use(cors(corsOptions));

app.use(express.json());

app.get("/read",  async (request, response) => {
    let fileContent = await fs.readFile("./names.json", "utf8");
    response.send(fileContent);
});

app.post("/startup", async (request, response) => {
    let apiData = request.body.data;

    let fileContent = await fs.readFile("./names.json", "utf8");
    fileContent = JSON.parse(fileContent);
    for (let anilistName of apiData) {
        if (!Object.keys(fileContent).includes(anilistName)) {
            fileContent[anilistName] = "";
        }
    }
    for (let name of Object.keys(fileContent)) {
        if (!apiData.includes(name)) {
            delete fileContent[name];
        }
    }
    await fs.writeFile("./names.json", JSON.stringify(fileContent, null, 2));
    response.sendStatus(200);
});

app.post("/namechange", async (request, response) => {
    console.log(request.body);
    const [ targetName, nickname ] = request.body;
    const fileContent = await fs.readFile("./names.json", "utf8");
    const fileObj = JSON.parse(fileContent);
    for (let name of Object.keys(fileObj)) {
        if (targetName === name) {
            fileObj[targetName] = targetName !== nickname ? nickname : "";
            break;
        }
    }
    await fs.writeFile("./names.json", JSON.stringify(fileObj, null, 2));
    response.sendStatus(200);
});

app.post("/reset", async (request, response) => {
    const [ targetName ] = request.body;
    const fileContent = await fs.readFile("./names.json", "utf8");
    const fileObj = JSON.parse(fileContent);
    for (let name of Object.keys(fileObj)) {
        if (targetName === name) {
            fileObj[targetName] = "";
            break;
        }
    }
    await fs.writeFile("./names.json", JSON.stringify(fileObj, null, 2));
    response.sendStatus(200);
})

// 
app.get("/authcheck", async (request, response) => {
    let token = await fs.readFile("./access_token", "utf8");
    if (token.length === 0) {
        response.send("invalid");
        console.log("invalid token (file empty)");
        return;
    }
    // this is going to check if the token is valid.
    // if the file is empty, its contents are invalid, 
    // or the token has expired, this request will fail.
    // thereafter we run through the authentication grant.
    const query =
        `
        query ($id: Int) {
            Media(id: $id) {
                title {
                romaji
                }
            }
        }`;
    const variables = {
        id: 1
    };

    try {
        await axios({
            url: "https://graphql.anilist.co",
            method: "post",
            data: JSON.stringify({
                query: query,
                variables: variables
            }),
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        response.sendStatus(200);
    } catch {
        response.send("invalid");
    }
});

app.get("/auth", async (request, response) => {
    let token = await axios({
        url: "https://anilist.co/api/v2/oauth/token",
        method: "post",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        data: {
            "grant_type": "authorization_code",
            "client_id": "4134",
            "client_secret": "1dcJBJp163XlSgr16T3H4Ti3GrMqCi6jGJbZmTkO",
            "redirect_uri": "http://localhost:5000/auth",
            "code": request.query.code
        }
    });
    await fs.writeFile("./access_token", token.data.access_token);
    io.emit("token ready");
    response.send("Authenticated. You can close this tab."); 
});

app.get("/gettoken", async (request, response) => {
    const token = await fs.readFile("./access_token", "utf8");
    response.send(token);
});

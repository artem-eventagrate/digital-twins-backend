const server = require("http").createServer();
const io = require("socket.io")(server, {
    cors: true
});

let players = {};

function Player (id) {
    this.avatarId = id;
    this.bones = [];
}

io.sockets.on("connection", function (socket) {
    console.log("[INFO] - Connected " + socket.id);

    socket.on("connectAsClient", function() {
        console.log("[INFO] - Client connection accepted!");
        socket.emit("connectionAccepted", socket.id);
    });

    socket.on("avatarData", function(data) {
        try {
            if (!players[socket.id]) {
                players[socket.id] = new Player(data.avatarId);
                socket.broadcast.emit("initDigitalTwinsAvatar", players[socket.id].avatarId);
            }
            players[socket.id].bones = data.bones;

            socket.broadcast.emit("responseAvatarsData", players);
        }
        catch (e) {
            console.log("[ERROR] Parsing error: " + e.message);
        }
    });

    socket.on("close", function() {
        socket.broadcast.emit("deleteDigitalTwinsAvatar", players[socket.id].avatarId);
        console.log("[INFO] - Closed connection " + socket.id);
        delete players[socket.id];
    });
});

console.log("Server started on port 2565");
server.listen(3000);

const server = require("http").createServer();
const io = require("socket.io")(server, {
    cors: true
});

let players = {};
let stageParameters = {
    seats: {
        seatCenter: {
            id: 0,
            avatarTemplate: "Disabled",
            chairEnabled: true
        },
        seat01: {
            id: 1,
            avatarTemplate: "Disabled",
            chairEnabled: true
        },
        seat02: {
            id: 2,
            avatarTemplate: "Disabled",
            chairEnabled: true
        },
        seat03: {
            id: 3,
            avatarTemplate: "Disabled",
            chairEnabled: true
        },
        seat04: {
            id: 4,
            avatarTemplate: "Disabled",
            chairEnabled: true
        },
        seat05: {
            id: 5,
            avatarTemplate: "Disabled",
            chairEnabled: true
        },
        seat06: {
            id: 6,
            avatarTemplate: "Disabled",
            chairEnabled: true
        }
    },
    screen: {
        id: 0
    },
    customData: {
    }
};

function Player (id) {
    this.avatarId = id;
    this.bones = [];
}

io.sockets.on("connection", function (socket) {
    console.log("[INFO] - Connected " + socket.id);

    socket.on("connectAsClient", function() {
        console.log("[INFO] - Client connection accepted!");
        socket.emit("connectionAccepted", socket.id);
        socket.emit("getStageParameters", stageParameters);
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

    socket.on("micStateUpdate", function(data) {
        let dataObject = JSON.parse(data);
        socket.broadcast.emit("getMicState", {
            avatarId: dataObject.avatarId,
            isActive: dataObject.IsActivate
        });
    });

    socket.on("updateStageParameters", function(data) {
        stageParameters = data;
        socket.broadcast.emit("getStageParameters", stageParameters);
    });

    socket.on("close", function() {
        if (players[socket.id]) {
            socket.broadcast.emit("deleteDigitalTwinsAvatar", players[socket.id].avatarId);
        }
        console.log("[INFO] - Closed connection " + socket.id);
        delete players[socket.id];
    });
});

console.log("Server started on port 8080");
server.listen(8080);

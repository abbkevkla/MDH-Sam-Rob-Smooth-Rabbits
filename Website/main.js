const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");

tiletypes = [
    [ // 0
        [0, 1, 0], 
        [0, 1, 0],
        [0, 1, 0]
    ],
    [ // 1
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [ // 2
        [0, 1, 0],
        [1, 1, 0],
        [0, 0, 0]
    ],
    [ // 3
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    [ // 4
        [0, 0, 0],
        [0, 1, 1],
        [0, 1, 0]
    ],
    [ // 5
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 0]
    ],
    [ // 6
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0]
    ],
    [ // 7
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [ // 8
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0]
    ],
    [ // 9
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0]
    ],
    [ // 10
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
    ]
]
let maze = [
    ["S"]
];
let relative_pos = [0, 0];
let current_pos = [0, 0];
let current_width = 1;
let current_height = 1;

let size_x = 6; // Maze is 6x6 squares
let size_y = 6;
let dist_x = 0;
let dist_y = 0;
let tile_w = canvas.width/size_x; // Tilesize adapts to fit the given canvas
let tile_h = canvas.height/size_y;

context.fillStyle = "DarkViolet";
context.fillRect(0, 0, canvas.width, canvas.height);
context.fillStyle = "Chartreuse";
context.fillRect(current_pos[0]*tile_w, current_pos[1]*tile_h, tile_w, tile_h); 
context.closePath();

for (let r = 0; r < size_x; r++) { 
    for (let c = 0; c < size_y; c++) {
        context.beginPath();
        context.strokeStyle = "black";
        context.lineWidth = "2";
        context.rect(dist_x, dist_y, tile_w, tile_h); 
        context.stroke();
        dist_x = dist_x + tile_w;
    }
    dist_x = 0;
    dist_y = dist_y + tile_h; 
}


// function transformer(matrix) { // Turns a matrix of 1*1 tiles into a matrix with 3*3 tiles
//     let rows = matrix.length;
//     let cols = matrix[0].length;
//     let chunks = [];
//     let new_matrix = []
//     for (let r = 0; r < rows; r++) { // For each row
//         chunks = [ // Pushes 3 new rows at a time to new_matrix
//             [],
//             [],
//             []
//         ];
//         for (let c = 0; c < cols; c++) { // For each col
//             for (let tile_row = 0; tile_row < 3; tile_row++) { // For each row and col in a tile. Tiles are always sized 3*3
//                 for (let tile_col = 0; tile_col < 3; tile_col++) {
//                     chunks[tile_row].push(tile[tile_row][tile_col]);
//                 }
//             }
//         }
//         for (let chunk of chunks) {
//             new_matrix.push(chunk); // Push all chunks to new_matrix
//         }
//     }
//     return(new_matrix);
// }

function draw_tiles(x, y, tile_width, tile_height, tile) {
    let new_width = tile_width/3;
    let new_height = tile_height/3;
    let dist_x = x * tile_width;
    let dist_y = y * tile_height;
    for (let r = 0; r < 3; r++) { 
        for (let c = 0; c < 3; c++) {
            context.beginPath();
            if (tile[r][c] == 1) {
                context.fillStyle = "white";
            }
            else {
                context.fillStyle = "black";
            }
            context.fillRect(dist_x, dist_y, new_width, new_height); 
            context.fill();
            dist_x = dist_x + new_width;
        }
        dist_x = x * tile_width;       
        dist_y = dist_y + new_height; 
    }
}

function change_pos(direction, tiletype) { // e is the event, containing all the data of the keypress
    console.log("ran change_pos(), got: " + direction + " tile: " + tiletype);
    let activetile = tiletypes[tiletype];
    console.log(activetile);
    if (direction == "down") {
        if (current_pos[1] < size_y - 1) {
            console.log("down");
            current_pos[1] = current_pos[1] + 1;
            relative_pos[1] = relative_pos[1] + 1;

            if (typeof maze[relative_pos[1]] == "undefined") {
                current_height = current_height + 1;
                let new_row = [];
                for (let i = 0; i < current_width; i++) {
                    new_row.push("x");
                }
                new_row[relative_pos[0]] = tiletype;
                maze.push(new_row);   
            } 
            else {
                maze[relative_pos[1]][relative_pos[0]] = tiletype;
            } 
        } 
        else {
            console.log("can't go down");
        }
    }
    else if (direction == "up") {
        if (current_pos[1] > 0) {
            console.log("up");
            current_pos[1] = current_pos[1] - 1;

            if (typeof maze[relative_pos[1] - 1] == "undefined") {
                current_height = current_height + 1;
                let new_row = [];
                for (let i = 0; i < current_width; i++) {
                    new_row.push("x");
                }
                new_row[relative_pos[0]] = tiletype;
                maze.unshift(new_row);   
            } 
            else {
                relative_pos[1] = relative_pos[1] - 1;
                maze[relative_pos[1]][relative_pos[0]] = tiletype;
            } 
        } 
        else {
            console.log("can't go up");
        }
    }
    else if (direction == "left") {
        if (current_pos[0] > 0) {
            console.log("left");
            current_pos[0] = current_pos[0] - 1;
            if (typeof maze[relative_pos[1]][relative_pos[0] - 1] == "undefined") {
                current_width = current_width + 1;
                for (let i = 0; i < current_height; i++) {
                    maze[i].unshift("x");
                }
                maze[relative_pos[1]][0] = tiletype;
            }
            else {
                relative_pos[0] = relative_pos[0] - 1;
                maze[relative_pos[1]][relative_pos[0]] = tiletype;
            }
        }
        else {
            console.log("can't go left");
        }
    }
    else if (direction == "right") {
        if (current_pos[0] < size_x - 1) {
            console.log("right");
            current_pos[0] = current_pos[0] + 1; 
            relative_pos[0] = relative_pos[0] + 1;
            if (typeof maze[relative_pos[1]][relative_pos[0]] == "undefined") {
                current_width = current_width + 1;
                for (let i = 0; i < current_height; i++) {
                    maze[i].push("x");
                }
            } 
            maze[relative_pos[1]][relative_pos[0]] = tiletype;
        }
        else {
            console.log("can't go right");
        }
    }
    console.log(maze);
    // console.log(current_pos);
    draw_tiles(relative_pos[0], relative_pos[1], tile_w, tile_h, activetile);
}

function startConnect() {
    clientID = document.getElementById("ID").value;

    // Fetch the hostname/IP address and port number from the form
    host = document.getElementById("host").value;
    port = document.getElementById("port").value;

    // Print output for the user in the messages div
    document.getElementById("messages").innerHTML += '<span>Connecting to: ' + host + ' on port: ' + port + '</span><br/>';
    document.getElementById("messages").innerHTML += '<span>Using the following client value: ' + clientID + '</span><br/>';
  // Initialize new Paho client connection
    client = new Paho.MQTT.Client(host, Number(port), clientID);
    // Set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    client.connect({userName : "kevin.klarin@abbindustrigymnasium.se",password : "1337",
        onSuccess: onConnect,
        onFailure: onFail,
                   });
}
function onFail() {
    document.getElementById("messages").innerHTML += '<span>ERROR: Connection to: ' + host + ' on port: ' + port + ' failed.</span><br/>'

}  
let topic="kevin.klarin@abbindustrigymnasium.se/";
// Called when the client connects
function onConnect() {
    // Fetch the MQTT topic from the form
    newtopic = topic + document.getElementById("topic").value;
    console.log(newtopic);
    // Print output for the user in the messages div
    document.getElementById("messages").innerHTML += '<span>Subscribing to: ' + newtopic + '</span><br/>';
    document.getElementById("status").innerHTML = "connected";

    message= new Paho.MQTT.Message("Connected from webpage");
    message.destinationName = newtopic;
    client.send(message);

    // Subscribe to the requested topic
    client.subscribe(newtopic);
}
function onSend() {
    // Fetch the MQTT topic from the form
    // Print output for the user in the messages div'
    //let message = "Dont press that button";
    let message= document.getElementById("newMessage").value;
    //console.log(message);
      message= new Paho.MQTT.Message(message);
      message.destinationName=newtopic;
      client.send(message);
}
// Called when the client loses its connection
function onConnectionLost(responseObject) {
    document.getElementById("messages").innerHTML += '<span>ERROR: Connection lost</span><br/>';
    if (responseObject.errorCode !== 0) {
        document.getElementById("messages").innerHTML += '<span>ERROR: ' + + responseObject.errorMessage + '</span><br/>';
    }
}

// Called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived: " + message.payloadString);
    document.getElementById("messages").innerHTML += '<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>';
    document.getElementById("latest_msg").value = message.payloadString;
    change_pos(message.payloadString.split(" ")[0], message.payloadString.split(" ")[1]);
}

// Called when the disconnection button is pressed
function startDisconnect() {
    client.disconnect();
    document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/>';
}
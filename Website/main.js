const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");

tiletypes = [ // 0 indicates road, 1 indicates terrain
    [ // 0
        [1, 0, 1], 
        [1, 0, 1],
        [1, 0, 1]
    ],
    [ // 1
        [1, 1, 1],
        [0, 0, 0],
        [1, 1, 1]
    ],
    [ // 2
        [1, 0, 1],
        [0, 0, 1],
        [1, 1, 1]
    ],
    [ // 3
        [1, 0, 1],
        [1, 0, 0],
        [1, 1, 1]
    ],
    [ // 4
        [1, 1, 1],
        [1, 0, 0],
        [1, 0, 1]
    ],
    [ // 5
        [1, 1, 1],
        [0, 0, 1],
        [1, 0, 1]
    ],
    [ // 6
        [1, 0, 1],
        [0, 0, 1],
        [1, 0, 1]
    ],
    [ // 7
        [1, 0, 1],
        [0, 0, 0],
        [1, 1, 1]
    ],
    [ // 8
        [1, 0, 1],
        [1, 0, 0],
        [1, 0, 1]
    ],
    [ // 9
        [1, 1, 1],
        [0, 0, 0],
        [1, 0, 1]
    ],
    [ // 10
        [1, 0, 1],
        [0, 0, 0],
        [1, 0, 1]
    ]
]
let maze = [
];
let relative_pos = [0, 0];
let current_pos = [2, 4];
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
context.fillRect(current_pos[0] * tile_w, current_pos[1] * tile_h, tile_w, tile_h); 
context.closePath();

for (let r = 0; r < size_x; r++) { 
    let maze_row = [];
    for (let c = 0; c < size_y; c++) {
        maze_row.push("x");
        context.beginPath();
        context.strokeStyle = "black";
        context.lineWidth = "2";
        context.rect(dist_x, dist_y, tile_w, tile_h); 
        context.stroke();
        dist_x = dist_x + tile_w;
    }
    maze.push(maze_row);
    dist_x = 0;
    dist_y = dist_y + tile_h; 
}
maze[current_pos[1]][current_pos[0]] = "S";
console.log(maze);


class PriorityQueue { // A type of list where items are sorted based on a priority value. Items with a low priority value are placed first in the list
    constructor() { 
        this.items = []; // The main array
    } 

    enqueue(element, priority) { // enqueue is used to push new items into the list
        var qElement = {
            element: element, 
            priority: priority
        };
        var contain = false; 
    
        for (var i = 0; i < this.items.length; i++) { 
            if (this.items[i].priority > qElement.priority) { 
                this.items.splice(i, 0, qElement); 
                contain = true; 
                break; 
            } 
        } 
        if (!contain) { // If the new items priority is the highest it is placed at the end of the list
            this.items.push(qElement); 
        } 
    } 

    dequeue() { // Removes the first item in the list, a.k.a. the item with the lowesst priority, and returns it
            if (this.isEmpty()) 
                return "No items to remove"; 
            return this.items.shift(); 
        } 

    isEmpty() { // return true if the queue is empty
        return this.items.length == 0; 
    } 
}

function findActions(position, map, max_row, max_col, direction) { // Used to check a tile for its value and then return it
    if (position[0] >= 0 && position[0] <= max_row) {
        if (position[1] >= 0 && position[1] <= max_col) {
            let value = map[position[0]][position[1]];
            if (value != "x") { // "x" indicates that the tile can not be used
                return ["(" + String(position[0]) + ", " + String(position[1]) + ")", value, direction]
            } 
        }
    }
    return "n/a";
}

function CreateBoard(map) { // Converts a regular 2d matrix into a dict where each tile has a list of available actions
    let mazeDict = {};
    for (let r = 0; r < map.length; r++) { // For each row
        for (let c = 0; c < map[0].length; c++) { // For each column
            let position = "(" + String(r) + ", " + String(c) + ")";
            let actions = [];
            for (neighbour of [[[r + 1, c], "south"], [[r, c + 1], "east"], [[r - 1, c], "north"], [[r, c - 1], "west"]]) { // For each neigbour to the current tile, those being down, right, up and left
                let action = findActions(neighbour[0], map, map[0].length - 1, map.length - 1, neighbour[1]); 
                if (action != "n/a") {
                    actions.push(action);
                }
            mazeDict[position] = {state: map[c][r], actions: actions};
            }
        }
    }
    return mazeDict
}

function UniformCostSearch(startPos, map, goalPos) { // Finds the cheapest possible path
    let frontier = new PriorityQueue();
    exploredNodes = {};
    let startNode = [startPos, [], ["start"], 0]; // Startpos, actions, directions, cost
    frontier.enqueue(startNode, 0);
    while (frontier.isEmpty != true) {
        let values = frontier.dequeue() // Removes and returns the item with lowest priority
        let currentState = values.element[0];
        let actions = values.element[1];
        let directions = values.element[2] + ", ";
        let currentCost = values.element[3];
        if (currentState in exploredNodes != true || currentCost > exploredNodes[currentState]) { // If the node has not already been explored or a new cheaper path has been found
            exploredNodes[currentState] = currentCost;
            if (currentState == goalPos) { 
                console.log(startPos, "to", goalPos ,actions, currentCost);
                console.log("Directions: " + directions);
                return actions, directions
            }
            else {
                let successors = map[currentState];
                for (succ of successors["actions"]) {
                    let newAction = actions + succ[0];
                    let newCost = currentCost + succ[1];
                    let newDirection = directions + succ[2];
                    let newNode = [succ[0], newAction, newDirection, newCost];
                    frontier.enqueue(newNode, newCost); // Adds all possible movements to frontier
                }
            }
        }
    }
}

function transformer(matrix) { // Turns a matrix of 1*1 tiles into a matrix with 3*3 tiles
    let rows = matrix.length;
    let cols = matrix[0].length;
    let chunks = [];
    let new_matrix = []
    for (let r = 0; r < rows; r++) { // For each row
        chunks = [ // Pushes 3 new rows at a time to new_matrix
            [],
            [],
            []
        ];
        for (let c = 0; c < cols; c++) { // For each col
            for (let tile_row = 0; tile_row < 3; tile_row++) { // For each row and col in a tile. Tiles are always sized 3*3
                for (let tile_col = 0; tile_col < 3; tile_col++) {
                    chunks[tile_row].push(tile[tile_row][tile_col]);
                }
            }
        }
        for (let chunk of chunks) {
            new_matrix.push(chunk); // Push all chunks to new_matrix
        }
    }
    return(new_matrix);
}

function draw_tiles(x, y, tile_width, tile_height, tile) { // Takes a tile with a single value and turns it into a 3*3 tile that resembles the actual road
    let new_width = tile_width/3; // Divides the width and height by 3 to create a 3*3 tile, since that is how the more detailed tiles look
    let new_height = tile_height/3;
    let dist_x = x * tile_width;
    let dist_y = y * tile_height;
    for (let r = 0; r < 3; r++) { 
        for (let c = 0; c < 3; c++) {
            context.beginPath();
            if (tile[r][c] == 0) {
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

function change_pos(direction, tiletype) { // Changes the current position in the maze
    console.log("ran change_pos(), got: " + direction + " tile: " + tiletype);
    let activetile = tiletypes[tiletype];
    console.log(activetile);
    if (direction == "down") {
        if (current_pos[1] < size_y - 1) {
            console.log("down");
            current_pos[1] = current_pos[1] + 1;
            relative_pos[1] = relative_pos[1] + 1;
        } 
        else {
            console.log("can't go down");
        }
    }
    else if (direction == "up") {
        if (current_pos[1] > 0) {
            console.log("up");
            current_pos[1] = current_pos[1] - 1;
        } 
        else {
            console.log("can't go up");
        }
    }
    else if (direction == "left") {
        if (current_pos[0] > 0) {
            console.log("left");
            current_pos[0] = current_pos[0] - 1;
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
        }
        else {
            console.log("can't go right");
        }
    }
    console.log(maze);
    // console.log(current_pos);
    draw_tiles(relative_pos[0], relative_pos[1], tile_w, tile_h, activetile);
}

function FindPath() {
    let goalpos = document.getElementById("goalpos").value;
    console.log(goalpos);
}

function startConnect() { // When the connect-button is pressed
    // Fetch the hostname/IP address and port number from the form
    clientID = document.getElementById("ID").value;
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

function onConnect() { // Called when the client connects
    // Fetch the MQTT topic from the form
    newtopic = topic + document.getElementById("topic").value;
    console.log(newtopic);
    // Print output for the user in the messages div
    document.getElementById("messages").innerHTML += '<span>Subscribing to: ' + newtopic + '</span><br/>';
    document.getElementById("status").innerHTML = "connected";

    message = new Paho.MQTT.Message("Connected from webpage"); //Sends message to broker
    message.destinationName = newtopic;
    client.send(message);

    // Subscribe to the requested topic
    client.subscribe(newtopic);
}
function onSend() {
    // Fetch the MQTT topic from the form
    // Print output for the user in the messages div'
    let message= document.getElementById("newMessage").value;
      message = new Paho.MQTT.Message(message);
      message.destinationName = newtopic;
      client.send(message);
}

function onConnectionLost(responseObject) { // Called when the client loses its connection
    document.getElementById("messages").innerHTML += '<span>ERROR: Connection lost</span><br/>';
    if (responseObject.errorCode !== 0) {
        document.getElementById("messages").innerHTML += '<span>ERROR: ' + + responseObject.errorMessage + '</span><br/>';
    }
}

function onMessageArrived(message) { // Called when a message arrives
    console.log("onMessageArrived: " + message.payloadString);
    document.getElementById("messages").innerHTML += '<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>';
    document.getElementById("latest_msg").value = message.payloadString;
    change_pos(message.payloadString.split(" ")[0], message.payloadString.split(" ")[1]);
}

function startDisconnect() { // Called when the disconnect-button is pressed
    client.disconnect();
    document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/>';
}
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
let maze = [];
let current_pos = [2, 2]; // Starting position
let start_tile = "0"; // Starting tile

let size_x = 6; // Maze is 6x3 squares
let size_y = 3;
let dist_x = 0;
let dist_y = 0;
let tile_w = canvas.width/size_x; // Tilesize adapts to fit the given canvas
let tile_h = canvas.height/size_y;

context.fillStyle = "DimGrey";
context.fillRect(0, 0, canvas.width, canvas.height);
draw_tiles(current_pos[0], current_pos[1], tile_w, tile_h, tiletypes[0]);
context.closePath();

for (let r = 0; r < size_y; r++) { 
    let maze_row = [];
    for (let c = 0; c < size_x; c++) {
        maze_row.push("?"); // "?" indicates unexplored tiles
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
maze[current_pos[1]][current_pos[0]] = start_tile;
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
            let value = map[position[1]][position[0]]
            let new_pos = "(" + String(position[0]) + ", " + String(position[1]) + ")"
            if (value != "x") { // "x" indicates that the tile can not be used
                if (direction == "north") {
                    if (value == "?") {
                        return [new_pos, "unexplored", 1, direction]
                    }
                    else if (tiletypes[value][2][1] == 0) {
                        return [new_pos, value, 1, direction]
                    }
                }
                else if (direction == "east") {
                    if (value == "?") {
                        return [new_pos, "unexplored", 1, direction]
                    }
                    else if (tiletypes[value][1][0] == 0) {
                        return [new_pos, value, 1, direction]
                    }
                }
                else if (direction == "south") {
                    if (value == "?") {
                        return [new_pos, "unexplored", 1, direction]
                    }
                    else if (tiletypes[value][0][1] == 0) {
                        return [new_pos, value, 1, direction]
                    }
                }
                else if (direction == "west") {
                    if (value == "?") {
                        return [new_pos, "unexplored", 1, direction]
                    }
                    else if (tiletypes[value][1][2] == 0) {
                        return [new_pos, value, 1, direction]
                    }
                }
            } 
        }
    }
}

function CreateBoard(map) { // Converts a regular 2d matrix into a dict where each tile has a list of available actions
    let mazeDict = {};
    for (let r = 0; r < map.length; r++) { // For each row
        for (let c = 0; c < map[0].length; c++) { // For each column
            let position = "(" + String(c) + ", " + String(r) + ")";
            let actions = [];
            let neighbours = [[[c, r + 1], "south"], [[c + 1, r], "east"], [[c, r - 1], "north"], [[c - 1, r], "west"]]
            let activetile = tiletypes[map[r][c]];
            if (map[r][c] != "x" && typeof(activetile) != "undefined" && map[r][c] != "g") {
                //console.log("got through if statement @ " + [c, r])
                if (activetile[0][1] == 0) { // If the tile has a path leading up
                    let action = findActions(neighbours[2][0], map, map[0].length - 1, map.length - 1, neighbours[2][1])
                    if (typeof(action) != "undefined") {
                        actions.push(action);
                    }
                }
                if (activetile[1][0] == 0) { // If the tile has a path leading left
                    let action = findActions(neighbours[3][0], map, map[0].length - 1, map.length - 1, neighbours[3][1])
                    if (typeof(action) != "undefined") {
                        actions.push(action);
                    }
                }
                if (activetile[1][2] == 0) { // If the tile has a path leading right
                    let action = findActions(neighbours[1][0], map, map[0].length - 1, map.length - 1, neighbours[1][1])
                    if (typeof(action) != "undefined") {
                        actions.push(action);
                    }
                }
                if (activetile[2][1] == 0) { // If the tile has a path leading down
                    let action = findActions(neighbours[0][0], map, map[0].length - 1, map.length - 1, neighbours[0][1])
                    if (typeof(action) != "undefined") {
                        actions.push(action);
                    }
                }
            }
            mazeDict[position] = {state: map[r][c], cost: 1, actions: actions};          
        }
    }
    return mazeDict
}

function UniformCostSearch(startPos, map, goalPos) { // Finds the cheapest possible path
    let foundgoal = false;
    let frontier = new PriorityQueue();
    exploredNodes = {};
    let startNode = [startPos, [], ["start"], 0]; // Startpos, actions, directions, cost
    frontier.enqueue(startNode, 0);
    while (frontier["items"].length != 0) {
        let values = frontier.dequeue() // Removes and returns the item with lowest priority
        let currentState = values.element[0];
        let actions = values.element[1];
        let directions = values.element[2] + ", ";
        let currentCost = values.element[3];
        if (currentState in exploredNodes != true || currentCost < exploredNodes[currentState]) { // If the node has not already been explored or a new cheaper path has been found
            exploredNodes[currentState] = currentCost;
            if (currentState == goalPos) { 
                foundgoal = true;
                console.log(startPos, "to", goalPos ,actions, currentCost);
                console.log("Directions: " + directions);
                return [actions, directions, currentCost]
            }
            else {
                let successors = map[currentState];
                for (succ of successors["actions"]) {
                    let newAction = actions + succ[0];
                    let newCost = currentCost + succ[2];
                    let newDirection = directions + succ[3];
                    let newNode = [succ[0], newAction, newDirection, newCost];
                    frontier.enqueue(newNode, newCost); // Adds all possible movements to frontier
                }
            }
        }
    }
    if (foundgoal == false) {
        console.log("No paths possible.") 
        return "no paths"         
    }
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
    let onborder = false;
    let activetile = tiletypes[tiletype];
    if (direction == "down") {
        if (current_pos[1] < size_y - 1) {
            console.log("down");
            current_pos[1] = current_pos[1] + 1;
        } 
        else {
            onborder = true;
            console.log("can't go down");
        }
    }
    else if (direction == "up") {
        if (current_pos[1] > 0) {
            console.log("up");
            current_pos[1] = current_pos[1] - 1;
        } 
        else {
            onborder = true;
            console.log("can't go up");
        }
    }
    else if (direction == "left") {
        if (current_pos[0] > 0) {
            console.log("left");
            current_pos[0] = current_pos[0] - 1;
        }
        else {
            onborder = true;
            console.log("can't go left");
        }
    }
    else if (direction == "right") {
        if (current_pos[0] < size_x - 1) {
            console.log("right");
            current_pos[0] = current_pos[0] + 1; 
        }
        else {
            onborder = true;
            console.log("can't go right");
        }
    }
    console.log(maze);
    // console.log(current_pos);
    maze[current_pos[1]][current_pos[0]] = tiletype;
    if (onborder != true) {
        draw_tiles(current_pos[0], current_pos[1], tile_w, tile_h, activetile);
    }
}

function FindPath() {
    let detailed_maze = CreateBoard(maze);
    console.log(detailed_maze);
    let current_position = "(" + String(current_pos[0]) + ", " + String(current_pos[1]) + ")";
    let goal_position = document.getElementById("goalpos").value;
    UniformCostSearch(current_position, detailed_maze, goal_position);
}

function MovePlanner() { // Makes a plan for how to explore the maze
    let current_path = [];
    let cheapest_path = [];
    let goal_pos = "";
    let current_position = "(" + String(current_pos[0]) + ", " + String(current_pos[1]) + ")";
    let detailed_maze = CreateBoard(maze);
    console.log(detailed_maze);
    for (tiles in detailed_maze) {
        if (detailed_maze[tiles]["actions"].length != 0) {
            for (action of detailed_maze[tiles]["actions"]) {
                if (action[1] == "unexplored") {
                    // console.log(action[0] + " can be explored!");
                    current_path = UniformCostSearch(current_position, detailed_maze, action[0])
                    if (current_path != "no paths") {
                        if (cheapest_path.length == 0 || current_path[2] < cheapest_path[2]) {
                            cheapest_path = current_path;
                            goal_pos = action[0];
                        }
                    }
                }
            }
        }
    }
    console.log("Next move: " + goal_pos + " Directions: " + cheapest_path[1])
    //console.log(cheapest_path);
}

function startConnect() { // When the connect-button is pressed
    client = new Paho.MQTT.Client("maqiatto.com", 8883, "dinmammapåpizza");
    // Set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    client.connect({userName : "kevin.klarin@abbindustrigymnasium.se",password : "1337",
        onSuccess: onConnect,
        onFailure: onFail,
                   });
}
function onFail() {
    document.getElementById("messages").innerHTML += '<span>ERROR: Connection failed.</span><br/>'
}  

let topic="kevin.klarin@abbindustrigymnasium.se/";

function onConnect() { // Called when the client connects
    // Fetch the MQTT topic from the form
    subtopic = topic + document.getElementById("subtopic").value; 
    pubtopic = topic + document.getElementById("pubtopic").value;
    // console.log(newtopic);
    // Print output for the user in the messages div
    document.getElementById("messages").innerHTML += '<span>Subscribing to: ' + subtopic + '</span><br/>';

    message = new Paho.MQTT.Message("Connected from webpage"); //Sends message to broker
    message.destinationName = pubtopic;
    client.send(message);

    // Subscribe to the requested topic
    client.subscribe(subtopic);
}
function onSend() {
    // Fetch the MQTT topic from the form
    // Print output for the user in the messages div'
    let message= document.getElementById("newMessage").value;
      message = new Paho.MQTT.Message(message);
      message.destinationName = pubtopic;
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
    change_pos(message.payloadString.split(" ")[0], message.payloadString.split(" ")[1]);
}

function startDisconnect() { // Called when the disconnect-button is pressed
    client.disconnect();
    document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/>';
}
const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");

document.onkeydown = checkKey; // Watching for keypresses, if one is pressed, run checkKey()
function checkKey(e) { // e is the event, containing all the data of the keypress
    if (e.key == "ArrowDown") {
        console.log("down");
    }
    else if (e.key == "ArrowUp") {
        /*if (maze.length < 6) {
            steps = steps + 1;
            current_pos[1] = current_pos[1] + 1;
            maze.splice(current_pos[1] + 1, 0, steps);
        } */
        console.log("up");
    }
    else if (e.key == "ArrowLeft") {
        /*if (maze[0].length < 6) {
            steps = steps + 1;
            current_pos[1] = current_pos[1] + 1;
            maze[current_pos[1]].splice(current_pos[0], 0, steps);
        } */
        console.log("left");
    }
    else if (e.key == "ArrowRight") {
        if (maze[0].length < 6) {
            steps = steps + 1;
            maze[current_pos[1]].splice(current_pos[0] + 1, 0, steps);
            current_pos[0] = current_pos[0] + 1;
        }
        console.log("right");
    }
    console.log(maze);
}

context.fillStyle = "purple";
context.fillRect(0, 0, 420, 420);
context.fill();

let maze = [["x", 0, 0]];
let current_pos = [0, 0];
let steps = 0;

let size = 6 // Maze is 6x6 squares
let dist_x = 0;
let dist_y = 0;
let tile_w = canvas.width/size; // Tilesize adapts to fit the given canvas
let tile_h = canvas.height/size;

for (r = 0; r < size; r++) { 
    for (c = 0; c < size; c++) {
        context.beginPath();
        context.strokeStyle = "black";
        context.lineWidth = "3";
        context.rect(dist_x, dist_y, tile_w, tile_h); 
        context.stroke();
        dist_x = dist_x + tile_w;
    }
    dist_x = 0;
    dist_y = dist_y + tile_h; 
}
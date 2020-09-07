const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
import {test_msg, transformer, draw_tiles} from "./transformer.js"; // To use modules, website needs to be hosted on a webserver. I use localhost through the "live server" VSCode extension.
test_msg();
console.log(transformer([
    [0, 0, 0],
    [0, 0, 0]
]));

document.onkeydown = checkKey; // Watching for keypresses, if one is pressed, run checkKey()
function checkKey(e) { // e is the event, containing all the data of the keypress
    if (e.key == "ArrowDown") {
        if (current_pos[1] < size_y - 1) {
            console.log("down");
            steps = steps + 1;
            current_pos[1] = current_pos[1] + 1;
            relative_pos[1] = relative_pos[1] + 1;

            if (typeof maze[relative_pos[1]] == "undefined") {
                current_height = current_height + 1;
                let new_row = [];
                for (let i = 0; i < current_width; i++) {
                    new_row.push(0);
                }
                new_row[relative_pos[0]] = steps;
                maze.push(new_row);   
            } 
            else {
                maze[relative_pos[1]][relative_pos[0]] = steps;
            } 
        } 
        else {
            console.log("can't go down");
        }
    }
    else if (e.key == "ArrowUp") {
        if (current_pos[1] > 0) {
            console.log("up");
            steps = steps + 1;
            current_pos[1] = current_pos[1] - 1;

            if (typeof maze[relative_pos[1] - 1] == "undefined") {
                current_height = current_height + 1;
                let new_row = [];
                for (let i = 0; i < current_width; i++) {
                    new_row.push(0);
                }
                new_row[relative_pos[0]] = steps;
                maze.unshift(new_row);   
            } 
            else {
                relative_pos[1] = relative_pos[1] - 1;
                maze[relative_pos[1]][relative_pos[0]] = steps;
            } 
        } 
        else {
            console.log("can't go up");
        }
    }
    else if (e.key == "ArrowLeft") {
        if (current_pos[0] > 0) {
            console.log("left");
            current_pos[0] = current_pos[0] - 1;
            steps = steps + 1;
            if (typeof maze[relative_pos[1]][relative_pos[0] - 1] == "undefined") {
                current_width = current_width + 1;
                for (let i = 0; i < current_height; i++) {
                    maze[i].unshift(0);
                }
                maze[relative_pos[1]][0] = steps;
            }
            else {
                relative_pos[0] = relative_pos[0] - 1;
                maze[relative_pos[1]][relative_pos[0]] = steps;
            }
        }
        else {
            console.log("can't go left");
        }
    }
    else if (e.key == "ArrowRight") {
        if (current_pos[0] < size_x - 1) {
            console.log("right");
            steps = steps + 1;
            current_pos[0] = current_pos[0] + 1; 
            relative_pos[0] = relative_pos[0] + 1;
            if (typeof maze[relative_pos[1]][relative_pos[0]] == "undefined") {
                current_width = current_width + 1;
                for (let i = 0; i < current_height; i++) {
                    maze[i].push(0);
                }
            } 
            maze[relative_pos[1]][relative_pos[0]] = steps;
        }
        else {
            console.log("can't go right");
        }
    }
    console.log(maze);
    // console.log(current_pos);
    draw_tiles(maze, relative_pos[0], relative_pos[1], tile_w, tile_h);
}

context.fillStyle = "purple";
context.fillRect(0, 0, 420, 420);
context.fill();
context.closePath();

let maze = [
    [0]
];
let relative_pos = [0, 0];
let current_pos = [0, 0];
let steps = 0;
let current_width = 1;
let current_height = 1;

let size_x = 6; // Maze is 6x6 squares
let size_y = 6;
let dist_x = 0;
let dist_y = 0;
let tile_w = canvas.width/size_x; // Tilesize adapts to fit the given canvas
let tile_h = canvas.height/size_y;

for (let r = 0; r < size_x; r++) { 
    for (let c = 0; c < size_y; c++) {
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
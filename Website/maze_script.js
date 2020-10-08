const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
import {test_msg, transformer, draw_tiles} from "./transformer.js"; // To use modules, website needs to be hosted on a webserver. I use localhost through the "live server" VSCode extension.

test_msg();
console.log(transformer([
    [0, 0, 0],
    [0, 0, 0]
]));


function change_pos_dynamic(direction, tiletype) { // Changes the current position in the maze (old version)
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
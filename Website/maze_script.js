const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");

context.fillStyle = "purple";
context.fillRect(0, 0, 420, 420);
context.fill();

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
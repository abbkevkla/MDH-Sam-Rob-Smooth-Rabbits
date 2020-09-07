const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");

function test_msg() {
    console.log("Module is connected");
}

let tile = [
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1]
]
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

function draw_tiles(map, x, y, tile_width, tile_height) {
    let new_width = tile_width/3;
    let new_height = tile_height/3;
    let dist_x = x * tile_width;
    let dist_y = y * tile_height;
    for (let r = 0; r < 3; r++) { 
        for (let c = 0; c < 3; c++) {
            context.beginPath();
            if (r == 1) {
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

export {test_msg, transformer, draw_tiles}; // Things to export from this module 
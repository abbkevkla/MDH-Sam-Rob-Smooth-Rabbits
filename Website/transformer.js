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

export {test_msg, transformer}; // Things to export from this module 
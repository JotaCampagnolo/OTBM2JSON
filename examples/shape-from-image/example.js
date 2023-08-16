/*
 * Example script of using the otbm2json library
 * shapping a map from a image
 */

const Jimp = require("jimp");
const otbm2json = require("../../otbm2json");
const { exit } = require("process");

// Read the map data using the otbm2json library
const mapData = otbm2json.read("grass.otbm");

// Asign a tileId from a specific color:
function tileByColor(hexColor) {
  if(hexColor == '3300ccff') {
    return 105; // Water
  }
  else if(hexColor == 'cc00ff') {
    return 1111; // Grass
  }
  else if(hexColor == 'ffcc99ff') {
    return 1111; // Sand
  }
  else if(hexColor == 'ffffffff') {
    return 1111; // Snow
  }
  else {
    return 105; // Water
  }
}

// Maps the shape of the map from a image:
function shapeMapFromImg() {

  return new Promise(async (resolve) => {
    
    let matrix = [];
    
    // Read the shape image and map items to coordinates:
    await Jimp.read('./shape-nostalgia.bmp')
    .then((image) => {
      
      for (let i = 0; i < image.bitmap.width; i++) {
        matrix[i] = [];
        for (let j = 0; j < image.bitmap.height; j++) {
            matrix[i][j] = 105;
        }
      }

      // Do stuff with the image.
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {

        // Asign a item to the coordinate:
        matrix[x][y] = tileByColor(this.getPixelColor(x,y).toString(16));
        console.log(x, y, this.getPixelColor(x,y).toString(16));

      });
    })
    .catch((err) => {
      console.log(err);
      exit();
    });

    resolve(matrix);
    
  });

}

// Apply the tiles mapped from the shape image on the map itself:
function applyTiles(shapeMap) {

  // Go over all nodes
  mapData.data.nodes.forEach(function(x) {

    x.features.forEach(function(x) {
      
      // Skip anything that is not a tile area
      if(x.type !== otbm2json.HEADERS.OTBM_TILE_AREA) return; 
  
      // For each tile area; go over all actual tiles
      x.tiles.forEach(function(x) {
  
        // Skip anything that is not a tile (e.g. house tiles)
        if(x.type !== otbm2json.HEADERS.OTBM_TILE) return; 
  
        // ORIGINAL OTBM MAP MUST BE FILLED WITH WATER
        x.tileid = shapeMap[x.x][x.y];
        // console.log(x);
        
      });
  
    });
  
  });

}

async function execute(){

  console.log("Starting process...");

  const shapeMap = await shapeMapFromImg();

  applyTiles(shapeMap);

  // Write the output to OTBM using the library
  otbm2json.write("forest.otbm", mapData);

  console.log("Process finished...");

}

execute();

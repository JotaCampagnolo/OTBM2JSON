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
  if(hexColor == 'a2e8ff') {
    return 105;
  }
  else if(hexColor == 'b5e61dff') {
    return 1111;
  }
  else {
    return 105;
  }
}

function shapeMapFromImg() {

  return new Promise(async (resolve) => {
    
    let matrix = [];
    
    // Read the shape image and map items to coordinates:
    await Jimp.read('./shape.bmp')
    .then((image) => {
      
      for (let i = 0; i < image.bitmap.width; i++) {
        matrix[i] = [];
        for (let j = 0; j < image.bitmap.height; j++) {
            matrix[i][j] = "Water";
        }
      }

      // Do stuff with the image.
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {

        // Asign a item to the coordinate:
        matrix[x][y] = tileByColor(this.getPixelColor(x,y).toString(16));
        // console.log(x, y, this.getPixelColor(x,y).toString(16));

      });
    })
    .catch((err) => {
      console.log(err);
      exit();
    });

    resolve(matrix);
    
  });

}

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
  
        x.tileid = shapeMap[x.x-239][x.y-246];
        console.log(x);
        
      });
  
    });
  
  });

}

async function execute(){

  console.log("Iniciou...");

  const shapeMap = await shapeMapFromImg();

  applyTiles(shapeMap);

  // Write the output to OTBM using the library
  otbm2json.write("forest.otbm", mapData);

  console.log("Terminou...");

}

execute();

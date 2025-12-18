// Código generado automáticamente. No editar.
namespace myTiles {
    //% fixedInstance jres blockIdentity=images._tile
    export const transparency16 = image.ofBuffer(hex``);

    helpers._registerFactory("tilemap", function(name: string) {
        switch(helpers.stringTrim(name)) {
            case "map":
            case "map1":return tiles.createTilemap(hex`100010000a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a02020101010201020101010201020a0a02020202020202020202020202020a0a02010901020102020201020202020a0a02090102020201020202020202020a0a02010901010202010102020202010a0a02010901020201020202010109020a0a02090103080808080808070101020a0a02090205040404040404060101020a0a01090101090909090101090109010a0a02010109010909010109010909010a0a09090909010109090101010109020a0a01090901090909090901090909020a0a09010109090101010109010109010a0a01090909090901010909090902020a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a`, img`
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
`, [myTiles.transparency16,sprites.castle.tileGrass2,sprites.castle.tileGrass1,sprites.castle.tilePath1,sprites.castle.tilePath8,sprites.castle.tilePath7,sprites.castle.tilePath9,sprites.castle.tilePath3,sprites.castle.tilePath2,sprites.castle.tileGrass3,sprites.builtin.forestTiles1], TileScale.Sixteen);
        }
        return null;
    })

    helpers._registerFactory("tile", function(name: string) {
        switch(helpers.stringTrim(name)) {
            case "transparency16":return transparency16;
        }
        return null;
    })

}
// Código generado automáticamente. No editar.

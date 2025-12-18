// 1. Definición de tipos de Sprites
let KIND_SCENERY = SpriteKind.create()
let KIND_TREE = SpriteKind.create()
let KIND_NPC = SpriteKind.create()

// 2. Variables globales
let nena: Sprite = null
let mesa: Sprite = null
let mercader: Sprite = null

// 3. Función para crear árboles (SIN TOCAR LOS LÍMITES ROJOS)
function crear_arbol() {
    if (sprites.allOfKind(KIND_TREE).length < 10) {
        let arbol = sprites.create(assets.image`miImagen`, KIND_TREE)
        let posicionValida = false
        let attempts = 0

        while (!posicionValida && attempts < 50) {
            attempts++
            // Solo entre columnas 1 y 14 (evita los muros de los lados)
            let col = randint(1, 14)
            // Solo entre filas 1 y 14 (evita los muros de arriba y abajo)
            let row = randint(1, 14)

            // Si no es un muro y no es el centro de tierra
            if (!(tiles.tileAtLocationIsWall(tiles.getTileLocation(col, row)))) {
                if (Math.abs(col - 8) > 2 || Math.abs(row - 8) > 2) {
                    let x = col * 16 + 8
                    let y = row * 16 + 8

                    let demasiadoCerca = false
                    for (let otro of sprites.allOfKind(KIND_TREE)) {
                        if (Math.sqrt(Math.pow(x - otro.x, 2) + Math.pow(y - otro.y, 2)) < 35) {
                            demasiadoCerca = true
                        }
                    }

                    if (!demasiadoCerca) {
                        tiles.placeOnTile(arbol, tiles.getTileLocation(col, row))
                        posicionValida = true
                    }
                }
            }
        }
        if (!posicionValida) arbol.destroy()
    }
}

// 4. Lógica del Mercado
function iniciar_tienda() {
    let opciones = ["Gallina", "Patata", "Cabra", "Ous", "Cavall"]
    let tasas = [6, 1.33, 5, 3, 12]
    let tria = game.askForNumber("1:Gal 2:Pat 3:Cab 4:Ous 5:Cav", 1)

    if (tria >= 1 && tria <= 5) {
        let producto = opciones[tria - 1]
        let cantidad = game.askForNumber("Quantes unitats?", 1)
        let coste = Math.round(tasas[tria - 1] * cantidad * 100) / 100

        if (info.score() >= coste) {
            info.changeScoreBy(-coste)
            game.showLongText("Comprat: " + cantidad + " " + producto, DialogLayout.Center)
        } else {
            game.showLongText("Faltan " + coste + " kg de llenya", DialogLayout.Bottom)
        }
    }
}

// 5. Configuración de Escena y Sprites
tiles.setCurrentTilemap(tilemap`map`)

mesa = sprites.create(assets.image`miImagen1`, KIND_SCENERY)
tiles.placeOnTile(mesa, tiles.getTileLocation(8, 8))
mesa.y += 8

mercader = sprites.create(assets.image`miImagen2`, KIND_NPC)
tiles.placeOnTile(mercader, tiles.getTileLocation(8, 7))

nena = sprites.create(assets.image`nena-front`, SpriteKind.Player)
tiles.placeOnTile(nena, tiles.getTileLocation(8, 10))
scene.cameraFollowSprite(nena)
controller.moveSprite(nena)
info.setScore(0)

for (let i = 0; i < 7; i++) {
    crear_arbol()
}

// 6. Detección de Proximidad para el mensaje "PULSA A"
game.onUpdate(function () {
    // Calculamos distancia entre nena y mercader
    let dist = Math.sqrt(Math.pow(nena.x - mercader.x, 2) + Math.pow(nena.y - mercader.y, 2))

    if (dist < 40) {
        mercader.sayText("Pulsa A per comprar", 100)
    }
})

// 7. Controles
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (nena.overlapsWith(mesa) || nena.overlapsWith(mercader)) {
        iniciar_tienda()
    }
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    for (let arbol of sprites.allOfKind(KIND_TREE)) {
        if (nena.overlapsWith(arbol)) {
            arbol.destroy(effects.disintegrate, 200)
            info.changeScoreBy(5)
            nena.sayText("+5 Llenya", 500)
        }
    }
})

game.onUpdateInterval(5000, function () {
    crear_arbol()
})

// Animaciones
controller.up.onEvent(ControllerButtonEvent.Pressed, () => animation.runImageAnimation(nena, assets.animation`nena-animation-up`, 500, false))
controller.down.onEvent(ControllerButtonEvent.Pressed, () => animation.runImageAnimation(nena, assets.animation`nena-animation-down`, 500, false))
controller.left.onEvent(ControllerButtonEvent.Pressed, () => animation.runImageAnimation(nena, assets.animation`nena-animation-left`, 500, false))
controller.right.onEvent(ControllerButtonEvent.Pressed, () => animation.runImageAnimation(nena, assets.animation`nena-animation-right`, 500, false))
// --- 1. CONFIGURACIÓ I TIPIFICACIÓ ---
let KIND_SCENERY = SpriteKind.create()
let KIND_TREE = SpriteKind.create()
let KIND_NPC = SpriteKind.create()

// --- 2. DADES DEL MERCAT---
let llista_taxes = [6, 1.3333, 5, 0.25, 12]
let llista_noms = ["Gallina", "kg de Patates", "Cabra", "Ous frescos", "Cavall"]
let llista_animals = [true, false, true, false, true]

/**
 * Funció principal per gestionar l'intercanvi de productes.
 */
function processar_compra(index: number, q: number) {
    let nom_producte = llista_noms[index]
    let taxa_producte = llista_taxes[index]
    let es_animal = llista_animals[index]

    // Gestió d'errors
    if (q <= 0) {
        game.showLongText("Ei! Només acceptem canvis positius. No volem trastos!", DialogLayout.Bottom)
        return
    }

    if (es_animal && q % 1 != 0) {
        game.showLongText("Alerta! Els animals s'han de canviar sencers. Res de potes!", DialogLayout.Bottom)
        return
    }

    let cost_llenya = Math.round(taxa_producte * q * 100) / 100

    // Verificació de la puntuació (kg de llenya)
    if (info.score() >= cost_llenya) {
        info.changeScoreBy(-cost_llenya)
        music.baDing.play()
        game.showLongText("FET: Per " + q + " " + nom_producte + " has donat " + cost_llenya + "kg de llenya.", DialogLayout.Center)
    } else {
        let falta = Math.round((cost_llenya - info.score()) * 100) / 100
        game.showLongText("Falta llenya! Necessites " + cost_llenya + "kg (et falten " + falta + "kg).", DialogLayout.Bottom)
    }
}

// --- 3. VARIABLES DEL JOC ---
let nena: Sprite = null
let mercader: Sprite = null
let prop_arbre = false
let tria_usuari = 0
let quantitat_usuari = 0
let sortir_menu = false

// --- 4. FUNCIONS MODULARS ---

function inicialitzar_entorn() {
    tiles.setCurrentTilemap(tilemap`map`)

    // Creem el mercader al punt del trueque
    mercader = sprites.create(assets.image`miImagen2`, KIND_NPC)
    tiles.placeOnTile(mercader, tiles.getTileLocation(8, 7))

    // La nostra protagonista
    nena = sprites.create(assets.image`nena-front`, SpriteKind.Player)
    tiles.placeOnTile(nena, tiles.getTileLocation(8, 10))
    scene.cameraFollowSprite(nena)
    controller.moveSprite(nena)

    info.setScore(0)

    // Generem els primers arbres
    for (let i = 0; i < 8; i++) {
        crear_un_arbre()
    }
}

function crear_un_arbre() {
    if (sprites.allOfKind(KIND_TREE).length < 15) {
        let nou_arbre = sprites.create(assets.image`miImagen`, KIND_TREE)
        let c = randint(1, 14)
        let r = randint(1, 14)

        // Evitem que surtin sobre parets o al mig del camí
        if (!tiles.tileAtLocationIsWall(tiles.getTileLocation(c, r)) && Math.abs(c - 8) > 2) {
            tiles.placeOnTile(nou_arbre, tiles.getTileLocation(c, r))
        } else {
            nou_arbre.destroy()
        }
    }
}

function menu_intercanvi() {
    sortir_menu = false
    while (!sortir_menu) {
        tria_usuari = game.askForNumber("1:Gal 2:Pat 3:Cab 4:Ou 5:Cav 0:Sortir", 1)

        if (tria_usuari == 0) {
            sortir_menu = true
            game.showLongText("Torna quan vulguis fer més trueque!", DialogLayout.Bottom)
        } else if (tria_usuari >= 1 && tria_usuari <= 5) {
            quantitat_usuari = game.askForNumber("Quanta quantitat en vols?", 3)
            processar_compra(tria_usuari - 1, quantitat_usuari)
        }
    }
}

// --- 5. ESDEVENIMENTS I CICLE DE JOC ---

inicialitzar_entorn()

// Regeneració cada 3 segons
game.onUpdateInterval(3000, function () {
    crear_un_arbre()
    crear_un_arbre()
})

// Accions de botons
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (nena.overlapsWith(mercader)) {
        menu_intercanvi()
    }
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    for (let obj of sprites.allOfKind(KIND_TREE)) {
        if (nena.overlapsWith(obj)) {
            nena.sayText("Xac!", 200)
            pause(200)
            obj.destroy(effects.disintegrate, 200)
            info.changeScoreBy(5)
            music.smallCrash.play()
            break
        }
    }
})

// Proximitat i missatges flotants
game.onUpdate(function () {
    // Mercader
    if (Math.abs(nena.x - mercader.x) < 30 && Math.abs(nena.y - mercader.y) < 30) {
        mercader.sayText("A: Comprar", 100)
    }

    // Arbres
    prop_arbre = false
    for (let arb of sprites.allOfKind(KIND_TREE)) {
        if (Math.abs(nena.x - arb.x) < 25 && Math.abs(nena.y - arb.y) < 25) {
            prop_arbre = true
            break
        }
    }
    if (prop_arbre) {
        nena.sayText("B: Talar", 100)
    }
})

// Animacions compatibles
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    animation.runImageAnimation(nena, assets.animation`nena-animation-up`, 500, false)
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    animation.runImageAnimation(nena, assets.animation`nena-animation-down`, 500, false)
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    animation.runImageAnimation(nena, assets.animation`nena-animation-left`, 500, false)
})
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    animation.runImageAnimation(nena, assets.animation`nena-animation-right`, 500, false)
})
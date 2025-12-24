/**
 * PROJECTE: EL CONVERSOR RURAL - ALCUBILLA DE AVELLANEDA
 * REQUERIMENTS: POO, snake_case, Gestió d'errors, Modularitat.
 */

// --- 1. CONFIGURACIÓ DE TIPUS (KIND) ---
let KIND_SCENERY = SpriteKind.create()
let KIND_TREE = SpriteKind.create()
let KIND_NPC = SpriteKind.create()

// --- 2. CLASSE PRINCIPAL: MERCAT RURAL (POO) ---
class MercatRural {
    // Tasas de conversión: madera por 1 unidad/kg de producto
    // Patata: 2kg llenya = 1.5kg patata -> 1kg patata = 2/1.5 = 1.333
    private taxa_gallina: number = 6
    private taxa_patata: number = 1.3333
    private taxa_cabra: number = 5
    private taxa_ous: number = 0.25 // 3kg llenya = 12 ous -> 1 ou = 3/12 = 0.25
    private taxa_cavall: number = 12

    constructor() { }

    /**
     * Calcula el cost total en llenya i gestiona errors d'entrada.
     */
    public gestionar_intercanvi(opcio: number, quantitat: number): void {
        let nom_producte = ""
        let cost_unitari = 0
        let es_animal = false

        // Selecció de producte segons menú
        if (opcio == 1) { nom_producte = "Gallina"; cost_unitari = this.taxa_gallina; es_animal = true; }
        else if (opcio == 2) { nom_producte = "Patata (kg)"; cost_unitari = this.taxa_patata; es_animal = false; }
        else if (opcio == 3) { nom_producte = "Cabra"; cost_unitari = this.taxa_cabra; es_animal = true; }
        else if (opcio == 4) { nom_producte = "Ous"; cost_unitari = this.taxa_ous; es_animal = false; }
        else if (opcio == 5) { nom_producte = "Cavall"; cost_unitari = this.taxa_cavall; es_animal = true; }

        // --- CONTROL D'ERRORS (Input Validation) ---
        if (quantitat <= 0) {
            game.showLongText("ERROR: La quantitat ha de ser positiva. No acceptem RTX 5090!", DialogLayout.Bottom)
            return
        }

        if (es_animal && quantitat % 1 !== 0) {
            game.showLongText("ERROR: Els animals s'han d'intercanviar sencers i vius!", DialogLayout.Bottom)
            return
        }

        let cost_total = Math.round(cost_unitari * quantitat * 100) / 100

        // Verificació de saldo (llenya disponible)
        if (info.score() >= cost_total) {
            info.changeScoreBy(-cost_total)
            game.showLongText("ÈXIT: Has intercanviat " + cost_total + "kg de llenya per " + quantitat + " " + nom_producte, DialogLayout.Center)
        } else {
            let falta = Math.round((cost_total - info.score()) * 100) / 100
            game.showLongText("FALTEN RECURSOS: Necessites " + falta + "kg més de llenya.", DialogLayout.Bottom)
        }
    }
}

// --- 3. VARIABLES I ESTATS DEL JOC ---
let nena: Sprite = null
let mesa: Sprite = null
let mercader: Sprite = null
let mercat = new MercatRural()

// --- 4. FUNCIONS MODULARS (Snake_case) ---

function configurar_escena() {
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
}

function crear_arbol_aleatori() {
    if (sprites.allOfKind(KIND_TREE).length < 12) {
        let arbol = sprites.create(assets.image`miImagen`, KIND_TREE)
        let col = randint(1, 14)
        let row = randint(1, 14)

        if (!tiles.tileAtLocationIsWall(tiles.getTileLocation(col, row))) {
            // Evitem zona central (camí)
            if (Math.abs(col - 8) > 2 || Math.abs(row - 8) > 2) {
                tiles.placeOnTile(arbol, tiles.getTileLocation(col, row))
            } else {
                arbol.destroy()
            }
        } else {
            arbol.destroy()
        }
    }
}

function mostrar_menu_intercanvi() {
    // GUI de selecció segons requeriment
    let producte_id = game.askForNumber("1:Gal 2:Pat 3:Cab 4:Ou 5:Cav", 1)
    if (producte_id >= 1 && producte_id <= 5) {
        let q = game.askForNumber("Quantes unitats/kg vols?", 3)
        mercat.gestionar_intercanvi(producte_id, q)
    }
}

// --- 5. ESDEVENIMENTS (CONTROLS) ---

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (nena.overlapsWith(mesa) || nena.overlapsWith(mercader)) {
        mostrar_menu_intercanvi()
    }
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    for (let arbol of sprites.allOfKind(KIND_TREE)) {
        if (nena.overlapsWith(arbol)) {
            arbol.destroy(effects.disintegrate, 200)
            info.changeScoreBy(5) // Cada arbre dona 5kg de llenya
            nena.sayText("+5kg Llenya", 500)
        }
    }
})

// --- 6. BUCLE PRINCIPAL I ACTUALITZACIONS ---

configurar_escena()

// Spawner inicial
for (let i = 0; i < 8; i++) {
    crear_arbol_aleatori()
}

// Missatge de proximitat
game.onUpdate(function () {
    let dist = Math.sqrt(Math.pow(nena.x - mercader.x, 2) + Math.pow(nena.y - mercader.y, 2))
    if (dist < 40) {
        mercader.sayText("A: Intercanviar productes", 100)
    }
})

// Regeneració de bosc cada 5 segons
game.onUpdateInterval(5000, function () {
    crear_arbol_aleatori()
})

// Animacions (Modularitzat)
controller.up.onEvent(ControllerButtonEvent.Pressed, () => animation.runImageAnimation(nena, assets.animation`nena-animation-up`, 500, false))
controller.down.onEvent(ControllerButtonEvent.Pressed, () => animation.runImageAnimation(nena, assets.animation`nena-animation-down`, 500, false))
controller.left.onEvent(ControllerButtonEvent.Pressed, () => animation.runImageAnimation(nena, assets.animation`nena-animation-left`, 500, false))
controller.right.onEvent(ControllerButtonEvent.Pressed, () => animation.runImageAnimation(nena, assets.animation`nena-animation-right`, 500, false))
/**
 * PROJECTE: EL CONVERSOR RURAL - ALCUBILLA DE AVELLANEDA
 * DESCRIPCIÓ: Sistema d'intercanvi de llenya per productes rurals.
 * REQUERIMENTS COMPLERTS: POO, Modularitat, snake_case, Gestió d'errors, Menú de sortida.
 */

// --- 1. CONFIGURACIÓ DE TIPUS I CONSTANTS ---
let KIND_SCENERY = SpriteKind.create()
let KIND_TREE = SpriteKind.create()
let KIND_NPC = SpriteKind.create()

// --- 2. CLASSE MERCAT RURAL (Programació Orientada a Objectes) ---
class MercatRural {
    // Definició de taxes segons l'enunciat
    private taxa_gallina: number = 6      // 6kg = 1 gallina
    private taxa_patata: number = 1.3333  // 2kg = 1.5kg patata -> 1kg = 1.33kg llenya
    private taxa_cabra: number = 5        // 5kg = 1 cabra
    private taxa_ous: number = 0.25       // 3kg = 12 ous -> 1 ou = 0.25kg llenya
    private taxa_cavall: number = 12      // 12kg = 1 cavall

    constructor() { }

    /**
     * Gestiona la lògica de l'intercanvi i el control d'errors de l'usuari.
     */
    public processar_compra(opcio: number, quantitat: number): void {
        let producte = ""
        let cost_per_unitat = 0
        let es_animal = false

        // Assignació de dades segons l'opció del menú
        switch (opcio) {
            case 1: producte = "Gallina"; cost_per_unitat = this.taxa_gallina; es_animal = true; break;
            case 2: producte = "kg de Patates"; cost_per_unitat = this.taxa_patata; es_animal = false; break;
            case 3: producte = "Cabra"; cost_per_unitat = this.taxa_cabra; es_animal = true; break;
            case 4: producte = "Ous frescos"; cost_per_unitat = this.taxa_ous; es_animal = false; break;
            case 5: producte = "Cavall"; cost_per_unitat = this.taxa_cavall; es_animal = true; break;
        }

        // --- CONTROL D'ERRORS (Segons Enunciat) ---
        // 1. Quantitats negatives o zero
        if (quantitat <= 0) {
            game.showLongText("ERROR: Només acceptem quantitats positives. No volem trastos ni targetes RTX 5090!", DialogLayout.Bottom)
            return
        }

        // 2. Animals sencers (no es permeten decimals en animals)
        if (es_animal && quantitat % 1 !== 0) {
            game.showLongText("ERROR: Els animals s'han d'intercanviar sencers i vius. No tallem potes ni caps!", DialogLayout.Bottom)
            return
        }

        // Càlcul del cost final
        let cost_total = Math.round(cost_per_unitat * quantitat * 100) / 100

        // 3. Verificació de saldo de llenya
        if (info.score() >= cost_total) {
            info.changeScoreBy(-cost_total)
            music.baDing.play()
            game.showLongText("INTERCANVI FET: Necessitaves " + cost_total + "kg de llenya per " + quantitat + " " + producte + ".", DialogLayout.Center)
        } else {
            let falta = Math.round((cost_total - info.score()) * 100) / 100
            game.showLongText("FALTEN RECURSOS: Aquest canvi requereix " + cost_total + "kg. Et falten " + falta + "kg.", DialogLayout.Bottom)
        }
    }
}

// --- 3. VARIABLES GLOBALS ---
let nena: Sprite = null
let mesa: Sprite = null
let mercader: Sprite = null
let mercat_app = new MercatRural()

// --- 4. FUNCIONS DE L'ENTORN (Modularitat) ---

function inicialitzar_joc() {
    tiles.setCurrentTilemap(tilemap`map`)

    // Creació d'entorn
    mesa = sprites.create(assets.image`miImagen1`, KIND_SCENERY)
    tiles.placeOnTile(mesa, tiles.getTileLocation(8, 8))
    mesa.y += 8

    mercader = sprites.create(assets.image`miImagen2`, KIND_NPC)
    tiles.placeOnTile(mercader, tiles.getTileLocation(8, 7))

    // Configuració Jugador
    nena = sprites.create(assets.image`nena-front`, SpriteKind.Player)
    tiles.placeOnTile(nena, tiles.getTileLocation(8, 10))
    scene.cameraFollowSprite(nena)
    controller.moveSprite(nena)

    // Puntuació = kg de llenya
    info.setScore(0)

    // Generació bosc inicial
    for (let i = 0; i < 8; i++) {
        generar_arbre_aleatori()
    }
}

function generar_arbre_aleatori() {
    if (sprites.allOfKind(KIND_TREE).length < 12) {
        let arbre = sprites.create(assets.image`miImagen`, KIND_TREE)
        let col = randint(1, 14)
        let row = randint(1, 14)

        if (!tiles.tileAtLocationIsWall(tiles.getTileLocation(col, row))) {
            // Respectar el camí central
            if (Math.abs(col - 8) > 2 || Math.abs(row - 8) > 2) {
                tiles.placeOnTile(arbre, tiles.getTileLocation(col, row))
            } else {
                arbre.destroy()
            }
        } else {
            arbre.destroy()
        }
    }
}

/**
 * Menú principal interactiu (Es queda en execució fins que se selecciona Sortir)
 */
function obrir_menu_principal() {
    let sortir = false
    while (sortir == false) {
        // GUI de selecció segons requeriment
        let tria = game.askForNumber("1:Gal 2:Pat 3:Cab 4:Ou 5:Cav 0:Sortir", 1)

        if (tria == 0) {
            sortir = true
            game.showLongText("Gràcies per visitar el Mercat d'Alcubilla!", DialogLayout.Bottom)
        } else if (tria >= 1 && tria <= 5) {
            let quantitat = game.askForNumber("Quantes unitats/kg vols?", 3)
            mercat_app.processar_compra(tria, quantitat)
        } else {
            game.showLongText("Opció no vàlida al mercat.", DialogLayout.Bottom)
        }
    }
}

// --- 5. ESDEVENIMENTS DE CONTROL ---

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (nena.overlapsWith(mesa) || nena.overlapsWith(mercader)) {
        obrir_menu_principal()
    }
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    for (let arbre of sprites.allOfKind(KIND_TREE)) {
        if (nena.overlapsWith(arbre)) {
            // Efecte de tala
            nena.sayText("Talant...", 300)
            pause(300)
            arbre.destroy(effects.disintegrate, 200)
            info.changeScoreBy(5)
            music.smallCrash.play()
            break
        }
    }
})

// --- 6. ACTUALITZACIÓ CONSTANT (onUpdate) ---

inicialitzar_joc()

game.onUpdate(function () {
    // Gestió de missatges emergents de proximitat
    let d_mercader = Math.sqrt(Math.pow(nena.x - mercader.x, 2) + Math.pow(nena.y - mercader.y, 2))

    if (d_mercader < 40) {
        mercader.sayText("A: Comprar", 100)
    }

    // Missatge de tala per als arbres propers
    let prop_d_arbre = false
    for (let a of sprites.allOfKind(KIND_TREE)) {
        if (Math.sqrt(Math.pow(nena.x - a.x, 2) + Math.pow(nena.y - a.y, 2)) < 30) {
            prop_d_arbre = true
            break
        }
    }

    if (prop_d_arbre) {
        nena.sayText("Prem B per talar", 100)
    }
})

// Regeneració automàtica del bosc
game.onUpdateInterval(5000, function () {
    generar_arbre_aleatori()
})

// --- 7. ANIMACIONS DE MOVIMENT ---
controller.up.onEvent(ControllerButtonEvent.Pressed, () => animation.runImageAnimation(nena, assets.animation`nena-animation-up`, 500, false))
controller.down.onEvent(ControllerButtonEvent.Pressed, () => animation.runImageAnimation(nena, assets.animation`nena-animation-down`, 500, false))
controller.left.onEvent(ControllerButtonEvent.Pressed, () => animation.runImageAnimation(nena, assets.animation`nena-animation-left`, 500, false))
controller.right.onEvent(ControllerButtonEvent.Pressed, () => animation.runImageAnimation(nena, assets.animation`nena-animation-right`, 500, false))
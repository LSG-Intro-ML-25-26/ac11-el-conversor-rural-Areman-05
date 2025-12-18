//  =============================================================
//  CONVERSOR RURAL - ALCUBILLA DE AVELLANEDA (VERSIÓN FINAL)
//  =============================================================
//  1. Definición de tipos de Sprites
let KIND_SCENERY = SpriteKind.create()
let KIND_DECORATION = SpriteKind.create()
let KIND_TREE = SpriteKind.create()
//  2. Assets en código
let img_egg = img`
    . . . . . 1 1 1 1 . . . . .
    . . . 1 1 d d d d 1 1 . . .
    . . 1 d d d d d d d d 1 . .
    . 1 d d d d d d d d d d 1 .
    . 1 d d d d d d d d d d 1 .
    1 d d d d d d d d d d d d 1
    1 d d d d d d d d d d d d 1
    1 d d d d d d d d d d d d 1
    1 d d d d d d d d d d d d 1
    . 1 d d d d d d d d d d 1 .
    . 1 d d d d d d d d d d 1 .
    . . 1 1 d d d d d d 1 1 . .
    . . . . 1 1 1 1 1 1 . . . .
`
//  3. Lógica del Mercado
class MercatRural {
    constructor() {
        
    }
    
    public obtener_tasa(producte: string): number {
        if (producte == "Gallina") {
            return 6.0
        }
        
        if (producte == "Patata") {
            return 1.33
        }
        
        if (producte == "Cabra") {
            return 5.0
        }
        
        if (producte == "Ous") {
            return 3.0
        }
        
        if (producte == "Cavall") {
            return 12.0
        }
        
        return 0
    }
    
    public calcular_canvi(producte: string, unitats: number): number {
        let tasa = this.obtener_tasa(producte)
        let valor = tasa * unitats
        return Math.round(valor * 100) / 100
    }
    
    public iniciar() {
        let total_necesari: number;
        let opcions = ["Gallina", "Patata", "Cabra", "Ous", "Cavall"]
        let tria_index = game.askForNumber("1:Gal 2:Pat 3:Cab 4:Ous 5:Cav", 1)
        if (tria_index < 1 || tria_index > 5) {
            return
        }
        
        let producte = opcions[tria_index - 1]
        let q = game.askForNumber("Unitats?", 1)
        if (q <= 0) {
            game.showLongText("Error: Quantitat positiva!", DialogLayout.Bottom)
        } else if ((producte == "Gallina" || producte == "Cabra" || producte == "Cavall") && q % 1 != 0) {
            game.showLongText("Error: Animals sencers!", DialogLayout.Bottom)
        } else {
            total_necesari = this.calcular_canvi(producte, q)
            if (info.score() >= total_necesari) {
                info.changeScoreBy(-total_necesari)
                game.showLongText("Has comprat " + ("" + q) + " " + producte + "!", DialogLayout.Center)
            } else {
                game.showLongText("Faltan " + ("" + total_necesari) + " kg", DialogLayout.Bottom)
            }
            
        }
        
    }
    
}

//  4. Configuración de Escena y Sprites
//  Solución Error Línea 83: Quitamos set_tile_map y usamos color de fondo directo
scene.setBackgroundColor(7)
//  Mesa y decoración
let mesa = sprites.create(assets.image`miImagen1`, KIND_SCENERY)
mesa.setPosition(80, 60)
let decor_ou = sprites.create(img_egg, KIND_DECORATION)
decor_ou.setPosition(80, 52)
//  Función para crear un árbol (Separados de la mesa)
function crear_arbol() {
    let arbol: Sprite;
    let x: number;
    let y: number;
    //  Solo creamos si hay menos de 8 árboles en pantalla
    if (sprites.allOfKind(KIND_TREE).length < 8) {
        arbol = sprites.create(assets.image`miImagen`, KIND_TREE)
        x = randint(15, 145)
        y = randint(15, 105)
        //  Evitar zona central de la mesa
        if (x > 50 && x < 110 && y > 30 && y < 90) {
            x += 50
        }
        
        arbol.setPosition(x, y)
    }
    
}

//  Spawner inicial
for (let i = 0; i < 6; i++) {
    crear_arbol()
}
//  Jugador con límites de pantalla
let nena = sprites.create(assets.image`nena-front`, SpriteKind.Player)
nena.setStayInScreen(true)
controller.moveSprite(nena)
info.setScore(0)
//  5. Sistema de Animaciones
controller.down.onEvent(ControllerButtonEvent.Pressed, function on_down_pressed() {
    animation.runImageAnimation(nena, assets.animation`nena-animation-down`, 500, false)
})
controller.right.onEvent(ControllerButtonEvent.Pressed, function on_right_pressed() {
    animation.runImageAnimation(nena, assets.animation`nena-animation-right`, 500, false)
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function on_left_pressed() {
    animation.runImageAnimation(nena, assets.animation`nena-animation-left`, 500, false)
})
controller.up.onEvent(ControllerButtonEvent.Pressed, function on_up_pressed() {
    animation.runImageAnimation(nena, assets.animation`nena-animation-up`, 500, false)
})
//  6. Interacciones y Regeneración
let rural_app = new MercatRural()
controller.A.onEvent(ControllerButtonEvent.Pressed, function on_a_pressed() {
    if (nena.overlapsWith(mesa)) {
        rural_app.iniciar()
    } else {
        nena.sayText("Ves a la mesa!", 500)
    }
    
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function on_b_pressed() {
    let bosque = sprites.allOfKind(KIND_TREE)
    for (let arbol_cerca of bosque) {
        if (nena.overlapsWith(arbol_cerca)) {
            arbol_cerca.destroy(effects.disintegrate, 200)
            info.changeScoreBy(5)
            nena.sayText("+5 Llenya", 500)
        }
        
    }
})
//  Solución Error Línea 145: Regeneración automática cada 4 segundos sin usar 'timer'
game.onUpdateInterval(4000, function on_update_interval() {
    crear_arbol()
})

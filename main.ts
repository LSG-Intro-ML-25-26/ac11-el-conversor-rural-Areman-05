//  1. Definición de tipos de Sprites
let KIND_SCENERY = SpriteKind.create()
let KIND_DECORATION = SpriteKind.create()
let KIND_TREE = SpriteKind.create()
let KIND_NPC = SpriteKind.create()
//  2. Variables globales
let nena : Sprite = null
let mesa : Sprite = null
let mercader : Sprite = null
//  3. Función para crear árboles BIEN SEPARADOS
function crear_arbol() {
    let arbol: Sprite;
    let posicionValida: boolean;
    let x: number;
    let y: number;
    let distanciaMesa: number;
    let demasiadoCercaDeOtro: boolean;
    let d: number;
    if (sprites.allOfKind(KIND_TREE).length < 8) {
        arbol = sprites.create(assets.image`
            miImagen
            `, KIND_TREE)
        posicionValida = false
        x = 0
        y = 0
        //  Intentar buscar una posición con espacio
        while (!posicionValida) {
            x = randint(15, 145)
            y = randint(15, 105)
            //  Distancia a la mesa (centro)
            distanciaMesa = Math.sqrt(Math.pow(x - 80, 2) + Math.pow(y - 60, 2))
            //  Distancia a otros árboles
            demasiadoCercaDeOtro = false
            for (let otro of sprites.allOfKind(KIND_TREE)) {
                d = Math.sqrt(Math.pow(x - otro.x, 2) + Math.pow(y - otro.y, 2))
                if (d < 30) {
                    demasiadoCercaDeOtro = true
                }
                
            }
            if (distanciaMesa > 45 && !demasiadoCercaDeOtro) {
                posicionValida = true
            }
            
        }
        arbol.setPosition(x, y)
    }
    
}

//  4. Lógica del Mercado
function iniciar_tienda() {
    let producto: string;
    let cantidad: number;
    let coste: number;
    let opcions = ["Gallina", "Patata", "Cabra", "Ous", "Cavall"]
    let tria = game.askForNumber("1:Gal 2:Pat 3:Cab 4:Ous 5:Cav", 1)
    if (tria >= 1 && tria <= 5) {
        producto = opcions[tria - 1]
        cantidad = game.askForNumber("Quantes unitats?", 1)
        //  Aquí puedes poner tus tasas (ejemplo 5 de leña por unidad)
        coste = cantidad * 5
        if (info.score() >= coste) {
            info.changeScoreBy(-coste)
            game.showLongText("Comprat: " + ("" + cantidad) + " " + producto, DialogLayout.Center)
        } else {
            game.showLongText("Faltan " + ("" + (coste - info.score())) + " kg de llenya", DialogLayout.Bottom)
        }
        
    }
    
}

//  5. Configuración de Escena
scene.setBackgroundColor(7)
//  Hierba verde
//  Crear Mesa y Mercader (miImagen2)
mesa = sprites.create(assets.image`
    miImagen1
    `, KIND_SCENERY)
mesa.setPosition(80, 65)
mercader = sprites.create(assets.image`
    miImagen2
    `, KIND_NPC)
mercader.setPosition(80, 50)
//  Detrás de la mesa
//  Crear Jugador
nena = sprites.create(assets.image`
    nena-front
    `, SpriteKind.Player)
nena.setStayInScreen(true)
controller.moveSprite(nena)
info.setScore(0)
//  Spawner inicial de árboles
for (let i = 0; i < 6; i++) {
    crear_arbol()
}
//  6. Controles
controller.A.onEvent(ControllerButtonEvent.Pressed, function on_a_pressed() {
    //  Solo si estás cerca de la mesa/mercader
    if (nena.overlapsWith(mesa) || nena.overlapsWith(mercader)) {
        iniciar_tienda()
    } else {
        mercader.sayText("Apropa't a la taula!", 500)
    }
    
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function on_b_pressed() {
    for (let arbol2 of sprites.allOfKind(KIND_TREE)) {
        if (nena.overlapsWith(arbol2)) {
            arbol2.destroy(effects.disintegrate, 200)
            info.changeScoreBy(5)
            nena.sayText("+5 Llenya", 500)
        }
        
    }
})
//  Regeneración de árboles cada 5 segundos
game.onUpdateInterval(5000, function on_update_interval() {
    crear_arbol()
})
//  Animaciones de movimiento
controller.up.onEvent(ControllerButtonEvent.Pressed, function on_up_pressed() {
    animation.runImageAnimation(nena, assets.animation`
            nena-animation-up
            `, 500, false)
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function on_down_pressed() {
    animation.runImageAnimation(nena, assets.animation`
            nena-animation-down
            `, 500, false)
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function on_left_pressed() {
    animation.runImageAnimation(nena, assets.animation`
            nena-animation-left
            `, 500, false)
})
controller.right.onEvent(ControllerButtonEvent.Pressed, function on_right_pressed() {
    animation.runImageAnimation(nena, assets.animation`
            nena-animation-right
            `, 500, false)
})

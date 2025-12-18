# 1. Definición de tipos de Sprites
KIND_SCENERY = SpriteKind.create()
KIND_DECORATION = SpriteKind.create()
KIND_TREE = SpriteKind.create()
KIND_NPC = SpriteKind.create()
# 2. Variables globales
nena: Sprite = None
mesa: Sprite = None
mercader: Sprite = None
# 3. Función para crear árboles BIEN SEPARADOS
def crear_arbol():
    if len(sprites.all_of_kind(KIND_TREE)) < 8:
        arbol = sprites.create(assets.image("""
            miImagen
            """), KIND_TREE)
        posicionValida = False
        x = 0
        y = 0
        # Intentar buscar una posición con espacio
        while not posicionValida:
            x = randint(15, 145)
            y = randint(15, 105)
            # Distancia a la mesa (centro)
            distanciaMesa = Math.sqrt(Math.pow(x - 80, 2) + Math.pow(y - 60, 2))
            # Distancia a otros árboles
            demasiadoCercaDeOtro = False
            for otro in sprites.all_of_kind(KIND_TREE):
                d = Math.sqrt(Math.pow(x - otro.x, 2) + Math.pow(y - otro.y, 2))
                if d < 30:
                    demasiadoCercaDeOtro = True
            if distanciaMesa > 45 and not demasiadoCercaDeOtro:
                posicionValida = True
        arbol.set_position(x, y)
# 4. Lógica del Mercado
def iniciar_tienda():
    opcions = ["Gallina", "Patata", "Cabra", "Ous", "Cavall"]
    tria = game.ask_for_number("1:Gal 2:Pat 3:Cab 4:Ous 5:Cav", 1)
    if tria >= 1 and tria <= 5:
        producto = opcions[tria - 1]
        cantidad = game.ask_for_number("Quantes unitats?", 1)
        # Aquí puedes poner tus tasas (ejemplo 5 de leña por unidad)
        coste = cantidad * 5
        if info.score() >= coste:
            info.change_score_by(-coste)
            game.show_long_text("Comprat: " + str(cantidad) + " " + producto,
                DialogLayout.CENTER)
        else:
            game.show_long_text("Faltan " + str((coste - info.score())) + " kg de llenya",
                DialogLayout.BOTTOM)
# 5. Configuración de Escena
scene.set_background_color(7)
# Hierba verde
# Crear Mesa y Mercader (miImagen2)
mesa = sprites.create(assets.image("""
    miImagen1
    """), KIND_SCENERY)
mesa.set_position(80, 65)
mercader = sprites.create(assets.image("""
    miImagen2
    """), KIND_NPC)
mercader.set_position(80, 50)
# Detrás de la mesa
# Crear Jugador
nena = sprites.create(assets.image("""
    nena-front
    """), SpriteKind.player)
nena.set_stay_in_screen(True)
controller.move_sprite(nena)
info.set_score(0)
# Spawner inicial de árboles
for i in range(6):
    crear_arbol()
# 6. Controles

def on_a_pressed():
    # Solo si estás cerca de la mesa/mercader
    if nena.overlaps_with(mesa) or nena.overlaps_with(mercader):
        iniciar_tienda()
    else:
        mercader.say_text("Apropa't a la taula!", 500)
controller.A.on_event(ControllerButtonEvent.PRESSED, on_a_pressed)

def on_b_pressed():
    for arbol2 in sprites.all_of_kind(KIND_TREE):
        if nena.overlaps_with(arbol2):
            arbol2.destroy(effects.disintegrate, 200)
            info.change_score_by(5)
            nena.say_text("+5 Llenya", 500)
controller.B.on_event(ControllerButtonEvent.PRESSED, on_b_pressed)

# Regeneración de árboles cada 5 segundos

def on_update_interval():
    crear_arbol()
game.on_update_interval(5000, on_update_interval)

# Animaciones de movimiento

def on_up_pressed():
    animation.run_image_animation(nena,
        assets.animation("""
            nena-animation-up
            """),
        500,
        False)
controller.up.on_event(ControllerButtonEvent.PRESSED, on_up_pressed)

def on_down_pressed():
    animation.run_image_animation(nena,
        assets.animation("""
            nena-animation-down
            """),
        500,
        False)
controller.down.on_event(ControllerButtonEvent.PRESSED, on_down_pressed)

def on_left_pressed():
    animation.run_image_animation(nena,
        assets.animation("""
            nena-animation-left
            """),
        500,
        False)
controller.left.on_event(ControllerButtonEvent.PRESSED, on_left_pressed)

def on_right_pressed():
    animation.run_image_animation(nena,
        assets.animation("""
            nena-animation-right
            """),
        500,
        False)
controller.right.on_event(ControllerButtonEvent.PRESSED, on_right_pressed)

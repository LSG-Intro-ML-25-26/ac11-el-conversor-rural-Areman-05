# =============================================================
# CONVERSOR RURAL - ALCUBILLA DE AVELLANEDA (VERSIÓN FINAL)
# =============================================================

# 1. Definición de tipos de Sprites
KIND_SCENERY = SpriteKind.create()
KIND_DECORATION = SpriteKind.create()
KIND_TREE = SpriteKind.create()

# 2. Assets en código
img_egg = img("""
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
""")

# 3. Lógica del Mercado
class MercatRural:
    def __init__(self):
        pass

    def obtener_tasa(self, producte: str) -> number:
        if producte == "Gallina": return 6.0
        if producte == "Patata": return 1.33
        if producte == "Cabra": return 5.0
        if producte == "Ous": return 3.0
        if producte == "Cavall": return 12.0
        return 0

    def calcular_canvi(self, producte: str, unitats: number) -> number:
        tasa = self.obtener_tasa(producte)
        valor = tasa * unitats
        return Math.round(valor * 100) / 100

    def iniciar(self):
        opcions = ["Gallina", "Patata", "Cabra", "Ous", "Cavall"]
        tria_index = game.ask_for_number("1:Gal 2:Pat 3:Cab 4:Ous 5:Cav", 1)
        
        if tria_index < 1 or tria_index > 5:
            return
            
        producte = opcions[tria_index - 1]
        q = game.ask_for_number("Unitats?", 1)

        if q <= 0:
            game.show_long_text("Error: Quantitat positiva!", DialogLayout.BOTTOM)
        elif (producte == "Gallina" or producte == "Cabra" or producte == "Cavall") and q % 1 != 0:
            game.show_long_text("Error: Animals sencers!", DialogLayout.BOTTOM)
        else:
            total_necesari = self.calcular_canvi(producte, q)
            if info.score() >= total_necesari:
                info.change_score_by(-total_necesari)
                game.show_long_text("Has comprat " + str(q) + " " + producte + "!", DialogLayout.CENTER)
            else:
                game.show_long_text("Faltan " + str(total_necesari) + " kg", DialogLayout.BOTTOM)

# 4. Configuración de Escena y Sprites
# Solución Error Línea 83: Quitamos set_tile_map y usamos color de fondo directo
scene.set_background_color(7)

# Mesa y decoración
mesa = sprites.create(assets.image("miImagen1"), KIND_SCENERY)
mesa.set_position(80, 60)
decor_ou = sprites.create(img_egg, KIND_DECORATION)
decor_ou.set_position(80, 52)

# Función para crear un árbol (Separados de la mesa)
def crear_arbol():
    # Solo creamos si hay menos de 8 árboles en pantalla
    if len(sprites.all_of_kind(KIND_TREE)) < 8:
        arbol = sprites.create(assets.image("miImagen"), KIND_TREE)
        x = randint(15, 145)
        y = randint(15, 105)
        # Evitar zona central de la mesa
        if x > 50 and x < 110 and y > 30 and y < 90:
            x += 50
        arbol.set_position(x, y)

# Spawner inicial
for i in range(6):
    crear_arbol()

# Jugador con límites de pantalla
nena = sprites.create(assets.image("nena-front"), SpriteKind.player)
nena.set_stay_in_screen(True)
controller.move_sprite(nena)
info.set_score(0)

# 5. Sistema de Animaciones
def on_down_pressed():
    animation.run_image_animation(nena, assets.animation("nena-animation-down"), 500, False)
controller.down.on_event(ControllerButtonEvent.PRESSED, on_down_pressed)
def on_right_pressed():
    animation.run_image_animation(nena, assets.animation("nena-animation-right"), 500, False)
controller.right.on_event(ControllerButtonEvent.PRESSED, on_right_pressed)
def on_left_pressed():
    animation.run_image_animation(nena, assets.animation("nena-animation-left"), 500, False)
controller.left.on_event(ControllerButtonEvent.PRESSED, on_left_pressed)
def on_up_pressed():
    animation.run_image_animation(nena, assets.animation("nena-animation-up"), 500, False)
controller.up.on_event(ControllerButtonEvent.PRESSED, on_up_pressed)

# 6. Interacciones y Regeneración
rural_app = MercatRural()

def on_a_pressed():
    if nena.overlaps_with(mesa):
        rural_app.iniciar()
    else:
        nena.say_text("Ves a la mesa!", 500)
controller.A.on_event(ControllerButtonEvent.PRESSED, on_a_pressed)

def on_b_pressed():
    bosque = sprites.all_of_kind(KIND_TREE)
    for arbol_cerca in bosque:
        if nena.overlaps_with(arbol_cerca):
            arbol_cerca.destroy(effects.disintegrate, 200)
            info.change_score_by(5)
            nena.say_text("+5 Llenya", 500)
controller.B.on_event(ControllerButtonEvent.PRESSED, on_b_pressed)

# Solución Error Línea 145: Regeneración automática cada 4 segundos sin usar 'timer'
def on_update_interval():
    crear_arbol()
game.on_update_interval(4000, on_update_interval)
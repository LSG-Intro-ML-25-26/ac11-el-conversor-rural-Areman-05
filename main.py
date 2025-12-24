# --- 1. CONFIGURACIÓ I TIPIFICACIÓ ---
KIND_SCENERY = SpriteKind.create()
KIND_TREE = SpriteKind.create()
KIND_NPC = SpriteKind.create()
# --- 2. DADES DEL MERCAT (Trueque) ---
# Fem servir llistes globals perquè el traductor de Python ho entengui bé
llista_taxes = [6, 1.3333, 5, 0.25, 12]
llista_noms = ["Gallina", "kg de Patates", "Cabra", "Ous frescos", "Cavall"]
llista_animals = [True, False, True, False, True]
"""

Funció principal per gestionar l'intercanvi de productes.
Substitueix la classe per garantir compatibilitat amb Python.

"""
def processar_compra(index: number, q: number):
    nom_producte = llista_noms[index]
    taxa_producte = llista_taxes[index]
    es_animal = llista_animals[index]
    # Gestió d'errors per als veïns "graciosos"
    if q <= 0:
        game.show_long_text("Ei! Només acceptem canvis positius. No volem trastos!",
            DialogLayout.BOTTOM)
        return
    if es_animal and q % 1 != 0:
        game.show_long_text("Alerta! Els animals s'han de canviar sencers. Res de potes!",
            DialogLayout.BOTTOM)
        return
    cost_llenya = Math.round(taxa_producte * q * 100) / 100
    # Verificació de la puntuació (kg de llenya)
    if info.score() >= cost_llenya:
        info.change_score_by(-cost_llenya)
        music.ba_ding.play()
        game.show_long_text("FET: Per " + str(q) + " " + nom_producte + " has donat " + str(cost_llenya) + "kg de llenya.",
            DialogLayout.CENTER)
    else:
        falta = Math.round((cost_llenya - info.score()) * 100) / 100
        game.show_long_text("Falta llenya! Necessites " + str(cost_llenya) + "kg (et falten " + str(falta) + "kg).",
            DialogLayout.BOTTOM)
# --- 3. VARIABLES DEL JOC ---
nena: Sprite = None
mercader: Sprite = None
prop_arbre = False
tria_usuari = 0
quantitat_usuari = 0
sortir_menu = False
# --- 4. FUNCIONS MODULARS ---
def inicialitzar_entorn():
    global mercader, nena
    tiles.set_current_tilemap(tilemap("""
        map
        """))
    # Creem el mercader al punt del trueque
    mercader = sprites.create(assets.image("""
        miImagen2
        """), KIND_NPC)
    tiles.place_on_tile(mercader, tiles.get_tile_location(8, 7))
    # La nostra protagonista
    nena = sprites.create(assets.image("""
        nena-front
        """), SpriteKind.player)
    tiles.place_on_tile(nena, tiles.get_tile_location(8, 10))
    scene.camera_follow_sprite(nena)
    controller.move_sprite(nena)
    info.set_score(0)
    # Generem els primers arbres
    for i in range(8):
        crear_un_arbre()
def crear_un_arbre():
    if len(sprites.all_of_kind(KIND_TREE)) < 15:
        nou_arbre = sprites.create(assets.image("""
            miImagen
            """), KIND_TREE)
        c = randint(1, 14)
        r = randint(1, 14)
        # Evitem que surtin sobre parets o al mig del camí
        if not tiles.tile_at_location_is_wall(tiles.get_tile_location(c, r)) and abs(c - 8) > 2:
            tiles.place_on_tile(nou_arbre, tiles.get_tile_location(c, r))
        else:
            nou_arbre.destroy()
def menu_intercanvi():
    global sortir_menu, tria_usuari, quantitat_usuari
    sortir_menu = False
    while not sortir_menu:
        tria_usuari = game.ask_for_number("1:Gal 2:Pat 3:Cab 4:Ou 5:Cav 0:Sortir", 1)
        if tria_usuari == 0:
            sortir_menu = True
            game.show_long_text("Torna quan vulguis fer més trueque!", DialogLayout.BOTTOM)
        elif tria_usuari >= 1 and tria_usuari <= 5:
            quantitat_usuari = game.ask_for_number("Quanta quantitat en vols?", 3)
            processar_compra(tria_usuari - 1, quantitat_usuari)
# --- 5. ESDEVENIMENTS I CICLE DE JOC ---
inicialitzar_entorn()
# Regeneració cada 3 segons

def on_update_interval():
    crear_un_arbre()
    crear_un_arbre()
game.on_update_interval(3000, on_update_interval)

# Accions de botons

def on_a_pressed():
    if nena.overlaps_with(mercader):
        menu_intercanvi()
controller.A.on_event(ControllerButtonEvent.PRESSED, on_a_pressed)

def on_b_pressed():
    for obj in sprites.all_of_kind(KIND_TREE):
        if nena.overlaps_with(obj):
            nena.say_text("Xac!", 200)
            pause(200)
            obj.destroy(effects.disintegrate, 200)
            info.change_score_by(5)
            music.small_crash.play()
            break
controller.B.on_event(ControllerButtonEvent.PRESSED, on_b_pressed)

# Proximitat i missatges flotants

def on_on_update():
    global prop_arbre
    # Mercader
    if abs(nena.x - mercader.x) < 30 and abs(nena.y - mercader.y) < 30:
        mercader.say_text("A: Comprar", 100)
    # Arbres
    prop_arbre = False
    for arb in sprites.all_of_kind(KIND_TREE):
        if abs(nena.x - arb.x) < 25 and abs(nena.y - arb.y) < 25:
            prop_arbre = True
            break
    if prop_arbre:
        nena.say_text("B: Talar", 100)
game.on_update(on_on_update)

# Animacions compatibles

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

extends ScrollContainer

@onready var tile_display = $PanelContainer/VBoxContainer2/GridContainer
@onready var case_scene = preload("res://scenes/tile_display_case.tscn")

func _ready() -> void:
	for t in Global.tile_types:
		var case = case_scene.instantiate()
		tile_display.add_child(case)
		case.attach_tile(t)

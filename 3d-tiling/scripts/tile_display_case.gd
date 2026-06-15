extends VBoxContainer

@onready var tile_parent = $SubViewportContainer/SubViewport/Node3D
@onready var active = $HBoxContainer/CheckBox
@onready var title = $RichTextLabel

var tile
signal toggled_active(t, toggled_on)

func attach_tile(t):
	tile = t
	var scene = t.scene.instantiate()
	tile_parent.add_child(scene)
	active.button_pressed = Global.settings.active_tiles.has(t)
	title.text = t.title

func _on_check_box_toggled(toggled_on: bool) -> void:
	toggled_active.emit(tile, toggled_on)

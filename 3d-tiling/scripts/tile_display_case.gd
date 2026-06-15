extends VBoxContainer

@onready var tile_parent = $SubViewportContainer/SubViewport/Node3D

func attach_tile(t):
	var scene = t.scene.instantiate()
	tile_parent.add_child(scene)

class_name Bridge
extends Tile

static var scene = preload("res://scenes/tiles/bridge.tscn")
static var title = "Bridge Element"

#order of bits -> FRBLUD
static var connector = 0b101000
static var connector_rotations: Array[int] = []
static var mesh_rotations = []

static func permute():
	var res = generate_orientations(connector)
	connector_rotations = res["connectors"]
	mesh_rotations = res["meshes"]

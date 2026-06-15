class_name ElevDown
extends Tile

static var scene = preload("res://scenes/tiles/elevator_down.tscn")
static var title = "Downward Element"

#order of bits -> FRBLUD
static var connector = 0b001001
static var connector_rotations: Array[int] = []
static var mesh_rotations = []

static func permute():
	var res = generate_orientations(connector)
	connector_rotations = res["connectors"]
	mesh_rotations = res["meshes"]

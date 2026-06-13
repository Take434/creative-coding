class_name XCross
extends Tile

static var scene = preload("res://scenes/tiles/x_cross.tscn")

#order of bits -> FRBLUD
static var connector = 0b111100
static var connector_rotations: Array[int] = []
static var mesh_rotations = []

static func permute():
	var res = generate_orientations(connector)
	connector_rotations = res["connectors"]
	mesh_rotations = res["meshes"]

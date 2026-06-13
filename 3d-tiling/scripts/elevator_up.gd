class_name ElevUp
extends Tile

static var scene = preload("res://scenes/tiles/elevator_up.tscn")

#order of bits -> FRBLUD
static var connector = 0b001010
static var connector_rotations: Array[int] = []
static var mesh_rotations = []

static func permute():
	var res = generate_orientations(connector)
	connector_rotations = res["connectors"]
	mesh_rotations = res["meshes"]

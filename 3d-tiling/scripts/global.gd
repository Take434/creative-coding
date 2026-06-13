extends Node

const masks = {
	"F": 1 << 5,
	"R": 1 << 4,
	"B": 1 << 3,
	"L": 1 << 2,
	"U": 1 << 1,
	"D": 1 << 0
}

const tile_length = 10

const directions = {
	"F": Vector3i(0, 0, 1) * tile_length,
	"R": Vector3i(1, 0, 0) * tile_length,
	"B": Vector3i(0, 0, -1) * tile_length,
	"L": Vector3i(-1, 0, 0) * tile_length,
	"U": Vector3i(0, 1, 0) * tile_length,
	"D": Vector3i(0, -1, 0) * tile_length,
}

const QX = Quaternion(Vector3.RIGHT, PI/2)
const QY = Quaternion(Vector3.UP, PI/2)
const QZ = Quaternion(Vector3.FORWARD, PI/2)

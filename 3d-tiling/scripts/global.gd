extends Node

signal hide_ui
signal show_ui
signal settings_changed

var tile_types = [
	UTile,
	XCross,
	Bridge,
	TSection,
	ElevDown,
	ElevUp
]

var settings = {
	"active_tiles": tile_types.duplicate(),
	"just_connection": true,
	"just_2d": false,
	"spawn_speed": 0.8,
	"active_rotations": {
		"x": true,
		"y": true,
		"z": true
	}
}

var ui_visible = false

const masks = {
	"F": 1 << 5,
	"R": 1 << 4,
	"B": 1 << 3,
	"L": 1 << 2,
	"U": 1 << 1,
	"D": 1 << 0
}

const tile_length = 10

const DIRS = [
	{
		"mask": masks.F,
		"offset": Vector3i(0, 0, 1) * tile_length,
		"opposite": masks.B
	},
	{
		"mask": masks.R,
		"offset": Vector3i(1, 0, 0) * tile_length,
		"opposite": masks.L
	},
	{
		"mask": masks.B,
		"offset": Vector3i(0, 0, -1) * tile_length,
		"opposite": masks.F
	},
	{
		"mask": masks.L,
		"offset": Vector3i(-1, 0, 0) * tile_length,
		"opposite": masks.R
	},
	{
		"mask": masks.U,
		"offset": Vector3i(0, 1, 0) * tile_length,
		"opposite": masks.D
	},
	{
		"mask": masks.D,
		"offset": Vector3i(0, -1, 0) * tile_length,
		"opposite": masks.U
	}
]

const QX = Quaternion(Vector3.RIGHT, -PI/2)
const QY = Quaternion(Vector3.UP, PI/2)
const QZ = Quaternion(Vector3(0, 0, 1), PI/2)

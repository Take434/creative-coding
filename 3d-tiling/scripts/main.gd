extends Node3D

@onready var bridge_scene = preload("res://scenes/bridge.tscn")
var spawn_tile_timer: Timer
var last_spawn_z := 0

func _ready() -> void:
	spawn_tile()
	
	var spawn_tile_callable = Callable(self, "spawn_tile");
	spawn_tile_timer = Timer.new()
	spawn_tile_timer.wait_time = 2
	spawn_tile_timer.one_shot = false
	spawn_tile_timer.connect("timeout", spawn_tile_callable)
	add_child(spawn_tile_timer)
	spawn_tile_timer.start()

func spawn_tile() -> void:
	var b: Bridge = bridge_scene.instantiate();
	b.position.z += last_spawn_z + 5
	add_child(b);

	last_spawn_z += 5

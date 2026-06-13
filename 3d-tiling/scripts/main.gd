extends Node3D

var tile_types = [
	UTile,
	XCross,
	Bridge,
	TSection,
	ElevDown,
	ElevUp
]

var spawn_tile_timer: Timer
var rng = RandomNumberGenerator.new()

var grid := { }
var frontier := {
	Vector3i(0, 0, 0): {
		"required": 0b000000,
		"relevant": 0b000000
	}
}

func _ready() -> void:
	for t in tile_types:
		t.permute()
	
	spawn_tile()
	
	var spawn_tile_callable = Callable(self, "spawn_tile");
	spawn_tile_timer = Timer.new()
	spawn_tile_timer.wait_time = .1
	spawn_tile_timer.one_shot = false
	spawn_tile_timer.connect("timeout", spawn_tile_callable)
	add_child(spawn_tile_timer)
	spawn_tile_timer.start()

func spawn_tile() -> void:
	# choose where to place next tile
	var keys = frontier.keys()
	
	if keys.size() <= 0:
		return
	
	var ind = rng.randi_range(0, keys.size() - 1)
	var frontier_position = keys[ind]
	var chosen_frontier = frontier[frontier_position]
	
	# get possible tiles
	var possibilities = []
	
	for t in tile_types:
		var matches = get_connector_matches(t, chosen_frontier["required"], chosen_frontier["relevant"])
		possibilities.append_array(matches)
		
	if possibilities.size() == 0:
		frontier.erase(frontier_position)
		return
		
	# chose one
	var index = rng.randi_range(0, possibilities.size() - 1)
	var next_tile = possibilities[index]
	var next_tile_class = next_tile["t"]
	var new_connector = next_tile["con"]

	# append tile to grid
	grid[frontier_position] = new_connector
	frontier.erase(frontier_position)

	# update frontiers
	var new_frontier_directions = []
	
	for dir in Global.DIRS:
		var f = frontier_position + dir.offset
		
		if grid.has(f):
			continue
		
		if frontier.has(f):
			var old_frontier = frontier[f]
			old_frontier["relevant"] |= dir.opposite
			
			if new_connector & dir.mask:
				old_frontier["required"] |= dir.opposite
			
			frontier[f] = old_frontier
			
		else:
			if new_connector & dir.mask:
				new_frontier_directions.append(f)
	
	# for each frontier direction
	# check neighboring tiles
	# where neighbor exists, relevant is 1
	# check neighbors connector to update required 
	for new_front in new_frontier_directions:
		var required = 0
		var relevant = 0
		
		for dir in Global.DIRS:
			var neighbor_pos = new_front + dir.offset
			if grid.has(neighbor_pos):
				relevant |= dir.mask
				if grid[neighbor_pos] & dir.opposite:
					required |= dir.mask
		
		frontier[new_front] = {
			"required": required,
			"relevant": relevant
		}

	# place tile
	var instance: Node3D = next_tile_class.scene.instantiate()
	instance.quaternion = next_tile["rot"]
	instance.position = frontier_position
	add_child(instance)

func get_connector_matches(t, required: int, relevant: int):
	var matches = []
	for c in range(t.connector_rotations.size()):
		var candidate = t.connector_rotations[c]
		var rot = t.mesh_rotations[c]
		if (candidate & relevant) == required:
			matches.append({ "t": t, "con": candidate, "rot": rot })
	
	return matches

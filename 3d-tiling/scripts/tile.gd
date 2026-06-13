class_name Tile
extends Node3D

static func generate_orientations(connector):
	var seen = {}
	var queue = []

	var connector_rotations: Array[int] = []
	var mesh_rotatios = []

	var identity_quat = Quaternion.IDENTITY

	queue.append({
		"mask": connector,
		"quat": identity_quat
	})

	while queue.size() > 0:
		var current = queue.pop_front()

		var mask = current["mask"]
		var quat = current["quat"]

		if seen.has(mask):
			continue

		seen[mask] = true
		connector_rotations.append(current.mask)
		mesh_rotatios.append(current.quat)

		# Apply rotations (key step)
		#_try_add(seen, queue, rotate_connector_x(mask), quat * QX)
		_try_add(seen, queue, rotate_connector_y(mask), quat * Global.QY)
		#_try_add(seen, queue, rotate_connector_z(mask), quat * QZ)

	return {
		"connectors": connector_rotations,
		"meshes": mesh_rotatios
	}

static func _try_add(seen, queue, new_mask, new_quat):
	if seen.has(new_mask):
		return

	queue.append({
		"mask": new_mask,
		"quat": new_quat
	})

static func rotate_connector_y(mask) -> int:
	var res = 0
	
	if mask & Global.masks["F"]: res |= Global.masks["R"]
	if mask & Global.masks["R"]: res |= Global.masks["B"]
	if mask & Global.masks["B"]: res |= Global.masks["L"]
	if mask & Global.masks["L"]: res |= Global.masks["F"]
	if mask & Global.masks["U"]: res |= Global.masks["U"]
	if mask & Global.masks["D"]: res |= Global.masks["D"]
	
	return res

static func rotate_connector_x(mask) -> int:
	var res = 0
	
	if mask & Global.masks["F"]: res |= Global.masks["U"]
	if mask & Global.masks["R"]: res |= Global.masks["R"]
	if mask & Global.masks["B"]: res |= Global.masks["D"]
	if mask & Global.masks["L"]: res |= Global.masks["L"]
	if mask & Global.masks["U"]: res |= Global.masks["B"]
	if mask & Global.masks["D"]: res |= Global.masks["F"]
	
	return res 

static func rotate_connector_z(mask) -> int:
	var res = 0
	
	if mask & Global.masks["F"]: res |= Global.masks["F"]
	if mask & Global.masks["R"]: res |= Global.masks["U"]
	if mask & Global.masks["B"]: res |= Global.masks["B"]
	if mask & Global.masks["L"]: res |= Global.masks["D"]
	if mask & Global.masks["U"]: res |= Global.masks["L"]
	if mask & Global.masks["D"]: res |= Global.masks["R"]
	
	return res

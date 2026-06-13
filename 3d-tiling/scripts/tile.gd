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
		#_try_add(seen, queue, rotate_connector_x(mask), Global.QX * quat)
		_try_add(seen, queue, rotate_connector_y(mask), Global.QY * quat)
		#_try_add(seen, queue, rotate_connector_z(mask), Global.QZ * quat)

	for i in range(connector_rotations.size()):
		print(
			mask_to_string(connector_rotations[i]),
			"  ",
			mesh_rotatios[i]
		)

	return {
		"connectors": connector_rotations,
		"meshes": mesh_rotatios
	}

static func mask_to_string(mask):
	var s = ""

	if mask & Global.masks.F: s += "F"
	if mask & Global.masks.R: s += "R"
	if mask & Global.masks.B: s += "B"
	if mask & Global.masks.L: s += "L"
	if mask & Global.masks.U: s += "U"
	if mask & Global.masks.D: s += "D"

	return s

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

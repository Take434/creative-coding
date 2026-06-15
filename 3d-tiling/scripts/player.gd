extends CharacterBody3D

const SPEED = 15.0
const JUMP_VELOCITY = 4.5
var mouse_sense = 0.15
var flying = false

@onready var head = $Head
@onready var camera = $Head/Camera3D

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel") && Global.ui_visible:
		Global.hide_ui.emit()
	elif event.is_action_pressed("ui_cancel"):
		Global.show_ui.emit()
		
	if event is InputEventMouseButton && !Global.ui_visible:
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED;
	
	if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		if event is InputEventMouseMotion:
			rotate_y(deg_to_rad(-event.relative.x * mouse_sense))
			head.rotate_x(deg_to_rad(-event.relative.y * mouse_sense))
			head.rotation.x = clamp(head.rotation.x, deg_to_rad(-89), deg_to_rad(89))
	
	if event.is_action_pressed("flight") && !Global.ui_visible:
		flying = !flying

func _physics_process(delta: float) -> void:
	if Global.ui_visible:
		return
	
	## Add the gravity.
	if !is_on_floor() && !flying:
		velocity += get_gravity() * delta

	# Handle jump.
	if Input.is_action_just_pressed("ui_accept") && is_on_floor() && !flying:
		velocity.y = JUMP_VELOCITY

	if Input.is_action_just_pressed("ui_accept") && flying:
		velocity.y = SPEED
	
	if Input.is_action_just_pressed("down") && flying:
		velocity.y = -SPEED

	if Input.is_action_just_released("up") || Input.is_action_just_released("down"):
		velocity.y = 0

	# Get the input direction and handle the movement/deceleration.
	# As good practice, you should replace UI actions with custom gameplay actions.
	var input_dir := Input.get_vector("left", "right", "forward", "backward")
	var direction := (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()
	if direction:
		velocity.x = direction.x * SPEED
		velocity.z = direction.z * SPEED
	else:
		velocity.x = move_toward(velocity.x, 0, SPEED)
		velocity.z = move_toward(velocity.z, 0, SPEED)

	move_and_slide()

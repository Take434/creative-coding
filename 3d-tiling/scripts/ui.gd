extends ScrollContainer

@onready var tile_display = $PanelContainer/VBoxContainer2/GridContainer
@onready var case_scene = preload("res://scenes/tile_display_case.tscn")

@onready var x_check = $PanelContainer/VBoxContainer2/HBoxContainer/VBoxContainer/HBoxContainer/CheckBox
@onready var y_check = $PanelContainer/VBoxContainer2/HBoxContainer/VBoxContainer/HBoxContainer2/CheckBox
@onready var z_check =$PanelContainer/VBoxContainer2/HBoxContainer/VBoxContainer/HBoxContainer3/CheckBox

@onready var only_con_check = $PanelContainer/VBoxContainer2/HBoxContainer/VBoxContainer2/HBoxContainer/CheckBox
@onready var only_2d_check = $PanelContainer/VBoxContainer2/HBoxContainer/VBoxContainer2/HBoxContainer2/CheckBox

@onready var spawn_speed_slider = $PanelContainer/VBoxContainer2/HBoxContainer/VBoxContainer2/HSlider

@onready var local_settings = Global.settings.duplicate()

func _ready() -> void:
	set_state()

func set_state():
	#rotations
	x_check.button_pressed = Global.settings.active_rotations.x
	y_check.button_pressed = Global.settings.active_rotations.y
	z_check.button_pressed = Global.settings.active_rotations.z
	
	#only connection
	only_con_check.button_pressed = Global.settings.just_connection
	only_2d_check.button_pressed = Global.settings.just_2d
	
	#spawn speed
	spawn_speed_slider.set_value_no_signal(Global.settings.spawn_speed)
	
	for t in Global.tile_types:
		var case = case_scene.instantiate()
		tile_display.add_child(case)
		case.attach_tile(t)
		case.add_to_group("case")
		case.toggled_active.connect(_on_active_tile_toggled)

func _on_active_tile_toggled(t, toggled_on) -> void:
		if !toggled_on:
			local_settings.active_tiles.erase(t)
		elif !local_settings.active_tiles.has(t):
			local_settings.active_tiles.append(t)

func _on_x_check_toggled(toggled_on: bool) -> void:
	local_settings.active_rotations.x = toggled_on

func _on_y_check_toggled(toggled_on: bool) -> void:
	local_settings.active_rotations.y = toggled_on

func _on_z_check_toggled(toggled_on: bool) -> void:
	local_settings.active_rotations.z = toggled_on

func _on_only_con_check_toggled(toggled_on: bool) -> void:
	local_settings.just_connection = toggled_on

func _on_only_2d_check_toggled(toggled_on: bool) -> void:
	local_settings.just_2d = toggled_on

func _on_speed_slider_value_changed(value: float) -> void:
	local_settings.spawn_speed = value

func _on_button_reload_pressed() -> void:
	Global.settings = local_settings.duplicate()
	Global.settings_changed.emit()

func _on_button_canceld_pressed() -> void:
	local_settings = Global.settings.duplicate()
	Global.hide_ui.emit()

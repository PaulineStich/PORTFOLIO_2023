uniform vec2 u_glPositionOffset;

vec4 glPositionOffset (vec4 glPosition) {
	return glPosition + vec4(u_glPositionOffset * glPosition.w, 0.0, 0.0);
}
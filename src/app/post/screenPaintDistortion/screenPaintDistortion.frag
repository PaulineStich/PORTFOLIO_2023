uniform sampler2D u_texture;
uniform sampler2D u_screenPaintTexture;
uniform vec2 u_screenPaintTexelSize;
uniform float u_amount;
uniform float u_rgbShift;
uniform float u_multiplier;
uniform float u_shade;

varying vec2 v_uv;

void main () {

	vec4 data = texture2D(u_screenPaintTexture, v_uv);
	float weight = (data.z + data.w) * 0.5;
	vec2 vel = (0.5 - data.xy - 0.001) * -2. * weight;

	vec4 color = vec4(
		texture2D(u_texture, v_uv + (vel * (u_amount)) * u_screenPaintTexelSize).ra,
		texture2D(u_texture, v_uv + (vel * (u_amount + u_rgbShift)) * u_screenPaintTexelSize).g,
		texture2D(u_texture, v_uv + (vel * (u_amount + u_rgbShift * 2.)) * u_screenPaintTexelSize).b
	).rbag;

	color.rgb += sin(vec3(vel.x + vel.y) * 20.0 + vec3(0.0, 2.09439, 4.188792)) * smoothstep(0.1, 0.3, weight) * smoothstep(0.4, -0.3, weight) * u_shade * max(abs(vel.x), abs(vel.y)) * 10.0;
    gl_FragColor = color;
}

varying vec2 v_uv;
uniform sampler2D u_texture;
uniform sampler2D u_blurTexture;
uniform float u_amount;

void main() {
	vec4 cs = texture2D(u_texture, v_uv);
	vec4 cb = texture2D(u_blurTexture, v_uv);
	vec3 rgb = cs.rgb * cb.a + cb.rgb;

	gl_FragColor =  mix(cs, vec4(rgb, cs.a), u_amount);
}

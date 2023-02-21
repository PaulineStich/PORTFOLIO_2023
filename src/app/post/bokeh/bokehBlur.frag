uniform sampler2D u_bokehTexture;
uniform vec2 u_bokehTexelSize;

varying vec2 v_uv;

void main () {
    // 9-tap tent filter
    vec4 duv = u_bokehTexelSize.xyxy * vec4(1.0, 1.0, -1.0, 0.0);
    vec4 acc;

    acc  = texture2D(u_bokehTexture, v_uv - duv.xy);
    acc += texture2D(u_bokehTexture, v_uv - duv.wy) * 2.0;
    acc += texture2D(u_bokehTexture, v_uv - duv.zy);

    acc += texture2D(u_bokehTexture, v_uv + duv.zw) * 2.0;
    acc += texture2D(u_bokehTexture, v_uv ) * 4.0;
    acc += texture2D(u_bokehTexture, v_uv + duv.xw) * 2.0;

    acc += texture2D(u_bokehTexture, v_uv + duv.zy);
    acc += texture2D(u_bokehTexture, v_uv + duv.wy) * 2.0;
    acc += texture2D(u_bokehTexture, v_uv + duv.xy);

    gl_FragColor = acc * 0.0625;
}
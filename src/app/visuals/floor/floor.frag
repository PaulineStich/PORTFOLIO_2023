uniform sampler2D u_infoTexture;
uniform sampler2D u_aoTexture;

uniform sampler2D u_mipmapTexture;
uniform vec2 u_textureSize;
uniform vec2 u_mipmapTextureSize;
uniform float u_mipmapMaxLod;
uniform float u_noiseTime;

#include <textureBicubic>
#include <lodMipmapSample>

varying vec4 v_reflectionTextureUv;
varying vec2 v_uv;
varying vec2 v_uv2;

#define roughLodSample lodMipmapSampleCubic

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

void main () {

	vec2 reflectionUv = v_reflectionTextureUv.xy / v_reflectionTextureUv.w;

	float lodRatio = u_mipmapMaxLod / 12.0;

	float lodMultiplier = 0.3;
	float baseLod = 4.0;
    vec3 color = lodMipmapSampleCubic(u_mipmapTexture, reflectionUv, baseLod * lodRatio, u_mipmapTextureSize).rgb;

	vec3 info;
	vec3 blury;
	info = texture2D(u_infoTexture, v_uv).rgb;
    blury = roughLodSample(u_mipmapTexture, reflectionUv + info.br / 128.0 * lodMultiplier, (info.r * info.g * 8.0 * lodMultiplier + baseLod) * lodRatio, u_mipmapTextureSize).rgb;
	color = mix(color, blury, clamp((info.g - 0.25) * 5.0, 0.0, 1.0));

	info = texture2D(u_infoTexture, v_uv2).rgb;
    blury = roughLodSample(u_mipmapTexture, reflectionUv, (info.r * 5.0 * lodMultiplier + baseLod) * lodRatio, u_mipmapTextureSize).rgb;
	color = mix(color, blury, clamp((info.b - 0.3) *  7.0, 0.0, 1.0));

	gl_FragColor = vec4(color * mix(0.75, 1.0, info.g), 1.0);

}

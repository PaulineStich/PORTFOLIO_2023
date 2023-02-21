uniform sampler2D u_texture;
uniform mat4 projectionMatrix;
uniform float u_isReflection;
uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;

varying vec3 v_viewPosition;
varying vec3 v_worldPosition;
varying vec3 v_viewNormal;
varying float v_ao;
varying float v_thickness;

#include <getBlueNoise>

vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}

void main () {
	vec3 blueNoise = getBlueNoise(gl_FragCoord.xy);

	float cameraNear = projectionMatrix[3][2] / (projectionMatrix[2][2] - 1.0);
	float depthDiscardRange = 1.; // 1 meter from the camera
	if (max(0.0, (-v_viewPosition.z - cameraNear) / depthDiscardRange) < blueNoise.z - u_isReflection) discard;

	float ao = v_ao;
	vec3 albedo = vec3(1.0);
	float roughness = 0.5;
	float metalness = 0.0;

	vec3 lightPosition = u_lightPosition;
	vec3 lightColor = u_lightColor;

	vec3 viewNormal = normalize(v_viewNormal);
	vec3 worldNormal = inverseTransformDirection(viewNormal, viewMatrix);
	vec3 viewDir = normalize(cameraPosition - v_worldPosition);
	vec3 lightDir = lightPosition - v_worldPosition;
	float lightDistance = length(lightDir);
	lightDir /= lightDistance;

    vec3 F0 = mix(vec3(0.04), albedo, metalness);

	// cheaper pbr
	// http://filmicworlds.com/blog/optimizing-ggx-shaders-with-dotlh/
	vec3 H = normalize(viewDir + lightDir);
	float dotNL = max(0., dot(worldNormal, lightDir));
	float dotLH = max(0., dot(lightDir, H));
	float dotNH = max(0., dot(worldNormal, H));

	float alpha = roughness*roughness;

	// D
	float alphaSqr = alpha * alpha;
	float pi = 3.14159;
	float denom = dotNH * dotNH *(alphaSqr-1.0) + 1.0;
	float D = alphaSqr/(pi * denom * denom);

	// F
	vec3 F = F0 + (1.-F0) * exp2((-5.55473 * dotLH - 6.98316) * dotLH);

	// V
	float k = alpha * .5;
	float k2 = k*k;
	float invK2 = 1.0-k2;
	float V = 1. / (dotLH*dotLH*invK2 + k2);
	vec3 specular = D * F * V;

	float attenuation = 1.0 / (lightDistance * lightDistance);
	vec3 radiance = lightColor * attenuation;

	vec3 kD = vec3(1.0) - F;
	kD *= 1.0 - metalness;

	vec3 color = (albedo * kD / 3.1415926 + specular) * radiance * dotNL;

	// SSS - Not PBR
	// https://colinbarrebrisebois.com/2011/03/07/gdc-2011-approximating-translucency-for-a-fast-cheap-and-convincing-subsurface-scattering-look/
	float distortion = 0.25;
	float power = 5.0;
	float scale = 1.0;
	vec3 ambientSSS = vec3(1.0);
    H = normalize(lightDir + worldNormal * distortion);
    float dotVH = pow(clamp(dot(viewDir, -H), 0.0, 1.0), power) * scale;
    vec3 I = vec3(attenuation) * (dotVH + ambientSSS) * (1.0 - v_thickness) * (ao * 0.5 + 0.5);

	gl_FragColor = vec4(color + I * lightColor, 1.0);

}

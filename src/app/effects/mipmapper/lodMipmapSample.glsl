vec2 getMipUv (vec2 uv, float lod, vec2 mipmapTextureSize) {
	vec2 textureSize = mipmapTextureSize * vec2(0.666666667, 1.0);
	float isNonZeroLod = step(0.5, lod);
	vec2 xy = vec2(
		isNonZeroLod * textureSize.x / mipmapTextureSize.x,
		1.0 - 1.0 / pow(2.0, max(0.0, lod - 1.0))
	);
	vec2 wh = (max(vec2(1.0), floor(textureSize / pow(2.0, lod))));
	return xy + (0.5 + uv * (wh - 1.0)) / mipmapTextureSize;
}

vec2 getMipUv (vec2 uv, float lod, vec2 mipmapTextureSize, out vec4 clampRect) {
	vec2 textureSize = mipmapTextureSize * vec2(0.666666667, 1.0);
	float isNonZeroLod = step(0.5, lod);
	vec2 xy = vec2(
		isNonZeroLod * textureSize.x / mipmapTextureSize.x,
		1.0 - 1.0 / pow(2.0, max(0.0, lod - 1.0))
	);
	vec2 wh = (max(vec2(1.0), floor(textureSize / pow(2.0, lod))));
	vec2 halfTexelSize = 0.5 / mipmapTextureSize;

	clampRect = vec4(
		xy + halfTexelSize,
		xy + (wh - 1.0) / mipmapTextureSize
	);
	
	return xy + (0.5 + uv * (wh - 1.0)) / mipmapTextureSize;
}

vec4 lodMipmapSampleNearestCubic (sampler2D tex, vec2 uv, float lod, vec2 mipmapTextureSize) {
	vec4 clampRect;
	uv = getMipUv(uv, lod, mipmapTextureSize, clampRect);
	return textureBicubic(tex, uv, mipmapTextureSize, clampRect);
}

vec4 lodMipmapSampleNearest (sampler2D tex, vec2 uv, float lod, vec2 mipmapTextureSize) {
	return texture2D(tex, getMipUv(uv, lod, mipmapTextureSize));
}

vec4 lodMipmapSampleCubic (sampler2D tex, vec2 uv, float lod, vec2 mipmapTextureSize) {
	float lodFloor = floor(lod);
	float lodCeil = lodFloor + 1.0;
	float lodFract = lod - lodFloor;

	vec4 loClamp, hiClamp;
	vec2 loUv = getMipUv(uv, lodFloor, mipmapTextureSize, loClamp);
	vec2 hiUv = getMipUv(uv, lodCeil, mipmapTextureSize, hiClamp);
	return mix(
		textureBicubic(tex, loUv, mipmapTextureSize, loClamp),
		textureBicubic(tex, hiUv, mipmapTextureSize, hiClamp),
		lodFract
	);
}

vec4 lodMipmapSample (sampler2D tex, vec2 uv, float lod, vec2 mipmapTextureSize) {
	float lodFloor = floor(lod);
	float lodCeil = lodFloor + 1.0;
	float lodFract = lod - lodFloor;
	return mix(
		texture2D(tex, getMipUv(uv, lodFloor, mipmapTextureSize)),
		texture2D(tex, getMipUv(uv, lodCeil, mipmapTextureSize)),
		lodFract
	);
}

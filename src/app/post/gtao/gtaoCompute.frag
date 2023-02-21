// https://github.com/gkjohnson/threejs-sandbox/tree/master/gtaoPass

#define PI	3.141592653589793
#define TWO_PI		6.2831853071795864
#define HALF_PI	1.5707963267948966
#define ONE_OVER_PI	0.3183098861837906
#define ENABLE_COLOR_BOUNCE

uniform sampler2D u_texture;
uniform sampler2D u_viewPositionDepthTexture;
uniform sampler2D u_normalTexture;

uniform float u_falloffStart;
uniform float u_falloffEnd;
uniform float u_radius;

uniform vec2 u_scaledTextureSize;
uniform vec4 u_clipInfo;
uniform float u_directionOffset;
uniform float u_stepOffset;
uniform float u_indirectLightIntensity;

varying vec2 v_uv;

float aacos (float x) {
	// return acos(x);
	float n = 1.0-step(0.0, x);
	x = abs(x);
	float ret = -0.0187293 * x + 0.0742610;
	ret = ret * x - 0.2121144;
	ret = ret * x + 1.5707288;
	ret = ret * sqrt(1.0-x);
	ret = ret * (1.0 - 2.0 * n);
	return n * 3.14159265358979 + ret;
}

vec2 aacos (vec2 x) {
	// return acos(x);
	vec2 n = 1.0-step(0.0, x);
	x = abs(x);
	vec2 ret = -0.0187293 * x + 0.0742610;
	ret = ret * x - 0.2121144;
	ret = ret * x + 1.5707288;
	ret = ret * sqrt(1.0-x);
	ret = ret * (1.0 - 2.0 * n);
	return n * 3.14159265358979 + ret;
}

float round( float f ) {
	return f < 0.5 ? floor( f ) : ceil( f );
}
vec2 round( vec2 v ) {
	v.x = round( v.x );
	v.y = round( v.y );
	return v;
}

float getFalloff( float dist2 ) {
	return 2.0 * clamp(
		( dist2 - u_falloffStart ) / ( u_falloffEnd - u_falloffStart ),
		0.0,
		1.0
	);
}

#include <getBlueNoise>

void main() {
	vec3 blueNoise = getBlueNoise(gl_FragCoord.xy);
	vec3 viewPosition = texture2D( u_viewPositionDepthTexture, v_uv ).xyz;
	vec3 viewNormal = normalize(( texture2D( u_normalTexture, v_uv ) ).xyz * 2.0 - 1.0);
	vec3 vdir = normalize( - viewPosition );
	vec3 dir, ws;
	// calculation uses left handed system
	viewNormal.z = - viewNormal.z;
	vec2 noises = vec2( 0.0 );
	vec2 offset;
	vec2 horizons = vec2( - 1.0, - 1.0 );
	// scale the search radius by the depth and camera FOV
	float radius = ( u_radius * u_clipInfo.z ) / viewPosition.z;
	radius = max( float( STEP_SAMPLES ), radius );
	float stepSize = radius / float( STEP_SAMPLES );
	float phi = 0.0;
	float ao = 0.0;
	// float currStep = 1.0 + 0.25 * stepSize * u_stepOffset;
	float dist2, invdist, falloff, cosh;
	#ifdef ENABLE_COLOR_BOUNCE
	vec3 color = vec3( 0.0 );
	#endif

	for ( int i = 0; i < ANGULAR_SAMPLES; i ++ ) {
		phi = (float( i ) + blueNoise.x) * ( PI / float( ANGULAR_SAMPLES ) ) + u_directionOffset * PI;
		// phi += blueNoise.x * PI * 0.5;
		float currStep = 1.0 + 0.5 * stepSize * u_stepOffset;

		currStep += blueNoise.y * stepSize;
		dir = vec3( cos( phi ), sin( phi ), 0.0 );
		horizons = vec2( - 1.0 );
		// calculate horizon angles
		for ( int j = 0; j < STEP_SAMPLES; ++ j ) {
			offset = round( dir.xy * currStep ) / u_scaledTextureSize;
			// h1
			ws = texture2D(u_viewPositionDepthTexture, v_uv + offset ).xyz - viewPosition;
			dist2 = dot( ws, ws );
			invdist = inversesqrt( dist2 );
			cosh = invdist * dot( ws, vdir );
			falloff = getFalloff( dist2 );
			horizons.x = max( horizons.x, cosh - falloff );
			#ifdef ENABLE_COLOR_BOUNCE
			vec3 ptColor, ptDir;
			float alpha, dist;
			ptColor = texture2D( u_texture, v_uv + offset ).rgb;
			dist = length( ws );
			ptDir = ws / dist;
			alpha = min(dist / u_radius, 1.0 );
			color += ptColor * clamp( dot( ptDir, viewNormal ), 0.0, 1.0 ) * pow( ( 1.0 - alpha ), 2.0 );
			#endif

			// h2
			ws = texture2D(u_viewPositionDepthTexture, v_uv - offset ).xyz - viewPosition;
			dist2 = dot( ws, ws );
			invdist = inversesqrt( dist2 );
			cosh = invdist * dot( ws, vdir );
			falloff = getFalloff( dist2 );
			horizons.y = max( horizons.y, cosh - falloff );
			// increment
			currStep += stepSize;
			#ifdef ENABLE_COLOR_BOUNCE
			ptColor = texture2D( u_texture, v_uv + offset ).rgb;
			dist = length( ws );
			ptDir = ws / dist;
			alpha = min(dist / u_radius, 1.0 );
			color += ptColor * clamp( dot( ptDir, viewNormal ), 0.0, 1.0 ) * pow( ( 1.0 - alpha ), 2.0 );
			#endif
		}
		horizons = aacos( horizons );
		// calculate gamma
		vec3 bitangent = normalize( cross( dir, vdir ) );
		vec3 tangent = cross( vdir, bitangent );
		vec3 nx = viewNormal - bitangent * dot( viewNormal, bitangent );
		float nnx = length( nx );
		float invnnx = 1.0 / ( nnx + 1e-6 );			// to avoid division with zero
		float cosxi = dot( nx, tangent ) * invnnx;	// xi = gamma + HALF_PI
		float gamma = aacos( cosxi ) - HALF_PI;
		float cosgamma = dot( nx, vdir ) * invnnx;
		float singamma2 = - 2.0 * cosxi;					// cos(x + HALF_PI) = -sin(x)
		// clamp to normal hemisphere
		horizons.x = gamma + max( - horizons.x - gamma, - HALF_PI );
		horizons.y = gamma + min( horizons.y - gamma, HALF_PI );
		// Riemann integral is additive
		ao += nnx * 0.25 * (
			( horizons.x * singamma2 + cosgamma - cos( 2.0 * horizons.x - gamma ) ) +
			( horizons.y * singamma2 + cosgamma - cos( 2.0 * horizons.y - gamma ) ) );
	}
	// PDF = 1 / pi and must normalize with pi because of Lambert
	ao = ao / float( ANGULAR_SAMPLES );
	#ifdef ENABLE_COLOR_BOUNCE
	color *= u_indirectLightIntensity / float( STEP_SAMPLES * ANGULAR_SAMPLES ) * 2.0;
	gl_FragColor = vec4( color, ao );
	#else
	gl_FragColor = vec4( 0.0, 0.0, 0.0, ao );
	#endif
	// gl_FragColor = texture2D(u_texture, v_uv);
	// gl_FragColor.rgb =  gl_FragColor.rgb * ao + color * u_indirectLightIntensity;
}

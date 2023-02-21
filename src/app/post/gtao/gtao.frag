uniform sampler2D u_texture;
uniform sampler2D u_colorBounceAoTexture;

#ifdef USE_BLUR
uniform sampler2D u_depthTexture;
uniform sampler2D u_viewPositionDepthTexture;
uniform sampler2D u_normalTexture;

uniform vec2 u_scaledTextureSize;
uniform vec2 u_resolution;
#endif

uniform float u_aoIntensity;

varying vec2 v_uv;

#define THRESHOLD 0.75
#define DEPTH_THRESHOLD 5e-1
#define BLUR_ITERATIONS 2
#define blurStride 1


vec3 MultiBounce( float ao, vec3 albedo ) {
	vec3 x = vec3( ao );
	vec3 a = 2.0404 * albedo - vec3( 0.3324 );
	vec3 b = -4.7951 * albedo + vec3( 0.6417 );
	vec3 c = 2.7552 * albedo + vec3( 0.6903 );
	return max( x, ( ( x * a + b ) * x + c ) * x );
}

void main () {
		vec4 color = texture2D( u_texture, v_uv );

		#ifdef USE_BLUR
		vec2 currTexel = v_uv * u_resolution;
		vec2 currAoTexel = v_uv * u_scaledTextureSize;
		// aoPixels per full size ones. Should be 1/2 at
		vec2 texelRatio = u_scaledTextureSize / u_resolution;
		vec3 currNormal = normalize( texture2D( u_normalTexture, v_uv ).xyz * 2.0 - 1.0 );
		float currDepth = texture2D( u_viewPositionDepthTexture, v_uv ).w;
		// TODO: pull this sampling out into a function
		vec4 accumSample = vec4( 0.0 );
		float totalWeight = 1e-10;
		float pixelOffset = - float( BLUR_ITERATIONS ) / 2.0;
		pixelOffset += mod( float( BLUR_ITERATIONS ), 2.0 ) == 0.0 ? 0.0 : 0.5;
		pixelOffset *= float( blurStride );

		for ( int x = 0; x < BLUR_ITERATIONS; x ++ ) {
			for ( int y = 0; y < BLUR_ITERATIONS; y ++ ) {
				vec2 fStep = vec2( float( x ), float( y ) ) * float( blurStride );
				// iterate over full res pixels
				vec2 offsetUv = currTexel + ( pixelOffset + fStep ) / texelRatio;
				offsetUv /= u_resolution;
				// get the associated pixel in the AO buffer
				vec2 aoUv = currAoTexel + pixelOffset + fStep;
				aoUv /= u_scaledTextureSize;
				// if the pixels are close enough in space then blur them together
				float offsetDepth = texture2D( u_viewPositionDepthTexture, offsetUv ).w;
				if ( abs( offsetDepth - currDepth ) <= DEPTH_THRESHOLD ) {
					// Weigh the sample based on normal similarity
					vec3 offsetNormal = normalize( texture2D( u_normalTexture, offsetUv ).xyz * 2.0 - 1.0 );
					float weight = max( 0.0, dot( offsetNormal, currNormal ) );
					// square the weight to give pixels with a closer normal even higher priority
					weight *= weight;
					// accumulate
					vec4 val = texture2D( u_colorBounceAoTexture, aoUv );
					accumSample += val * weight;
					totalWeight += weight;
				}
			}
		}

		accumSample /= totalWeight;
		#else
		vec4 accumSample = texture2D( u_colorBounceAoTexture, v_uv );
		#endif


		vec3 rgb = mix( color.rgb, color.rgb * MultiBounce( accumSample.a, color.rgb ), u_aoIntensity );
		float colorFade = ( 1.0 - pow( 1.0 - accumSample.a, 2.0 ) );
		gl_FragColor = vec4( rgb + accumSample.rgb * ( 0.75 + colorFade * 0.25 ), color.a );
}

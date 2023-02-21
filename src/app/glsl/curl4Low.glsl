#pragma glslify: snoise4 = require(./simplexNoiseDerivatives4)

vec3 curl( in vec3 p, in float noiseTime, in float persistence ) {

    vec4 xNoisePotentialDerivatives = vec4(0.0);
    vec4 yNoisePotentialDerivatives = vec4(0.0);
    vec4 zNoisePotentialDerivatives = vec4(0.0);


    xNoisePotentialDerivatives += snoise4(vec4(p, noiseTime)) * 0.5;
    yNoisePotentialDerivatives += snoise4(vec4((p + vec3(123.4, 129845.6, -1239.1)), noiseTime)) * 0.5;
    zNoisePotentialDerivatives += snoise4(vec4((p + vec3(-9519.0, 9051.0, -123.0)), noiseTime)) * 0.5;

    return vec3(
        zNoisePotentialDerivatives[1] - yNoisePotentialDerivatives[2],
        xNoisePotentialDerivatives[2] - zNoisePotentialDerivatives[0],
        yNoisePotentialDerivatives[0] - xNoisePotentialDerivatives[1]
    );

}

#pragma glslify: export(curl)

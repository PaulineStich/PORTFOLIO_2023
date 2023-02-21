
#if QUALITY == 0

// rings = 2
// points per ring = 5
const int kSampleCount = 16;
vec2 kDiskKernel[kSampleCount];

void initKernel () {
    kDiskKernel[0] = vec2(0.0,0.0);
    kDiskKernel[1] = vec2(0.54545456,0.0);
    kDiskKernel[2] = vec2(0.16855472,0.5187581);
    kDiskKernel[3] = vec2(-0.44128203,0.3206101);
    kDiskKernel[4] = vec2(-0.44128197,-0.3206102);
    kDiskKernel[5] = vec2(0.1685548,-0.5187581);
    kDiskKernel[6] = vec2(1.0,0.0);
    kDiskKernel[7] = vec2(0.809017,0.58778524);
    kDiskKernel[8] = vec2(0.30901697,0.95105654);
    kDiskKernel[9] = vec2(-0.30901703,0.9510565);
    kDiskKernel[10] = vec2(-0.80901706,0.5877852);
    kDiskKernel[11] = vec2(-1.0,0.0);
    kDiskKernel[12] = vec2(-0.80901694,-0.58778536);
    kDiskKernel[13] = vec2(-0.30901664,-0.9510566);
    kDiskKernel[14] = vec2(0.30901712,-0.9510565);
    kDiskKernel[15] = vec2(0.80901694,-0.5877853);
}

#endif

#if QUALITY == 1

// rings = 3
// points per ring = 7
const int kSampleCount = 22;
vec2 kDiskKernel[kSampleCount];

void initKernel () {
    kDiskKernel[0] = vec2(0.0,0.0);
    kDiskKernel[1] = vec2(0.53333336,0.0);
    kDiskKernel[2] = vec2(0.3325279,0.4169768);
    kDiskKernel[3] = vec2(-0.11867785,0.5199616);
    kDiskKernel[4] = vec2(-0.48051673,0.2314047);
    kDiskKernel[5] = vec2(-0.48051673,-0.23140468);
    kDiskKernel[6] = vec2(-0.11867763,-0.51996166);
    kDiskKernel[7] = vec2(0.33252785,-0.4169769);
    kDiskKernel[8] = vec2(1.0,0.0);
    kDiskKernel[9] = vec2(0.90096885,0.43388376);
    kDiskKernel[10] = vec2(0.6234898,0.7818315);
    kDiskKernel[11] = vec2(0.22252098,0.9749279);
    kDiskKernel[12] = vec2(-0.22252095,0.9749279);
    kDiskKernel[13] = vec2(-0.62349,0.7818314);
    kDiskKernel[14] = vec2(-0.90096885,0.43388382);
    kDiskKernel[15] = vec2(-1.0,0.0);
    kDiskKernel[16] = vec2(-0.90096885,-0.43388376);
    kDiskKernel[17] = vec2(-0.6234896,-0.7818316);
    kDiskKernel[18] = vec2(-0.22252055,-0.974928);
    kDiskKernel[19] = vec2(0.2225215,-0.9749278);
    kDiskKernel[20] = vec2(0.6234897,-0.7818316);
    kDiskKernel[21] = vec2(0.90096885,-0.43388376);
}

#endif

#if QUALITY == 2

// rings = 4
// points per ring = 7
const int kSampleCount = 43;
vec2 kDiskKernel[kSampleCount];

void initKernel () {
    kDiskKernel[0] = vec2(0.0,0.0);
    kDiskKernel[1] = vec2(0.36363637,0.0);
    kDiskKernel[2] = vec2(0.22672357,0.28430238);
    kDiskKernel[3] = vec2(-0.08091671,0.35451925);
    kDiskKernel[4] = vec2(-0.32762504,0.15777594);
    kDiskKernel[5] = vec2(-0.32762504,-0.15777591);
    kDiskKernel[6] = vec2(-0.08091656,-0.35451928);
    kDiskKernel[7] = vec2(0.22672352,-0.2843024);
    kDiskKernel[8] = vec2(0.6818182,0.0);
    kDiskKernel[9] = vec2(0.614297,0.29582983);
    kDiskKernel[10] = vec2(0.42510667,0.5330669);
    kDiskKernel[11] = vec2(0.15171885,0.6647236);
    kDiskKernel[12] = vec2(-0.15171883,0.6647236);
    kDiskKernel[13] = vec2(-0.4251068,0.53306687);
    kDiskKernel[14] = vec2(-0.614297,0.29582986);
    kDiskKernel[15] = vec2(-0.6818182,0);
    kDiskKernel[16] = vec2(-0.614297,-0.29582983);
    kDiskKernel[17] = vec2(-0.42510656,-0.53306705);
    kDiskKernel[18] = vec2(-0.15171856,-0.66472363);
    kDiskKernel[19] = vec2(0.1517192,-0.6647235);
    kDiskKernel[20] = vec2(0.4251066,-0.53306705);
    kDiskKernel[21] = vec2(0.614297,-0.29582983);
    kDiskKernel[22] = vec2(1.0,0.0);
    kDiskKernel[23] = vec2(0.9555728,0.2947552);
    kDiskKernel[24] = vec2(0.82623875,0.5633201);
    kDiskKernel[25] = vec2(0.6234898,0.7818315);
    kDiskKernel[26] = vec2(0.36534098,0.93087375);
    kDiskKernel[27] = vec2(0.07473,0.9972038);
    kDiskKernel[28] = vec2(-0.22252095,0.9749279);
    kDiskKernel[29] = vec2(-0.50000006,0.8660254);
    kDiskKernel[30] = vec2(-0.73305196,0.6801727);
    kDiskKernel[31] = vec2(-0.90096885,0.43388382);
    kDiskKernel[32] = vec2(-0.98883086,0.14904208);
    kDiskKernel[33] = vec2(-0.9888308,-0.14904249);
    kDiskKernel[34] = vec2(-0.90096885,-0.43388376);
    kDiskKernel[35] = vec2(-0.73305184,-0.6801728);
    kDiskKernel[36] = vec2(-0.4999999,-0.86602545);
    kDiskKernel[37] = vec2(-0.222521,-0.9749279);
    kDiskKernel[38] = vec2(0.07473029,-0.99720377);
    kDiskKernel[39] = vec2(0.36534148,-0.9308736);
    kDiskKernel[40] = vec2(0.6234897,-0.7818316);
    kDiskKernel[41] = vec2(0.8262388,-0.56332);
    kDiskKernel[42] = vec2(0.9555729,-0.29475483);
}

#endif

#if QUALITY == 3

// rings = 5
// points per ring = 7
const int kSampleCount = 71;
vec2 kDiskKernel[kSampleCount];

void initKernel () {
    kDiskKernel[0] = vec2(0,0);
    kDiskKernel[1] = vec2(0.2758621,0.0);
    kDiskKernel[2] = vec2(0.1719972,0.21567768);
    kDiskKernel[3] = vec2(-0.061385095,0.26894566);
    kDiskKernel[4] = vec2(-0.24854316,0.1196921);
    kDiskKernel[5] = vec2(-0.24854316,-0.11969208);
    kDiskKernel[6] = vec2(-0.061384983,-0.2689457);
    kDiskKernel[7] = vec2(0.17199717,-0.21567771);
    kDiskKernel[8] = vec2(0.51724136,0.0);
    kDiskKernel[9] = vec2(0.46601835,0.22442262);
    kDiskKernel[10] = vec2(0.32249472,0.40439558);
    kDiskKernel[11] = vec2(0.11509705,0.50427306);
    kDiskKernel[12] = vec2(-0.11509704,0.50427306);
    kDiskKernel[13] = vec2(-0.3224948,0.40439552);
    kDiskKernel[14] = vec2(-0.46601835,0.22442265);
    kDiskKernel[15] = vec2(-0.51724136,0.0);
    kDiskKernel[16] = vec2(-0.46601835,-0.22442262);
    kDiskKernel[17] = vec2(-0.32249463,-0.40439564);
    kDiskKernel[18] = vec2(-0.11509683,-0.5042731);
    kDiskKernel[19] = vec2(0.11509732,-0.504273);
    kDiskKernel[20] = vec2(0.32249466,-0.40439564);
    kDiskKernel[21] = vec2(0.46601835,-0.22442262);
    kDiskKernel[22] = vec2(0.7586207,0.0);
    kDiskKernel[23] = vec2(0.7249173,0.22360738);
    kDiskKernel[24] = vec2(0.6268018,0.4273463);
    kDiskKernel[25] = vec2(0.47299224,0.59311354);
    kDiskKernel[26] = vec2(0.27715522,0.7061801);
    kDiskKernel[27] = vec2(0.056691725,0.75649947);
    kDiskKernel[28] = vec2(-0.168809,0.7396005);
    kDiskKernel[29] = vec2(-0.3793104,0.65698475);
    kDiskKernel[30] = vec2(-0.55610836,0.51599306);
    kDiskKernel[31] = vec2(-0.6834936,0.32915324);
    kDiskKernel[32] = vec2(-0.7501475,0.113066405);
    kDiskKernel[33] = vec2(-0.7501475,-0.11306671);
    kDiskKernel[34] = vec2(-0.6834936,-0.32915318);
    kDiskKernel[35] = vec2(-0.5561083,-0.5159932);
    kDiskKernel[36] = vec2(-0.37931028,-0.6569848);
    kDiskKernel[37] = vec2(-0.16880904,-0.7396005);
    kDiskKernel[38] = vec2(0.056691945,-0.7564994);
    kDiskKernel[39] = vec2(0.2771556,-0.7061799);
    kDiskKernel[40] = vec2(0.47299215,-0.59311366);
    kDiskKernel[41] = vec2(0.62680185,-0.4273462);
    kDiskKernel[42] = vec2(0.72491735,-0.22360711);
    kDiskKernel[43] = vec2(1.0,0.0);
    kDiskKernel[44] = vec2(0.9749279,0.22252093);
    kDiskKernel[45] = vec2(0.90096885,0.43388376);
    kDiskKernel[46] = vec2(0.7818315,0.6234898);
    kDiskKernel[47] = vec2(0.6234898,0.7818315);
    kDiskKernel[48] = vec2(0.43388364,0.9009689);
    kDiskKernel[49] = vec2(0.22252098,0.9749279);
    kDiskKernel[50] = vec2(0.0,1.0);
    kDiskKernel[51] = vec2(-0.22252095,0.9749279);
    kDiskKernel[52] = vec2(-0.43388385,0.90096885);
    kDiskKernel[53] = vec2(-0.62349,0.7818314);
    kDiskKernel[54] = vec2(-0.7818317,0.62348956);
    kDiskKernel[55] = vec2(-0.90096885,0.43388382);
    kDiskKernel[56] = vec2(-0.9749279,0.22252093);
    kDiskKernel[57] = vec2(-1.0,0.0);
    kDiskKernel[58] = vec2(-0.9749279,-0.22252087);
    kDiskKernel[59] = vec2(-0.90096885,-0.43388376);
    kDiskKernel[60] = vec2(-0.7818314,-0.6234899);
    kDiskKernel[61] = vec2(-0.6234896,-0.7818316);
    kDiskKernel[62] = vec2(-0.43388346,-0.900969);
    kDiskKernel[63] = vec2(-0.22252055,-0.974928);
    kDiskKernel[64] = vec2(0.0,-1.0);
    kDiskKernel[65] = vec2(0.2225215,-0.9749278);
    kDiskKernel[66] = vec2(0.4338835,-0.90096897);
    kDiskKernel[67] = vec2(0.6234897,-0.7818316);
    kDiskKernel[68] = vec2(0.78183144,-0.62348986);
    kDiskKernel[69] = vec2(0.90096885,-0.43388376);
    kDiskKernel[70] = vec2(0.9749279,-0.22252086);
}

#endif

uniform sampler2D u_cocTexture;
uniform vec2 u_cocTexelSize;

// Camera parameters
uniform float u_rcpAspect;
uniform float u_maxCoC;
// uniform float u_rcpMaxCoC;

varying vec2 v_uv;

void main () {
	initKernel();

	vec4 samp0 = texture2D(u_cocTexture, v_uv);
    #ifndef USE_FLOAT
    samp0 = samp0 * 2.0 - 1.0;
    samp0 = sign(samp0) * samp0 * samp0;
    #endif

    vec4 bgAcc = vec4(0.0); // Background: far field bokeh
    vec4 fgAcc = vec4(0.0); // Foreground: near field bokeh

    for (int si = 0; si < kSampleCount; si++) {
        vec2 disp = kDiskKernel[si] * u_maxCoC;
        float dist = length(disp);

        vec2 duv = vec2(disp.x * u_rcpAspect, disp.y);
        vec4 samp = texture2D(u_cocTexture, v_uv + duv);
        #ifndef USE_FLOAT
        samp = samp * 2.0 - 1.0;
        samp = sign(samp) * samp * samp;
        #endif

        // BG: Compare CoC of the current sample and the center sample
        // and select smaller one.
        float bgCoC = max(min(samp0.a, samp.a), 0.0);

        // Compare the CoC to the sample distance.
        // Add a small margin to smooth out.
        float margin = u_cocTexelSize.y * 2.0;
        float bgWeight = clamp((bgCoC   - dist + margin) / margin, 0.0, 1.0);
        float fgWeight = clamp((-samp.a - dist + margin) / margin, 0.0, 1.0);

        // Cut influence from focused areas because they're darkened by CoC
        // premultiplying. This is only needed for near field.
        fgWeight *= step(u_cocTexelSize.y, -samp.a);

        // Accumulation
        bgAcc += vec4(samp.rgb, 1.0) * bgWeight;
        fgAcc += vec4(samp.rgb, 1.0) * fgWeight;
    }

    // Get the weighted average.
    // bgAcc.rgb /= bgAcc.a + (bgAcc.a == 0); // zero-div guard
    // fgAcc.rgb /= fgAcc.a + (fgAcc.a == 0);
    bgAcc.rgb /= bgAcc.a + step(bgAcc.a, 0.0); // zero-div guard
    fgAcc.rgb /= fgAcc.a + step(fgAcc.a, 0.0);

    // BG: Calculate the alpha value only based on the center CoC.
    // This is a rather aggressive approximation but provides stable results.
    bgAcc.a = smoothstep(u_cocTexelSize.y, u_cocTexelSize.y * 2.0, samp0.a);

    // FG: Normalize the total of the weights.
    fgAcc.a *= 3.14159265359 / float(kSampleCount);

    // Alpha premultiplying
    vec3 rgb = vec3(0.0);
    rgb = mix(rgb, bgAcc.rgb, clamp(bgAcc.a, 0.0, 1.0));
    rgb = mix(rgb, fgAcc.rgb, clamp(fgAcc.a, 0.0, 1.0));

    // Combined alpha value
    float alpha = (1.0 - clamp(bgAcc.a, 0.0, 1.0)) * (1.0 - clamp(fgAcc.a, 0.0, 1.0));

    gl_FragColor = vec4(rgb, alpha);
}
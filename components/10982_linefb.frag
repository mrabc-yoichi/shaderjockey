#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D backbuffer;
#define pi 3.141592653589793238462643383279
#define pi_inv 0.318309886183790671537767526745
#define pi2_inv 0.159154943091895335768883763372

uniform float inputval1;

/// bipolar complex by @Flexi23
/// "logarithmic zoom with a spiral twist and a division by zero in the complex number plane." (from https://www.shadertoy.com/view/4ss3DB)

vec2 complex_mul(vec2 factorA, vec2 factorB){
  return vec2( factorA.x*factorB.x - factorA.y*factorB.y, factorA.x*factorB.y + factorA.y*factorB.x);
}

vec2 complex_div(vec2 numerator, vec2 denominator){
   return vec2( numerator.x*denominator.x + numerator.y*denominator.y,
                numerator.y*denominator.x - numerator.x*denominator.y)/
          vec2(denominator.x*denominator.x + denominator.y*denominator.y);
}

vec2 wrap_flip(vec2 uv){
	return vec2(1.)-abs(fract(uv*.5)*2.-1.);
}
 
float border(vec2 domain, float thickness){
   vec2 uv = fract(domain-vec2(0.5));
   uv = min(uv,1.-uv)*2.;
   return clamp(max(uv.x,uv.y)-1.+thickness,0.,1.)/(thickness);
}

float circle(vec2 uv, vec2 aspect, float scale){
	return clamp( 1. - length((uv-0.5)*aspect*scale), 0., 1.);
}

float sigmoid(float x) {
	return 2./(1. + exp2(-x)) - 1.;
}

float smoothcircle(vec2 uv, vec2 center, vec2 aspect, float radius, float sharpness){
	return 0.5 - sigmoid( ( length( (uv - center) * aspect) - radius) * sharpness) * 0.5;
}

float lum(vec3 color){
	return dot(vec3(0.30, 0.59, 0.11), color);
}

vec2 spiralzoom(vec2 domain, vec2 center, float n, float spiral_factor, float zoom_factor, vec2 pos){
	vec2 uv = domain - center;
	float angle = atan(uv.y, uv.x);
	float d = length(uv);
	return vec2( angle*n*pi2_inv + log(d)*spiral_factor*0., -log(d)*zoom_factor + 0.*n*angle*pi2_inv) + pos;
}

vec2 mobius(vec2 domain, vec2 zero_pos, vec2 asymptote_pos){
	return complex_div( domain - zero_pos, domain - asymptote_pos);
}

/// basically just a lookup from a texture with GL_LINEAR (instead of the active GL_NEAREST method for the backbuffer) resembled in shader code - surely not very efficient, but hey it looks much better and works on Float32 textures too!
vec4 bilinear(sampler2D sampler, vec2 uv, vec2 resolution){
	vec2 pixelsize = 1./resolution;
	vec2 pixel = uv * resolution;
	vec2 d = pixel - floor(pixel) + 0.5;
	pixel = (pixel - d)*pixelsize;
	
	vec2 h = vec2( pixel.x, pixel.x + pixelsize.x);
	if(d.x < 0.5)
		h = vec2( pixel.x, pixel.x - pixelsize.x);
	
	vec2 v = vec2( pixel.y, pixel.y + pixelsize.y);
	if(d.y < 0.5)
		v = vec2( pixel.y, pixel.y - pixelsize.y);
	
	vec4 lowerleft = texture2D(sampler, vec2(h.x, v.x));
	vec4 upperleft = texture2D(sampler, vec2(h.x, v.y));
	vec4 lowerright = texture2D(sampler, vec2(h.y, v.x));
	vec4 upperright = texture2D(sampler, vec2(h.y, v.y));
	
	d = abs(d - 0.5);
	
	return mix( mix( lowerleft, lowerright, d.x), mix( upperleft, upperright, d.x),	d.y);
}

void main(void)
{
	// domain map
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	
	// aspect-ratio correction
	vec2 aspect = vec2(1.,resolution.y/resolution.x);
	vec2 uv_correct = 0.5 + (uv -0.5)/ aspect.yx;
	vec2 mouse_correct = 0.5 + ( mouse.xy / resolution.xy - 0.5) / aspect.yx;
		
	float phase = time*0. + pi*1.;
	float dist = 0.68;
	vec2 uv_bipolar = mobius(uv_correct, vec2(0.5 - dist*0.5, 0.5), vec2(0.5 + dist*0.5, 0.5));
	uv_bipolar = spiralzoom(uv_bipolar, vec2(0.), 10., 0.5, 1.0, mouse.yx*vec2(-1.,1.)*10.);
	uv_bipolar = vec2(-uv_bipolar.y,uv_bipolar.x); // 90° rotation 
	
	vec2 uv_trace = wrap_flip(uv_bipolar);

	float amnt = 0.0;
	float nd = 0.0;
	vec4 cbuff = vec4(0.0);

	for(float i=0.0; i<5.0;i++){
	nd =sin(3.14*0.8*uv_trace.x + (i*0.8+sin(+time)*0.3) + time)*0.7+0.5 + uv_trace.x;
	amnt = 1.0/abs(nd-uv_trace.y)*0.01; 
	
	cbuff += vec4(amnt, amnt*0.3 , amnt*uv_trace.y, 1.0);
	}
	
	//float foo = 0.86;
	float foo = 0.5 + inputval1;
	float bar = 4./256.;
	float baz = 1.1;
	float w = -pi/12.;
	vec2 rot = vec2( cos(w), sin(w));
	vec2 drop = 0.5 + complex_mul((uv - 0.5)*aspect, rot)*baz/aspect;
	
	vec4 dbuff =  bilinear(backbuffer,drop, resolution)*foo - bar;
 
	gl_FragColor = mix(cbuff, vec4(1),  dbuff * (1. - float(uv.x < 0.05 ||uv.x > 0.95 || uv.y < 0.05 ||uv.y > 0.95 )));
	gl_FragColor.w = 1.;
}

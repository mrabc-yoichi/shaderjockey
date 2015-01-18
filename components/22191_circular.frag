#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float inputval1;
varying vec2 surfacePosition;
#define PI 3.1415926535897932384626433832795

#define time time*4e-1 + length(surfacePosition) + cos(atan(surfacePosition.x,surfacePosition.y)*6.)

void main( void ) {
	mouse;
	vec2 p = surfacePosition*(30.0-inputval1) ;

	float r = length(p);
	float rc= floor(r+.5);
	float t=rc*time*0.05;
	mat2 m = mat2(cos(t),sin(t),-sin(t),cos(t));
	p*=m;
	
	float a = atan(p.y,p.x);

	float nc= (rc*2.*PI);
	float ax= (PI*2.)/nc;
	
	float ac= ((a/ax)+0.5)*ax;
	vec2 cc = vec2(cos(ac)*rc,sin(ac)*rc);
	
	vec3 color = vec3(0);
//	if( length( p-cc ) < 0.3+0.*sin(time))
		color = vec3(cc.y, cc.x + ax, ax * 4.);
	
	gl_FragColor = vec4( color, 1.0 );

}
// Endless Tunnel
// By: Brandon Fogerty
// bfogerty at gmail dot com

#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float inputval1;

vec3 checkerBoard( vec2 uv, vec2 pp )
{
    vec2 p = floor( uv * 4.6 );
    float t = mod( p.x + p.y, 2.2);
    vec3 c = vec3(t+pp.x, t+pp.y, t+(pp.x*pp.y));

    return c;
}

vec3 tunnel( vec2 p, float scrollSpeed, float rotateSpeed )
{    
    float a = (2.0 + inputval1) * atan( p.x, p.y  );
    float po = 2.0;
    float px = pow( p.x*p.x, po );
    float py = pow( p.y*p.y, po );
    float r = pow( px + py, 1.0/(2.0*po) );    
    vec2 uvp = vec2( 1.0/r + (time*scrollSpeed), a + (time*rotateSpeed));	
    vec3 finalColor = checkerBoard( uvp, p ).xyz;
    finalColor *= r;

    return finalColor;
}

void main(void)
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float timeSpeedX = time * 0.3;
    float timeSpeedY = time * 0.2;
    vec2 p = uv + vec2( -0.50+cos(timeSpeedX)*0.2, -0.5-sin(timeSpeedY)*0.3 );

    vec3 finalColor = tunnel( p , 1.0, 0.0);


    timeSpeedX = time * 0.30001;
    timeSpeedY = time * 0.20001;
    p = uv + vec2( -0.50+cos(timeSpeedX)*0.2, -0.5-sin(timeSpeedY)*0.3 );
    
    float ts = sin( time  ) * 0.5 + 0.5;
	
    float f = 0.7;
    finalColor += tunnel( p , 2.0, sin(time*0.01)) * step(f, ts) * ((ts-f)/(1.0-f)) * 0.5;
	
    gl_FragColor = vec4( finalColor, 1.0 );
}
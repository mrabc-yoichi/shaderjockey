#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float inputval1;


float hex( vec2 p, vec2 h )
{
	vec2 q = abs(p);
	return max(q.x-h.y,max(q.x+q.y*2.7735,q.y*1.1547)-h.x);
}

float map(vec3 p)
{
	float h = -abs(p.y)+0.7;

	float scale = max(1.0, min(abs(p.y)*0.5, 1.2));
	vec2 grid = vec2(0.692, 0.4) * scale + inputval1;
	float radius = 0.22 * scale;

	vec2 p1 = mod(p.xz, grid) - grid*vec2(0.5);
	float c1 = hex(p1, vec2(radius));

	vec2 p2 = mod(p.xz+grid*0.5, grid) - grid*vec2(0.5);
	float c2 = hex(p2, vec2(radius));
	
	float hexd = min(c1, c2);
	h += max(hexd, -0.005)*0.75;
	
	//return max(h, min(c1, c2));
	return h;
}

vec3 guess_normal(vec3 p)
{
	const float d = 0.01;
	return normalize( vec3(
		map(p+vec3(  d,0.0,0.0))-map(p+vec3( -d,0.0,0.0)),
		map(p+vec3(0.0,  d,0.0))-map(p+vec3(0.0, -d,0.0)),
		map(p+vec3(0.0,0.0,  d))-map(p+vec3(0.0,0.0, -d)) ));
}

float saturate(float a)
{
	return clamp(a, 0.0, 1.0);
}

void main( void ) {
	mouse;
	vec2 pos = (gl_FragCoord.xy*2.0 - resolution.xy) / resolution.y;
	float ct = time * 0.1;
	vec3 camPos = vec3(5.0*cos(ct), 0.05, 5.0*sin(ct));
	vec3 camDir = normalize(vec3(-camPos.x, -0.5, -camPos.z));
	
	vec3 camUp  = normalize(vec3(0.4, 1.0, 0.0));
	vec3 camSide = cross(camDir, camUp);
	float focus = 1.8;
	
	vec3 rayDir = normalize(camSide*pos.x + camUp*pos.y + camDir*focus);
	vec3 ray = camPos;
	float m = 0.0;
	float d = 0.0, total_d = 0.0;
	const int MAX_MARCH = 100;
	const float MAX_DISTANCE = 100.0;
	for(int i=0; i<MAX_MARCH; ++i) {
		d = map(ray);
		total_d += d;
		ray += rayDir * d;
		m += 1.0;
		if(d<0.001) { break; }
		if(total_d>MAX_DISTANCE) { break; }
	}
	
	vec3 normal = guess_normal(ray);
	
	float r = mod(time*2.0, 20.0);
	float glow = max((mod(length(ray.xz)-time*3.0, 12.0)-9.0)/2.5, 0.0);
	vec3 gp = abs(mod(ray, vec3(0.4)));
	if(abs(ray.y)<=0.70) {
		glow = 0.0;
	}
	glow += -abs(dot(camDir, normal))*0.2;
	
	float c = (total_d)*0.025;
	vec4 result = max(vec4( vec3(c, c, c) + vec3(0.02, 0.02, 0.025)*m*0.33, 1.0 ), vec4(0.0));
	//result.xyz = abs(normal);
	result.xyz += vec3(glow*2.5, glow*2.5, glow*2.5);
	gl_FragColor = result;
}
	
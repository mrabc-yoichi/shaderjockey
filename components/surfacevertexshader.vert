attribute vec3 position;
varying vec2 surfacePosition;
uniform vec2 resolution;
void main() {
	mat4 trnsmat= mat4(1., 0., 0., 0., 0., resolution.y/resolution.x, 0., 0., 0., 0., 1., 0., 0., 0., 0., 1.);
	trnsmat = trnsmat*0.5;
	surfacePosition= (vec4(position, 1.0) * trnsmat).xy;
	gl_Position = vec4( position, 1.0 );
}

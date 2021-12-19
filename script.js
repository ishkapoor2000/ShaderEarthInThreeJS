const globeCanvas = document.getElementById("globe_canvas");
const _VS = `
varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
	vertexUV = uv;
	vertexNormal = normalize(normalMatrix * normal);

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const _FS = `
uniform sampler2D globeTexture;
varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
	float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));
	vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);

	gl_FragColor = vec4(atmosphere + texture2D(globeTexture, vertexUV).xyz, 1.0);
}
`;

const _AtmosphereVS = `
varying vec3 vertexNormal;

void main() {
	vertexNormal = normalize(normalMatrix * normal);

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 0.9);
}
`;
const _AtmosphereFS = `
varying vec3 vertexNormal;

void main() {
	float intensity = pow(0.6 - dot(vertexNormal, vec3(0.0, 0.0, 1.0)), 2.0);
	gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
}
`;

const mouse = {
	x: undefined,
	y: undefined
}
const scene = new THREE.Scene();

// The camera
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: globeCanvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio)
// document.body.appendChild(renderer.domElement);
scene.fog = new THREE.Fog(0x545ef3, 400, 2000);

const earthTexture = new THREE.TextureLoader().load("./images/earth.jpg");

const sphere = new THREE.Mesh(new THREE.SphereGeometry(5, 50, 50),
	new THREE.ShaderMaterial({
		vertexShader: _VS,
		fragmentShader: _FS,
		uniforms: {
			globeTexture: {
				value: earthTexture
			}
		}
	}))

const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(5, 50, 50),
	new THREE.ShaderMaterial({
		vertexShader: _AtmosphereVS,
		fragmentShader: _AtmosphereFS,
		blending: THREE.AdaptiveBlending,
		side: THREE.BackSide
	}))
atmosphere.scale.set(1.1, 1.1, 1.1);
scene.add(atmosphere);

const group = new THREE.Group()
group.add(sphere);
scene.add(group)

const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({
	color: 0xffffff
})
const starVertices = []
for (let i = 0; i < 10000; i++) {
	const x = (Math.random() - 0.5) * 2000
	const y = (Math.random() - 0.5) * 2000
	const z = -Math.random() * 3000
	starVertices.push(x, y, z)
}
starGeometry.addAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

camera.position.z = 15;

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	sphere.rotation.y += 0.005;
	gsap.to(group.rotation, {
		x: (-mouse.y * 0.3),
		y: mouse.x * 0.5,
		duration: 2
	})
}

animate();


addEventListener('mousemove', () => {
	mouse.x = (event.clientX / innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / innerHeight) * 2 + 1;
})
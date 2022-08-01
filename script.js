const timeline = [
    {
        "start": 0,
        "end": 20,
        "video": "a.mp4"
    },
    {
        "start": 20,
        "end": 85,
        "video": "b.mp4"
    },
    {
        "start": 85,
        "end": 122,
        "video": "c.mp4"
    },
    {
        "start": 122,
        "end": 175,
        "video": "d.mp4"
    },
    {
        "start": 175,
        "end": 236,
        "video": "e.mp4"
    },
    {
        "start": 236,
        "end": 300,
        "video": "f.mp4"
    },
    {
        "start": 300,
        "end": 372,
        "video": "g.mp4"
    },
    {
        "start": 372,
        "end": 444,
        "video": "a.mp4"
    },
    {
        "start": 444,
        "end": 450,
        "video": "h.mp4"
    },
    {
        "start": 450,
        "end": 516,
        "video": "g.mp4"
    }
]

currentIndex = 0;
const bgm = document.getElementById("bgm");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(80, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerHeight, window.innerHeight);
renderer.domElement.id = "three";
let domElement = renderer.domElement;
document.body.appendChild(renderer.domElement);

const listener = new THREE.AudioListener();
camera.add(listener);
const audio = new THREE.Audio(listener);
const track = audio.setMediaElementSource(bgm);
const analyser = new THREE.AudioAnalyser(track, 32);
console.log(analyser)

const light = new THREE.PointLight(0xffffff, 1, 100, 0.1);
light.position.set(-3, 0, 20);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xa4caed, 1);
scene.add(directionalLight);
let video = document.getElementById("video");
let videoTexture = new THREE.VideoTexture(video);
// let playing = false;

function playPause() {
    if (bgm.paused) {bgm.play(); video.play();}
    else {bgm.pause(); video.pause();}
}

const geometry = new THREE.SphereGeometry(5,128,64);


const count = geometry.attributes.position.count;
const position_clone = JSON.parse(JSON.stringify(geometry.attributes.position.array));
const normals_clone = JSON.parse(JSON.stringify(geometry.attributes.normal.array));
// let damping = 0.1;

console.log(count);



const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


const material = new THREE.MeshStandardMaterial(
    {
        map: videoTexture,
        side: THREE.FrontSide,
        toneMapped: true
    }
);

// const material = new THREE.MeshBasicMaterial( {color: 0xf00000} )

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.rotation.x = 0.05*Math.PI;


let now = 0;
camera.position.z = 10;
function animate() {
    // const now = Date.now() / 300;
    
    const rms = analyser.getAverageFrequency();
    const damping = rms / 400;
    now += 0.5 * damping;
    if (!bgm.paused) {
        for (let i = 0; i < count; i++) {
            const ux = geometry.attributes.uv.getX(i) * Math.PI * 16;
            const uy = geometry.attributes.uv.getY(i) * Math.PI * 16;

            const xangle = (ux + now);
            const xsin = Math.sin(xangle) * damping;
            const yangle = (uy + now);
            const ycos = Math.cos(yangle) * damping;

            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            geometry.attributes.position.setX(i, position_clone[ix] + normals_clone[ix] * (xsin + ycos));
            geometry.attributes.position.setY(i, position_clone[iy] + normals_clone[iy] * (xsin + ycos));
            geometry.attributes.position.setZ(i, position_clone[iz] + normals_clone[iz] * (xsin + ycos));
        }
        geometry.computeVertexNormals();
        geometry.attributes.position.needsUpdate = true;
        document.body.style.cursor = "pointer";
        domElement.style.transform = "scale(1.05)";
        cube.rotation.z += damping / 75;
    }

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(cube);
    if (intersects.length != 0) {
        
        domElement.addEventListener("mousedown", playPause);
    } else {
        document.body.style.cursor = "default";
        domElement.style.transform = "scale(1)";
        domElement.removeEventListener("mousedown", playPause);
    }
        
        // cube.rotation.y += 0.01;
    // }
    requestAnimationFrame(animate);
    renderer.setClearColor(0xffffff, 0);
    renderer.render(scene, camera);
}
animate();
renderer.domElement.addEventListener('pointermove', (e) => {

    pointer.x = ((e.clientX - window.innerWidth * 0.05) / window.innerHeight) * 2 - 1;
    pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
});




let left = document.getElementById("left")
left.style.top = window.innerHeight * 0.36 + window.innerWidth * 0.05 + "px";
let right = document.getElementById("right")
right.style.top = window.innerHeight * 0.36 + window.innerWidth * 0.05 + "px";
right.style.right = window.innerWidth * 0.85 - window.innerHeight * 0.8 + "px";

setInterval(() => {
    if (bgm.currentTime > timeline[currentIndex].end) {
        currentIndex = (currentIndex + 1) % timeline.length;
        video.src = `videos/${timeline[currentIndex].video}`;
    }
    if (bgm.currentTime < timeline[currentIndex].start) {
        currentIndex = (currentIndex - 1) % timeline.length;
        video.src = `videos/${timeline[currentIndex].video}`;
    }
    
    // console.log("t: ", bgm.currentTime);
    // console.log("i: ", currentIndex);
}, 500);

function traverse(e) {
    if (bgm.paused) bgm.play();
    if (e.id == "left") {
        currentIndex = (currentIndex - 1) % timeline.length;
        if (currentIndex < 0) currentIndex += timeline.length;
        bgm.currentTime = timeline[currentIndex].start;
        video.src = `videos/${timeline[currentIndex].video}`;
    } else {
        currentIndex = (currentIndex + 1) % timeline.length;
        bgm.currentTime = timeline[currentIndex].start;
        video.src = `videos/${timeline[currentIndex].video}`;
    }
    console.log(currentIndex);
}
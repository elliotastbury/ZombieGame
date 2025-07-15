// Basic Three.js FPS setup
let scene, camera, renderer;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = { x: 0, z: 0 };
const speed = 0.1;

// Jumping
let isJumping = false;
let jumpVelocity = 0;
const gravity = 0.01;
const jumpStrength = 0.25;

// Baddies
let baddies = [];
let enemyBullets = [];
let playerHealth = 5;
let bullets = [];
const BULLET_SPEED = 0.5;
const BAD_GUY_HEALTH = 5;
// Arm geometries and material
const upperArmGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.32, 8);
const lowerArmGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.26, 8);
const handGeo = new THREE.BoxGeometry(0.11, 0.09, 0.13);
const armMat = new THREE.MeshBasicMaterial({ color: 0xffe0bd });

function createBaddie(x, z) {
    // Zombie baddie: green skin, sunken eyes, ragged clothes, hunched posture
    const group = new THREE.Group();
    // Torso (ragged, hunched)
    const torsoGeo = new THREE.BoxGeometry(0.45, 0.6, 0.25);
    const torsoMat = new THREE.MeshBasicMaterial({ color: 0x556B2F }); // dark olive green
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.set(0, 0.8, 0);
    torso.rotation.x = -0.18; // hunched
    group.add(torso);
    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 8);
    const neckMat = new THREE.MeshBasicMaterial({ color: 0x99cc99 }); // pale green
    const neck = new THREE.Mesh(neckGeo, neckMat);
    neck.position.set(0, 1.18, 0);
    group.add(neck);
    // Head (green, sunken eyes)
    const headGeo = new THREE.SphereGeometry(0.23, 12, 12);
    const headMat = new THREE.MeshBasicMaterial({ color: 0x99cc99 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 1.38, 0);
    // Add sunken eyes (black spheres)
    const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.07, 1.43, 0.16);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.07, 1.43, 0.16);
    group.add(head);
    group.add(leftEye);
    group.add(rightEye);
    // Left arm (outstretched, ragged)
    const leftShoulder = new THREE.Object3D();
    leftShoulder.position.set(-0.25, 1.08, 0.08);
    group.add(leftShoulder);
    const leftUpperArm = new THREE.Mesh(upperArmGeo, new THREE.MeshBasicMaterial({ color: 0x99cc99 }));
    leftUpperArm.position.set(0, -0.16, 0);
    leftUpperArm.rotation.x = -0.7; // outstretched forward
    leftShoulder.add(leftUpperArm);
    const leftElbow = new THREE.Object3D();
    leftElbow.position.set(0, -0.16, 0);
    leftUpperArm.add(leftElbow);
    const leftLowerArm = new THREE.Mesh(lowerArmGeo, new THREE.MeshBasicMaterial({ color: 0x99cc99 }));
    leftLowerArm.position.set(0, -0.14, 0);
    leftLowerArm.rotation.x = -0.5;
    leftElbow.add(leftLowerArm);
    const leftHand = new THREE.Mesh(handGeo, new THREE.MeshBasicMaterial({ color: 0x99cc99 }));
    leftHand.position.set(0, -0.16, 0);
    leftLowerArm.add(leftHand);
    // Right arm (outstretched, ragged)
    const rightShoulder = new THREE.Object3D();
    rightShoulder.position.set(0.25, 1.08, 0.08);
    group.add(rightShoulder);
    const rightUpperArm = new THREE.Mesh(upperArmGeo, new THREE.MeshBasicMaterial({ color: 0x99cc99 }));
    rightUpperArm.position.set(0, -0.16, 0);
    rightUpperArm.rotation.x = -0.7;
    rightShoulder.add(rightUpperArm);
    const rightElbow = new THREE.Object3D();
    rightElbow.position.set(0, -0.16, 0);
    rightUpperArm.add(rightElbow);
    const rightLowerArm = new THREE.Mesh(lowerArmGeo, new THREE.MeshBasicMaterial({ color: 0x99cc99 }));
    rightLowerArm.position.set(0, -0.14, 0);
    rightLowerArm.rotation.x = -0.5;
    rightElbow.add(rightLowerArm);
    const rightHand = new THREE.Mesh(handGeo, new THREE.MeshBasicMaterial({ color: 0x99cc99 }));
    rightHand.position.set(0, -0.16, 0);
    rightLowerArm.add(rightHand);
    // Randomly add a gun to some zombies
    let hasGun = Math.random() < 0.5;
    if (hasGun) {
        const gunGeo = new THREE.BoxGeometry(0.18, 0.18, 0.4);
        const gunMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const gun = new THREE.Mesh(gunGeo, gunMat);
        gun.position.set(0, -0.12, 0.32);
        rightHand.add(gun);
        group.userData.gun = gun;
    } else {
        group.userData.gun = null;
    }
    // Legs (ragged pants, shuffling)
    const upperLegGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.38, 8);
    const lowerLegGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.32, 8);
    const footGeo = new THREE.BoxGeometry(0.14, 0.06, 0.22);
    const legMat = new THREE.MeshBasicMaterial({ color: 0x333333 }); // dark pants
    const leftUpperLeg = new THREE.Mesh(upperLegGeo, legMat);
    leftUpperLeg.position.set(-0.13, 0.45, 0);
    leftUpperLeg.rotation.x = -Math.PI/32;
    group.add(leftUpperLeg);
    const leftLowerLeg = new THREE.Mesh(lowerLegGeo, legMat);
    leftLowerLeg.position.set(-0.13, 0.18, 0);
    leftLowerLeg.rotation.x = Math.PI/32;
    group.add(leftLowerLeg);
    const leftFoot = new THREE.Mesh(footGeo, legMat);
    leftFoot.position.set(-0.13, 0.05, 0.08);
    group.add(leftFoot);
    const rightUpperLeg = new THREE.Mesh(upperLegGeo, legMat);
    rightUpperLeg.position.set(0.13, 0.45, 0);
    rightUpperLeg.rotation.x = -Math.PI/32;
    group.add(rightUpperLeg);
    const rightLowerLeg = new THREE.Mesh(lowerLegGeo, legMat);
    rightLowerLeg.position.set(0.13, 0.18, 0);
    rightLowerLeg.rotation.x = Math.PI/32;
    group.add(rightLowerLeg);
    const rightFoot = new THREE.Mesh(footGeo, legMat);
    rightFoot.position.set(0.13, 0.05, 0.08);
    group.add(rightFoot);
    group.position.set(x, 0, z);
    group.userData.health = BAD_GUY_HEALTH;
    group.userData.state = 'idle';
    // Animation state for movement
    group.userData.anim = { legPhase: Math.random()*Math.PI*2 };
    scene.add(group);
    baddies.push(group);
}

function init() {
    // Pointer lock for mouse look
    document.body.addEventListener('click', () => {
        document.body.requestPointerLock();
    });
    let yaw = 0, pitch = 0;
    document.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === document.body) {
            yaw -= event.movementX * 0.002;
            pitch -= event.movementY * 0.002;
            pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
            camera.rotation.set(pitch, yaw, 0);
        }
    });
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222244);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);
    camera.rotation.order = 'YXZ';

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add crosshair
    let crosshair = document.createElement('div');
    crosshair.id = 'crosshair';
    crosshair.style.position = 'fixed';
    crosshair.style.left = '50%';
    crosshair.style.top = '50%';
    crosshair.style.width = '24px';
    crosshair.style.height = '24px';
    crosshair.style.transform = 'translate(-50%, -50%)';
    crosshair.style.pointerEvents = 'none';
    crosshair.style.zIndex = '1001';
    crosshair.innerHTML = '<div style="position:absolute;left:11px;top:0;width:2px;height:24px;background:white;"></div><div style="position:absolute;left:0;top:11px;width:24px;height:2px;background:white;"></div>';
    document.body.appendChild(crosshair);

    // Simple floor (bigger platform)
    const floorGeometry = new THREE.BoxGeometry(80, 0.1, 80);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    scene.add(floor);


    // No initial baddies

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let isFiring = false;
let ammo = 30;
let maxAmmo = 30;
let isReloading = false;

function onMouseDown(event) {
    isFiring = true;
}

function onMouseUp(event) {
    isFiring = false;
    // Always reset lastFireFrame on mouse up to prevent jamming
    window.lastFireFrame = 0;
}

function onKeyDown(event) {
    switch(event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
        case 'Space':
            if (!isJumping && camera.position.y <= 1.6) {
                isJumping = true;
                jumpVelocity = jumpStrength;
            }
            break;
        case 'KeyR':
            if (!isReloading && ammo < maxAmmo) {
                isReloading = true;
                setTimeout(() => {
                    ammo = maxAmmo;
                    isReloading = false;
                    // Always reset lastFireFrame after reload to prevent jamming
                    window.lastFireFrame = 0;
                }, 900); // reload time in ms
            }
            break;
    }
}

function onKeyUp(event) {
    switch(event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
    }
}

function fireBullet() {
    if (ammo > 0 && !isReloading) {
        ammo--;
        const bulletGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        bullet.position.copy(camera.position);
        // Calculate direction
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        bullet.userData = { direction: direction.clone() };
        scene.add(bullet);
        bullets.push(bullet);
    }
}

function animate() {
    // Game over if player falls off platform
    if (camera.position.y < -5) {
        alert('Game Over! You fell off the platform.');
        window.location.reload();
        return;
    }
    // Progressive baddie spawning logic
    if (!window.spawnTimer) {
        window.spawnTimer = 0;
        window.spawnInterval = 200; // frames between spawns
        window.baddieDifficulty = 0;
    }
    window.spawnTimer++;
    if (window.spawnTimer > window.spawnInterval) {
        window.spawnTimer = 0;
        window.baddieDifficulty++;
        // Random spawn position anywhere on platform (avoid spawning too close to player)
        let x, z;
        do {
            x = Math.random()*38 - 19;
            z = Math.random()*38 - 19;
        } while (Math.abs(x - camera.position.x) < 3 && Math.abs(z - camera.position.z) < 3);
        // Increase health and speed as difficulty rises
        const health = BAD_GUY_HEALTH + Math.floor(window.baddieDifficulty/3);
        const speed = 0.03 + window.baddieDifficulty*0.003;
        createBaddie(x, z);
        baddies[baddies.length-1].userData.health = health;
        baddies[baddies.length-1].userData.moveSpeed = speed;
        // Decrease interval for faster spawns
        window.spawnInterval = Math.max(40, 200 - window.baddieDifficulty*8);
    }
    // Baddie shooting: only snipers (with guns) shoot, and only when alert
    for (let baddie of baddies) {
        if (!baddie.userData.gun) continue; // only snipers shoot
        if (baddie.userData.state !== 'alert') continue; // only shoot when alert
        const dx = camera.position.x - baddie.position.x;
        const dz = camera.position.z - baddie.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        // Make shooting harder as difficulty increases
        let shootChance = 0.03 + (window.baddieDifficulty||0)*0.003;
        // Snipe from a distance (shoot if player is within 28 units, but not too close)
        if (dist > 8 && dist < 28 && Math.random() < shootChance) {
            // Shoot at player from gun muzzle
            const bulletGeo = new THREE.SphereGeometry(0.08, 8, 8);
            const bulletMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
            const bullet = new THREE.Mesh(bulletGeo, bulletMat);
            // Get gun world position
            const gun = baddie.userData.gun;
            const gunWorldPos = new THREE.Vector3();
            gun.getWorldPosition(gunWorldPos);
            bullet.position.copy(gunWorldPos);
            // Direction from gun to player
            const dir = new THREE.Vector3(
                camera.position.x - gunWorldPos.x,
                camera.position.y - gunWorldPos.y,
                camera.position.z - gunWorldPos.z
            ).normalize();
            bullet.userData = { direction: dir };
            scene.add(bullet);
            enemyBullets.push(bullet);
        }
    }

    // Move enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        bullet.position.add(bullet.userData.direction.clone().multiplyScalar(BULLET_SPEED * 0.7));
        // Remove bullet if too far
        if (bullet.position.distanceTo(camera.position) > 30) {
            scene.remove(bullet);
            enemyBullets.splice(i, 1);
            continue;
        }
 
        if (bullet.position.distanceTo(camera.position) < 0.4 && camera.position.y <= 1.7) {
            playerHealth -= 1;
            scene.remove(bullet);
            enemyBullets.splice(i, 1);
            document.body.style.background = '#ffcccc';
            setTimeout(() => document.body.style.background = '', 100);
            if (playerHealth <= 0) {
                alert('Game Over!');
                window.location.reload();
            }
        }
    }
    // Full auto firing logic with reload
    if (isFiring && !isReloading) {
        if (!window.lastFireFrame) window.lastFireFrame = 0;
        if (!window.fireInterval) window.fireInterval = 5; // frames between shots
        if (window.spawnTimer - window.lastFireFrame > window.fireInterval) {
            fireBullet();
            window.lastFireFrame = window.spawnTimer;
        }
    }
    requestAnimationFrame(animate);

    // Move relative to camera direction
    velocity.x = 0;
    velocity.z = 0;
    let forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    let right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    if (moveForward) {
        velocity.x += forward.x * speed;
        velocity.z += forward.z * speed;
    }
    if (moveBackward) {
        velocity.x -= forward.x * speed;
        velocity.z -= forward.z * speed;
    }
    if (moveLeft) {
        velocity.x -= right.x * speed;
        velocity.z -= right.z * speed;
    }
    if (moveRight) {
        velocity.x += right.x * speed;
        velocity.z += right.z * speed;
    }

    // Arena movement with wall collision
    let nextX = camera.position.x + velocity.x;
    let nextZ = camera.position.z + velocity.z;
    // Wall collision: prevent crossing wall (wall is at x=0, thickness 0.8, length 40)
    if (window.arenaWall) {
        const wallMinX = window.arenaWall.position.x - 0.4;
        const wallMaxX = window.arenaWall.position.x + 0.4;
        const wallMinZ = window.arenaWall.position.z - 20;
        const wallMaxZ = window.arenaWall.position.z + 20;
        // If player is about to cross the wall, block movement
        // Only block if crossing from one side to the other
        const prevX = camera.position.x;
        const prevZ = camera.position.z;
        // If previous position is outside wall and next is inside, block movement
        const wasOutside = (prevX <= wallMinX || prevX >= wallMaxX);
        const willBeInside = (nextX > wallMinX && nextX < wallMaxX && nextZ > wallMinZ && nextZ < wallMaxZ);
        if (wasOutside && willBeInside) {
            // Block movement in X direction
            nextX = camera.position.x;
        }
        // If already inside wall bounds, allow movement only within wall bounds
        if (!wasOutside) {
            // Clamp position to wall bounds
            nextX = Math.max(wallMinX, Math.min(wallMaxX, nextX));
            nextZ = Math.max(wallMinZ, Math.min(wallMaxZ, nextZ));
        }
    }
    camera.position.x = nextX;
    camera.position.z = nextZ;

    // Handle jumping and falling
    // Always check if player is above the floor, even if not jumping
    const floorMinX = -40, floorMaxX = 40;
    const floorMinZ = -40, floorMaxZ = 40;
    if (camera.position.y > 1.6 || isJumping) {
        camera.position.y += jumpVelocity;
        jumpVelocity -= gravity;
        // Only land if above the floor and within floor bounds
        if (camera.position.y <= 1.6 &&
            camera.position.x > floorMinX && camera.position.x < floorMaxX &&
            camera.position.z > floorMinZ && camera.position.z < floorMaxZ) {
            camera.position.y = 1.6;
            isJumping = false;
            jumpVelocity = 0;
        }
    } else {
        // If not jumping, check if player is still on the floor
        if (
            camera.position.x < floorMinX || camera.position.x > floorMaxX ||
            camera.position.z < floorMinZ || camera.position.z > floorMaxZ
        ) {
            // Start falling if outside floor bounds
            isJumping = true;
            jumpVelocity = 0;
        }
    }

    // Helper: make baddie corpse fall and stay
    function makeCorpse(baddie) {
        baddie.userData.isCorpse = true;
        // Lay flat: rotate around x axis
        baddie.rotation.x = Math.PI / 2;
        // Lower to ground
        baddie.position.y = 0.1;
        // Make torso visible and realistic
        if (baddie.children[0]) {
            baddie.children[0].material.color.set(0x8B4513); // restore brown
            baddie.children[0].visible = true;
            baddie.children[0].scale.set(1.1, 1.2, 1.1); // slightly larger for corpse
            baddie.children[0].position.set(0, 0.85, 0.08); // lift chest up a bit
        }
        // Remove any extra chest box if present
        if (baddie.userData.chestCorpse) {
            baddie.remove(baddie.userData.chestCorpse);
            baddie.userData.chestCorpse = null;
        }
    }

    // Move bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.position.add(bullet.userData.direction.clone().multiplyScalar(BULLET_SPEED));
        // Remove bullet if too far
        if (bullet.position.distanceTo(camera.position) > 30) {
            scene.remove(bullet);
            bullets.splice(i, 1);
            continue;
        }
        // Wall collision: remove bullet if it hits the wall
        if (window.arenaWall) {
            const wallBox = new THREE.Box3().setFromObject(window.arenaWall);
            if (wallBox.containsPoint(bullet.position)) {
                scene.remove(bullet);
                bullets.splice(i, 1);
                continue;
            }
        }
        // Check collision with baddies
        for (let j = baddies.length - 1; j >= 0; j--) {
            const baddie = baddies[j];
            if (baddie.userData.isCorpse) continue;
            // Head is child index 2
            const head = baddie.children[2];
            if (head) {
                const headBox = new THREE.Box3().setFromObject(head);
                if (headBox.containsPoint(bullet.position)) {
                    // Headshot: instant kill
                    baddie.userData.state = 'alert'; // become alert if shot
                    baddie.userData.alertUntil = performance.now() + 30000; // alert for 30s
                    makeCorpse(baddie);
                    baddies.splice(j, 1);
                    scene.remove(bullet);
                    bullets.splice(i, 1);
                    break;
                }
            }
            // Otherwise, check body hit
            const baddieBox = new THREE.Box3().setFromObject(baddie);
            if (baddieBox.containsPoint(bullet.position)) {
                baddie.userData.state = 'alert'; // become alert if shot
                baddie.userData.alertUntil = performance.now() + 30000; // alert for 30s
                baddie.userData.health -= 1;
                if (baddie.userData.health <= 0) {
                    makeCorpse(baddie);
                    baddies.splice(j, 1);
                } else {
                    baddie.children[0].material.color.set(0xffff00);
                    setTimeout(() => baddie.children[0].material.color.set(0xff3333), 100);
                }
                scene.remove(bullet);
                bullets.splice(i, 1);
                break;
            }
        }
    }

    // Baddie movement: snipers (with guns) snipe and keep away, runners (no guns) chase and attack by touch
    for (let baddie of baddies) {
        const dx = camera.position.x - baddie.position.x;
        const dz = camera.position.z - baddie.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        let moving = false;
        // --- Zombie jump logic only (dodging removed) ---
        if (!baddie.userData.isCorpse) {
            // Jump state
            if (!baddie.userData.jumpY) baddie.userData.jumpY = 0;
            if (!baddie.userData.isJumping) baddie.userData.isJumping = false;
            if (!baddie.userData.jumpVel) baddie.userData.jumpVel = 0;
            // No random jumping
            // Handle jumping
            if (baddie.userData.isJumping) {
                baddie.userData.jumpY += baddie.userData.jumpVel;
                baddie.userData.jumpVel -= gravity;
                if (baddie.userData.jumpY <= 0) {
                    baddie.userData.jumpY = 0;
                    baddie.userData.isJumping = false;
                    baddie.userData.jumpVel = 0;
                }
            }
            // Set baddie vertical position
            baddie.position.y = baddie.userData.jumpY;
        }
        const hasGun = !!baddie.userData.gun;
        // Floor bounds
        const floorMinX = -40, floorMaxX = 40;
        const floorMinZ = -40, floorMaxZ = 40;
        // Check alert timer
        let isAlert = false;
        if (baddie.userData.alertUntil && performance.now() < baddie.userData.alertUntil) {
            isAlert = true;
        }
        if (hasGun) {
            // Sniper zombie: larger alert radius, keep away, snipe
            if (dist < 28 || baddie.userData.state === 'alert' || isAlert) {
                baddie.userData.state = 'alert';
                baddie.children[0].material.color.set(0xff0000); // torso
                // Keep distance: try to stay 12-24 units away
                const moveSpeed = baddie.userData.moveSpeed || 0.03;
                if (dist < 12) {
                    // Too close, move away from player
                    baddie.position.x -= moveSpeed * dx/dist;
                    baddie.position.z -= moveSpeed * dz/dist;
                    moving = true;
                } else if (dist > 24) {
                    // Too far, move closer
                    baddie.position.x += moveSpeed * dx/dist;
                    baddie.position.z += moveSpeed * dz/dist;
                    moving = true;
                } else {
                    // Hold position, snipe
                    moving = false;
                }
                // Clamp to floor bounds
                baddie.position.x = Math.max(floorMinX+1, Math.min(floorMaxX-1, baddie.position.x));
                baddie.position.z = Math.max(floorMinZ+1, Math.min(floorMaxZ-1, baddie.position.z));
                // Face player
                baddie.lookAt(camera.position.x, baddie.position.y + 1, camera.position.z);
            } else {
                // Idle wander
                baddie.userData.state = 'idle';
                baddie.children[0].material.color.set(0x8B4513); // torso
                if (Math.random() < 0.01) {
                    baddie.userData.wanderDir = Math.random() * Math.PI * 2;
                }
                if (baddie.userData.wanderDir !== undefined) {
                    baddie.position.x += 0.01 * Math.cos(baddie.userData.wanderDir);
                    baddie.position.z += 0.01 * Math.sin(baddie.userData.wanderDir);
                    // Clamp to floor bounds
                    baddie.position.x = Math.max(floorMinX+1, Math.min(floorMaxX-1, baddie.position.x));
                    baddie.position.z = Math.max(floorMinZ+1, Math.min(floorMaxZ-1, baddie.position.z));
                    moving = true;
                }
            }
        } else {
            // Runner zombie: smaller alert radius, chase and attack by touch
            if (dist < 16 || baddie.userData.state === 'alert' || isAlert) {
                baddie.userData.state = 'alert';
                baddie.children[0].material.color.set(0xff0000); // torso
                const moveSpeed = baddie.userData.moveSpeed || 0.03;
                baddie.position.x += moveSpeed * dx/dist;
                baddie.position.z += moveSpeed * dz/dist;
                // Clamp to floor bounds
                baddie.position.x = Math.max(floorMinX+1, Math.min(floorMaxX-1, baddie.position.x));
                baddie.position.z = Math.max(floorMinZ+1, Math.min(floorMaxZ-1, baddie.position.z));
                moving = true;
                // Face player
                baddie.lookAt(camera.position.x, baddie.position.y + 1, camera.position.z);
                // Attack by touch
                if (dist < 0.7 && camera.position.y <= 1.7) {
                    playerHealth -= 1;
                    // Knock back player slightly
                    camera.position.x += -0.7 * dx/dist;
                    camera.position.z += -0.7 * dz/dist;
                    document.body.style.background = '#ffcccc';
                    setTimeout(() => document.body.style.background = '', 100);
                    if (playerHealth <= 0) {
                        alert('Game Over!');
                        window.location.reload();
                    }
                }
            } else {
                // Idle wander
                baddie.userData.state = 'idle';
                baddie.children[0].material.color.set(0x8B4513); // torso
                if (Math.random() < 0.01) {
                    baddie.userData.wanderDir = Math.random() * Math.PI * 2;
                }
                if (baddie.userData.wanderDir !== undefined) {
                    baddie.position.x += 0.01 * Math.cos(baddie.userData.wanderDir);
                    baddie.position.z += 0.01 * Math.sin(baddie.userData.wanderDir);
                    // Clamp to floor bounds
                    baddie.position.x = Math.max(floorMinX+1, Math.min(floorMaxX-1, baddie.position.x));
                    baddie.position.z = Math.max(floorMinZ+1, Math.min(floorMaxZ-1, baddie.position.z));
                    moving = true;
                }
            }
        }
        // Animate legs for walking
        const anim = baddie.userData.anim;
        if (moving) {
            anim.legPhase += 0.18;
        } else {
            anim.legPhase *= 0.8;
        }
        // Children indices for legs: leftUpperLeg=12, leftLowerLeg=13, rightUpperLeg=15, rightLowerLeg=16
        if (baddie.children[12] && baddie.children[13] && baddie.children[15] && baddie.children[16]) {
            baddie.children[12].rotation.x = -Math.PI/32 + Math.sin(anim.legPhase)*0.25; // left upper
            baddie.children[13].rotation.x = Math.PI/32 + Math.sin(anim.legPhase)*0.18; // left lower
            baddie.children[15].rotation.x = -Math.PI/32 - Math.sin(anim.legPhase)*0.25; // right upper
            baddie.children[16].rotation.x = Math.PI/32 - Math.sin(anim.legPhase)*0.18; // right lower
        }
        // Animate arms for walking (mirrored swing, using cos for right arm)
        // Children indices for arms: leftUpperArm=3, leftLowerArm=4, rightUpperArm=6, rightLowerArm=7
        if (baddie.children[3] && baddie.children[4] && baddie.children[6] && baddie.children[7]) {
            // Left arm swings forward as right swings back, and vice versa
            const swing = Math.sin(anim.legPhase);
            baddie.children[3].rotation.x = 0.1 + swing*0.35; // left upper
            baddie.children[4].rotation.x = 0.1 + swing*0.18; // left lower
            baddie.children[6].rotation.x = 0.1 - swing*0.35; // right upper (mirrored)
            baddie.children[7].rotation.x = 0.1 - swing*0.18; // right lower (mirrored)
        }
    }
    // Debug overlay
    let debug = document.getElementById('debug');
    if (!debug) {
        debug = document.createElement('div');
        debug.id = 'debug';
        debug.style.position = 'fixed';
        debug.style.top = '0';
        debug.style.left = '0';
        debug.style.color = 'white';
        debug.style.background = 'rgba(0,0,0,0.5)';
        debug.style.zIndex = '1000';
        debug.style.fontSize = '14px';
        debug.style.padding = '2px 8px';
        document.body.appendChild(debug);
    }
    debug.innerText = `Camera: x=${camera.position.x.toFixed(2)} y=${camera.position.y.toFixed(2)} z=${camera.position.z.toFixed(2)}\nHealth: ${playerHealth}\nAmmo: ${ammo}${isReloading ? ' (Reloading...)' : ''}`;
    renderer.render(scene, camera);
}

init();

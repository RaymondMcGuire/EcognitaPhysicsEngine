/// <reference path="./EEntities/EPhysFloor.ts" />
/// <reference path="./EEntities/EPhysSphere.ts" />
/// <reference path="./ESystems/ESystems.ts" />

declare let THREE: any;

let floor = new EPSE.EPhysFloor();
let sphere = new EPSE.EPhysSphere({
    allowDrag: true,
    c_locus: {
        locus: {
            enabled: true,
            visible: true,
            color: 0xFF00FF,
            maxNum: 1000,
        }
    },
    c_velocityVector: {
        velocityVector: {
            enabled: true,
            visible: true,
            color: new THREE.Color(0xFF00FF),
            scale: 0.5,
        }
    },
    c_boundingBox: {
        boundingBox: {
            visible: true
        }
    },
    c_physics: {
        r: new THREE.Vector3(0, 0, 2),
        v: new THREE.Vector3(0, -5, 12),
        dynamic: true,
        recordData: true,
        skipRecord: 50
    }
});

let phys_system = new EPSE.EPhysCore();
phys_system.objects.push(floor);
phys_system.objects.push(sphere);
phys_system.Execute();
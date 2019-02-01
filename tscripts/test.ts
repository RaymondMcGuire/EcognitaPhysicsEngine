/// <reference path="./EEntities/EPhysSphere.ts" />
/// <reference path="./ESystems/ESystems.ts" />

let sphere = new EPSE.EPhysSphere();
console.log(sphere);

let phys_system = new EPSE.EPhysCore();
phys_system.Execute();
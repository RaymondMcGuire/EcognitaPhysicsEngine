/// <reference path="./EEntities/EPhysFloor.ts" />
/// <reference path="./ESystems/ESystems.ts" />

let floor = new EPSE.EPhysFloor();
console.log(floor);

let phys_system = new EPSE.EPhysCore();
phys_system.objects.push(floor);
phys_system.Execute();
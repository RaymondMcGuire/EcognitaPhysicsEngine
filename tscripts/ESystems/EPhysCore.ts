/* =========================================================================
 *
 *  EPhysCore.ts
 *
 *
 * ========================================================================= */
/// <reference path="../ECS/System.ts" />
/// <reference path="./E3DSystem.ts" />
module EPSE {

    export class EPhysCore extends ECS.System {

        three_system: E3DSystem;

        constructor() {
            super("system_core");
            this.three_system = new E3DSystem();
        }

        Execute() {
            super.Execute();
            this.three_system.Execute();
        }
    }
}
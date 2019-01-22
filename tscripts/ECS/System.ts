/* =========================================================================
 *
 *  System.ts
 *  game execute logical
 *
 * ========================================================================= */
module ECS {
    export class System {
        name: string;
        GlobalDatas: Entity;
        MainSystem: ECS.System;
        constructor(name: string) {
            this.name = name;
        }
        Execute() {
            console.log("[" + this.name + "]System Execute!");
        }
    }
}
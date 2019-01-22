/* =========================================================================
 *
 *  Component.ts
 *  one entity → multi-component
 *
 * ========================================================================= */
module ECS {
    export class Component {
        name: string;
        constructor(name: string) {
            this.name = name;
        }
    }
}

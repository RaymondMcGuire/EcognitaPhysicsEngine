/* =========================================================================
 *
 *  Entity.js
 *  each entity has an unique ID
 *
 * ========================================================================= */
/// <reference path="./Component.ts" />
/// <reference path="../utils/HashSet.ts" />
module ECS {
    export class Entity {
        name: string;
        id: string;
        count: number;
        components: Utils.HashSet<Component>;
        constructor(name: string) {
            this.name = name;
            this.id = (+new Date()).toString(16) +
                (Math.random() * 100000000 | 0).toString(16) +
                this.count;
            this.count++;
            this.components = new Utils.HashSet<Component>();
        }
        addComponent(component: Component) {
            this.components.set(component.name, component);
            //console.log("add ["+component.name+"] component");
        }
        
        removeComponent(component: Component):boolean {
            var name = component.name;
            var deletOrNot = this.components.delete(name);
            if (deletOrNot) {
                //console.log("delete [" + name + "] success!");
                return true;
            } else {
                //console.log("delete [" + name + "] fail! not exist!");
                return false;
            }
        }
    }

}


/// <reference path="./lib/Euler_method.ts" />

declare var Chart: any;

let em = new EPSE.Euler_method();
em.Calculate();
let result = em.data();

console.log(result);
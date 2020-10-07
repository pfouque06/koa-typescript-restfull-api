import { Logger } from "./Logger";
import { BaseFactory } from "./BaseFactory";
import { DataBaseFactory } from "./DataBaseFactory";
import { HttpServerFactory } from "./HttpServerFactory";
import { RestfullFactory } from "./RestfullFactory";

export const factorySet = [Logger, BaseFactory, DataBaseFactory, RestfullFactory, HttpServerFactory];
// order list of Services to be intiated with related Repositories through typedi module for dependancy injection :
// 1 DB Factory
// 2 RESTFULL Factory
// 3 HTTP Server Factory
export const restfullFactories = [DataBaseFactory, RestfullFactory, HttpServerFactory];

export { Logger } from "./Logger";
export { BaseFactory } from "./BaseFactory";
export { DataBaseFactory } from "./DataBaseFactory";
export { HttpServerFactory } from "./HttpServerFactory";
export { RestfullFactory } from "./RestfullFactory";

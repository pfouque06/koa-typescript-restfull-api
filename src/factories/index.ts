import { DBconnection } from "./DataBaseFactory";
import { restfullFactory } from "./RestfullFactory";
import { httpServerFactory } from "./HttpServerFactory";

export const factories = [DBconnection, restfullFactory, httpServerFactory];
import * as Reflect from "reflect-metadata";
import { ServiceInterface } from "./common";

var WebSocket = WebSocket || require('ws');

type P = {[key: string]: true} & {children(): void};

function apiDecorator(target) {
    console.log(arguments);
    return target;
}

class RPCTransport {
    nextRequestId = 1;
    socket: WebSocket;
    private requests: {[requestId: number]: {
        success: (result: any) => void,
        reject: (error: any) => void
    }} = {};

    constructor(url: string, ready: () => void) {
        this.socket = new WebSocket(url);
        this.socket.addEventListener('message', this.messageHandler);
        this.socket.addEventListener('open', () => {
            ready();
        })
    }

    private messageHandler = (msg: MessageEvent) => {
        let data = JSON.parse(msg.data);
        let r = this.requests[data.id];
        delete this.requests[data.id];
        if(typeof data.result !== undefined) {
            r.success(data.result);
        } else if(data.error) {
            r.reject(data.error);
        }
    };

    call(method: string, params: any[]) : Promise<any> {
        let requestId = this.nextRequestId++;
        return new Promise((success, reject) => {
            this.requests[requestId] = {success, reject};
            this.socket.send(JSON.stringify({
                jsonrpc: 2.0,
                id: requestId,
                method: method,
                params: params
            }));
        });
    }
}

export class RemoteApi<T> extends RPCTransport {
    method<K extends keyof T>(method: K): T[K] {
        let self = this;
        return <any> function() {
            return self.call(method, Array.from(arguments));
        }
    }
}

export function RemoteApi2<T>(url, ready) : T {
    let transport = new RPCTransport(url, ready);
    return <any> new Proxy({}, {
        get: function(target, property, receiver) {
            return function() {
                return transport.call(property.toString(), Array.from(arguments));
            }
        }
    });
}
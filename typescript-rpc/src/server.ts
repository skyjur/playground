require('source-map-support').install();
import * as WebSocket from 'ws';
import * as http from 'http';
import { ServiceApi } from "./common";

class Api implements ServiceApi {
    async add(a: number, b: number) {
        return a + b;
    }
    
    async repeat(a: string, b: number) {
        return a.repeat(b);
    }
}

let server = http.createServer();

const wss = new WebSocket.Server({ server });

interface JsonRpcRequest {
    jsonrpc: 2;
    id: number,
    method: string,
    params: any[]
}

wss.on('connection', (ws) => {
    let api = new Api();

    ws.on('message', (msg) => {
        let data: JsonRpcRequest;
        try {
            data = JSON.parse(msg.toString());
        } catch(e) {
            ws.send(createResponse(null, {error: {
                code: -32700,
                message: 'Parse error'
            }}));
            return;
        }
        if(!api[data.method]) {
            ws.send(createResponse(data.id, {error: {
                code: -32601,
                message: 'Method not found'
            }}));
        } else {
            api[data.method](... data.params).then((result) => {
                ws.send(createResponse(data.id, {result: result}));
            }).catch((err) => {
                ws.send(createResponse(data.id, {error: {
                    code: -32603,
                    message: "Server error"
                }}))
            });
        }
    });
});

function createResponse(reqId: number | null, data: any) : string {
    return JSON.stringify({
        jsonrpc: 2.0,
        id: reqId,
        ... data
    })
}

let serverPromise = new Promise<http.Server>(done => {
    server.listen(8080, () => {
        done(server);
    })
});

export default serverPromise;
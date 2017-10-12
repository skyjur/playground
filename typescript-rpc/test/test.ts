import * as WebSocket from 'ws';
import * as http from 'http';
import * as net from 'net';
import {ok, equal, fail, deepEqual} from 'assert';
import {ITestDefinition} from 'mocha';
import serverPromise from '../src/server';
import { ServiceInterface } from "../src/common";
import {RemoteApi, RemoteApi2} from '../src/client'


suite('RPC Tests', function() {
    let server: http.Server;
    let ws: WebSocket;
    let connections : {[id: number]: net.Socket} = {};
    this.timeout(200);

    suiteSetup(async () => {
        server = await serverPromise;
        let nextId = 1;
        server.addListener('connection', (con) => {
            let key = nextId++;
            connections[key] = con;
            con.on('close', () => { delete connections[key]; });
        });
    })

    suiteTeardown(() => {
        for(let conId in connections) { connections[conId].destroy(); }
        server.close();
    });

    suite('Direct WebSocket tests', () => {
        setup((done) => {
            ws = new WebSocket('ws://localhost:' + server.address().port);
            ws.on('open', ()=>done())
            ws.on('error', (e) => {
                ws.close(); 
                fail('socket error: ' + e.toString());
            });
        });

        teardown(() => ws.close());


        test('is connected', function() {
        equal(ws.readyState, ws.OPEN);
        });

        test('call with invalid json', (done) => {
            ws.send('invalid json');
            ws.on('message', (data) => {
                let result = JSON.parse(data.toString());
                deepEqual(result, {
                    jsonrpc: 2.0,
                    id: null,
                    error: { code: -32700, message: 'Parse error' }
                })
                done();
            });
        });

        test('call invalid method', (done) => {
            ws.send(JSON.stringify({
                'jsonrpc': 2.0,
                'id': 1,
                'method': 'invalidmethod',
                'params': []
            }));
            ws.on('message', function(data) {
                let result = JSON.parse(data.toString());
                deepEqual(result, {
                    jsonrpc: 2.0, id: 1, error: {
                        code: -32601, message: 'Method not found'
                    }
                });
                done();
            });
        });

        test('call add()', (done) => {
            ws.send(JSON.stringify({
                'jsonrpc': 2.0,
                'id': 2,
                'method': 'add',
                'params': [5, 6]
            }));
            ws.on('message', function(data) {
                let result = JSON.parse(data.toString());
                deepEqual(result, {
                    jsonrpc: 2.0,
                    id: 2,
                    result: 11
                });
                done();
            });
        });
    });

    suite('Client approach 1: RemoteApi()', () => {
        let api: RemoteApi<ServiceInterface>;

        setup((done) => {
            api = new RemoteApi('ws://localhost:8080', done);
        });

        test('make several async calls through ', async () => {
            let a = api.method('add')(4, 5);
            let b = api.method('repeat')('a', 5);
            equal(await b, 'aaaaa');
            equal(await a, 9);
        });

    });

    suite('Client approach 2: RemoteApi2()', () => {
        let api: ServiceInterface;

        setup((done) => {
            api = RemoteApi2<ServiceInterface>('ws://localhost:8080', done);
        });

        test('make several async calls through RemoteApi()', async () => {
            let a = api.add(4, 5);
            equal(await a, 9);
        });

    });
});
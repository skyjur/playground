var WebSocket = WebSocket || require('ws');

export class RemoteApi<T> {
    private resolvers: {[requestId: number]: [
        (result: any) => void,
        (error: any) => void
    ]} = {};
    private nextRequestId = 1;
    private webSocket: WebSocket;

    constructor(url: string, ready: () => void) {
        this.webSocket = new WebSocket(url);
        this.webSocket.addEventListener('message', (msg) => {
            let data = JSON.parse(msg.data);
            let [success, error] = this.resolvers[data.id];
            delete this.resolvers[data.id];
            if(typeof data.result !== undefined) {
                success(data.result);
            } else if(data.error) {
                error(data.error);
            }
        });
        this.webSocket.addEventListener('open', () => {
            ready();
        })
    }

    method<K keyof T>(method: K): T[K] {
        let self = this;
        return <any> function() {
            let args = Array.from(arguments);
            let requestId = self.nextRequestId++;
            return new Promise((success, reject) => {
                self.resolvers[requestId] = [success, reject];
                self.webSocket.send(JSON.stringify({
                    jsonrpc: 2.0,
                    id: requestId,
                    method: method,
                    params: args
                }));
            });
        }
    }
}
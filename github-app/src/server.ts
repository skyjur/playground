import * as express from 'express';
import {env} from 'process';


export class App {
    app = express();
    port = env['APP_PORT'] || '8000';

    constructor(settings?: Partial<App>) {
        if(settings) {
            for(let key in settings) { this[key] = settings[key]; }
        }
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Running web server on ${this.port}`);
        });
    }
}


if (require.main === module) {
    new App().start();
}
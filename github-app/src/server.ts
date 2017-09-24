import * as dotenv from 'dotenv';
import * as express from 'express';
import {env} from 'process';
import * as querystring from 'querystring';
import * as request from 'request-promise-native';
import {envGet} from './utils';


dotenv.config();
let CLIENT_ID = envGet('GITHUB_CLIENT_ID');
let CLIENT_SECRET = envGet('GITHUB_CLIENT_SECRET');


function debugRequest(req: express.Request, res: express.Response, next) {
    console.log('request', req.baseUrl, req.body);
    res.end();
    next();
    setTimeout(()=> {
        req; res;
    }, 0);
}

export class App {
    app = express();
    port = env['PORT'] || '8000';

    constructor(settings?: Partial<App>) {
        this.initRoutes(this.app);
        if(settings) {
            for(let key in settings) { this[key] = settings[key]; }
        }
    }

    private initRoutes(app: express.Application) {
        app.route('/github-callback').all(githubAuth);
        app.route('/github-webhook').all(debugRequest);
        app.route('/github-setup').all(githubSetup);
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Running web server on ${this.port}`);
        });
    }


}

function githubSetup(req: express.Request, res: express.Response) {
    var qs = querystring.stringify({
        'client_id': CLIENT_ID,
        'redirect_uri': 'https://testbed.skijur.com/github-callback',
        'state': 123
    })
    res.redirect('http://github.com/login/oauth/authorize?' + qs)
    res.end();
}

async function githubAuth(req: express.Request, res: express.Response) {
    var code = req.query.code;
    let data = await request.post('https://github.com/login/oauth/access_token?', {
        form: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code
        }
    });
    res.json(querystring.parse(data)).end();
}

if (require.main === module) {
    new App().start();
}

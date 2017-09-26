import * as dotenv from 'dotenv';
import * as express from 'express';
import * as CookieParser from 'cookie-parser';
import {env} from 'process';
import * as querystring from 'querystring';
import * as request from 'request-promise-native';
import {envGet, Crypto} from './utils';
import * as path from 'path';


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
    crypt = new Crypto(CLIENT_SECRET);

    
    constructor(settings?: Partial<App>) {
        this.app.use(CookieParser());
        this.app.set('views', __dirname);
        this.app.use('almond.js', express.static(path.join(__dirname, '../node_modules/almond/almond.js')));
        this.app.use('/static/', express.static(path.join(__dirname, 'static')));
        this.initRoutes(this.app);
        if(settings) {
            for(let key in settings) { this[key] = settings[key]; }
        }
    }

    private initRoutes(app: express.Application) {
        app.route('/github-callback').all(this.githubAuthCallback);
        app.route('/github-webhook').all(debugRequest);
        app.route('/github-setup').all(this.githubLoginRedirect);
        app.route('/logout').all(this.logout);
        app.route('/').get(this.index);
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Running web server on ${this.port}`);
        });
    }
    
    githubLoginRedirect = (req: express.Request, res: express.Response) => {
        var qs = querystring.stringify({
            'client_id': CLIENT_ID,
            'redirect_uri': 'https://testbed.skijur.com/github-callback',
            'state': 123
        })
        res.redirect('http://github.com/login/oauth/authorize?' + qs)
        res.end();
    };

    index = async (req: express.Request, res: express.Response) => {
        if(req.cookies && req.cookies.token) {
            res.render('./index.pug', {
                token: req.cookies.token
            });
        } else {
            res.render('./login.pug');
        }
    };

    githubAuthCallback = async (req: express.Request, res: express.Response) => {
        var code = req.query.code;
        let data = await request.post('https://github.com/login/oauth/access_token?', {
            form: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code
            }
        });
        let parsedData = querystring.parse(data);
        if(!parsedData.access_token) {
            throw new Error(data);
        }
        res.cookie('token', this.crypt.encrypt(parsedData.access_token), {
            httpOnly: true,
            expires: false
        });
        res.redirect('/');
        res.end();
    };

    logout = (req: express.Request, res: express.Response) => {
        res.clearCookie('token');
        res.redirect('/');
        res.end();
    }
}



if (require.main === module) {
    new App().start();
}

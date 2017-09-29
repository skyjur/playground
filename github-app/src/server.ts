import * as express from 'express';
import * as CookieParser from 'cookie-parser';
import {env} from 'process';
import * as querystring from 'querystring';
import * as request from 'request-promise-native';
import {envGet, Crypto, catchError} from './utils';
import * as path from 'path';
import * as sassMiddleware from 'node-sass-middleware';
import * as jwt from 'jsonwebtoken';
import {APP_ID, APP_CERT, CLIENT_ID, CLIENT_SECRET} from './conf';

interface Request extends express.Request {
    access_token?: string,
    installation_token?: string
}

interface Response extends express.Response {
}

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
        this.app.use(sassMiddleware({
            src: path.join(__dirname, 'sass'),
            dest: path.join(__dirname, 'static'),
            debug: true,
            outputStyle: 'expanded',
            prefix: "/static"
        }));
        this.app.use(CookieParser());
        this.app.use(this.tokenMiddleware);
        this.app.set('views', __dirname);
        this.app.use('/static', express.static(path.join(__dirname, 'static')));
        this.initRoutes(this.app);
        this.app.use((error, req, res, next) => {
            console.log(error.stack);
        });
        if(settings) {
            for(let key in settings) { this[key] = settings[key]; }
        }
    }

    tokenMiddleware = (req: Request, res: express.Response, next) => {
        if(req.cookies && req.cookies.userToken) {
            req.access_token = this.crypt.decrypt(req.cookies.userToken);
        }
        if(req.cookies && req.cookies.installationToken) {
            req.installation_token = this.crypt.decrypt(req.cookies.installationToken);
        }
        next();
    }

    private initRoutes(app: express.Application) {
        app.route('/github-callback').all(this.githubAuthCallback);
        app.route('/github-webhook').all(debugRequest);
        app.route('/github-setup').all(this.githubLoginRedirect);
        app.route('/logout').all(this.logout);
        app.route('/').get(this.index);
        app.use('/github/v3', this.githubApiV3Proxy);
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Running web server on ${this.port}`);
        });
    }
    
    githubLoginRedirect = (req: Request, res: Response) => {
        var qs = querystring.stringify({
            'client_id': CLIENT_ID,
            'redirect_uri': 'http://localhost:8000/github-callback',
            'state': 123
        })
        res.redirect('http://github.com/login/oauth/authorize?' + qs)
        res.end();
    };

    index = async (req: Request, res: Response) => {
        if(req.access_token) {
            res.render('./index.pug', { token: req.access_token });
        } else {
            res.render('./login.pug');
        }
    };

    githubAuthCallback = catchError(async (req: Request, res: Response, next) => {
        var code = req.query.code;
        let data = await request.post('https://github.com/login/oauth/access_token?', {
            form: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code
            }
        }).catch(next);
        let access_token = querystring.parse(data).access_token;
        let installations: Github.InstallationsResponse = await request.get('https://api.github.com/user/installations', {
            headers: {
                'user-agent': 'node',
                accept: "application/vnd.github.machine-man-preview+json",
                authorization: `token ${access_token}`
            },
            json: true
        }).catch(next);
        let thisInstallation = installations.installations.find(obj => obj.app_id === APP_ID);
        if(!thisInstallation) {
            throw new Error('Installation not found for this app');
        }

        let installationToken = await this.getInstallationToken(thisInstallation.id).catch(next);
        
        res.cookie('userToken', this.crypt.encrypt(access_token), {
            httpOnly: true,
            expires: false
        });
        res.cookie('installationToken', this.crypt.encrypt(installationToken), {
            httpOnly: true,
            expires: false  // TODO: 1 hour expiry
        })
        res.redirect('/');
        res.end();
    });

    logout = (req: express.Request, res: Response) => {
        res.clearCookie('token');
        res.redirect('/');
        res.end();
    };

    githubApiV3Proxy = (req: Request, res: Response, next) => {
        let path = req.path.replace('/github/v3', '');
        if(req.access_token) {
            var headers = {
                accept: "application/vnd.github.machine-man-preview+json",
                authorization: this.getGithubAuthorizationValue(req, path)
            };
            let newReq = request('https://api.github.com' + path, {
                headers: headers,
                qs: req.query
            }, (err, response, body) => {} );
            req.pipe(newReq);
            newReq.pipe(res);
            newReq.catch(next);
        } else {
            res.status(403).write("Missing access token");
            res.end();
        }
    };

    private getGithubAuthorizationValue(req: Request, githubPath: string) {
        if(/^\/user/.test(githubPath)) {
            return `token ${req.access_token}`
        } else {
            return `token ${req.installation_token}`
        }
    }

    createJwt(expiresInSeconds=360) {
        let now = Math.floor(Date.now() / 1000);
        return jwt.sign({
            exp: now + expiresInSeconds,
            iss: APP_ID
        }, APP_CERT, {algorithm: "RS256"});
    }

    async getInstallationToken(installationId: number) {
        let tokenResp = await request.post(`https://api.github.com/installations/${installationId}/access_tokens`, {
            headers: {
                'user-agent': 'node',
                accept: "application/vnd.github.machine-man-preview+json",
                authorization: `Bearer ${this.createJwt()}`
            },
            json: true
        });
        if(!tokenResp.token) {
            throw new Error(`Response does not contain token (${tokenResp})`);
        }
        return tokenResp.token;
    }
}

if (require.main === module) {
    new App().start();
}

import * as request from 'request-promise-native';
import * as conf from './conf';
import {App} from './server';


let app = new App();


async function runCheck() {

    let jwt = await app.createJwt();

    console.log('[CONF] App ID', conf.APP_ID);
    console.log('[CONF] Client ID', conf.CLIENT_ID);
    console.log('Created JWT:')
    console.log(jwt);

    await checkAppInfo(jwt);   
    await checkAppInstallations(jwt);
}

async function checkAppInfo(jwt: string) {
    let resp = await request.get('https://api.github.com/app', {
        headers: {
            'user-agent': 'node',
            Accept: 'application/vnd.github.machine-man-preview+json',
            Authorization: `Bearer ${jwt}`
        },
        json: true
    });
    if(!resp.name) { throw new Error(resp); }
    console.log('[/app] App name:', resp.name);
    console.log('[/app] App owner:', resp.owner.login);
}

async function checkAppInstallations(jwt: string) {
    console.log('Get /app/installations')
    let resp = await request.get('https://api.github.com/app/installations', {
        headers: {
            'user-agent': 'node',
            Accept: 'application/vnd.github.machine-man-preview+json',
            Authorization: `Bearer ${jwt}`
        },
        json: true
    });
    for(let i=0; i<resp.length; i++) {
        let obj = resp[i];
        console.log('Installation id:', obj.id);
        console.log('  created at:', obj.created_at);
        console.log('  account:', obj.account.login);
        await checkAppInstallation(jwt, obj.id);
    }
}

async function checkAppInstallation(jwt: string, installationId: number) {
    let token = await app.getInstallationToken(installationId);
    console.log('  token:', token);
    await checkRepositories(jwt, installationId, token);
}

async function checkRepositories(jwt, installationId, token) {
    let url = `https://api.github.com/installation/repositories`;
    let resp = await request.get(url, {
        headers: {
            'user-agent': 'node',
            Accept: 'application/vnd.github.machine-man-preview+json',
            Authorization: `token ${token}`
        },
        json: true
    }) as Github.RepositoriesResponse;
    if(!resp.repositories) { new Error(resp.toString())}
    for(let r of resp.repositories) {
        console.log('  Repository: ');
        console.log('    Id:', r.id);
        console.log('    Name:', r.name);
        console.log('    Owner:', r.owner.login);
    }
}

async function checkContent(token, repoId) {
    let url = `https://api.github.com/repositories/${repoId}/contents`;
    

}


if (require.main === module) {
   runCheck();
}
import {env, exit, stderr} from 'process';


export function envGet(key: string): string {
    if(key in env) { 
        return env[key];
    } else {
        stderr.write(`Missing environment variable: ${key}`);
        exit(1);
    }
}
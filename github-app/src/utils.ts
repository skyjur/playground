import {env, exit, stderr} from 'process';
import {Request, Response} from './app';
import * as crypto from 'crypto';


export function envGet(key: string): string {
    if(key in env) { 
        return env[key];
    } else {
        stderr.write(`Missing environment variable: ${key}`);
        exit(1);
    }
}


export class Crypto {
    constructor(private password: string) {}
    
    encrypt(value: string) {
        let cipher = crypto.createCipher('aes-256-ctr', this.password);
        return cipher.update(value, 'utf8', 'hex') + cipher.final('hex');
    }
    
    decrypt(value: string) {
        let decipher = crypto.createDecipher('aes-256-ctr', this.password);
        return decipher.update(value, 'hex', 'utf8') + decipher.final('utf8');
    }
}


export function catchError(f: (req, res, next) => Promise<void>) {
    return (req: Request, res: Response, next: ()=>void) => {
        return f(req, res, next).catch(next);
    }
}
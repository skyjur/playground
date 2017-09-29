import {envGet} from './utils';
import * as fs from 'fs';
import * as dotenv from 'dotenv'

dotenv.config();

export const CLIENT_ID = envGet('GITHUB_CLIENT_ID');
export const CLIENT_SECRET = envGet('GITHUB_CLIENT_SECRET');
export const APP_ID = parseInt(envGet('APP_ID'));
export const APP_CERT = fs.readFileSync(envGet('APP_CERT')).toString();
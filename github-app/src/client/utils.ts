import {Link} from './ui';


export function repositoryLink(repo: Github.Repository) : Link {
    return {
        href: repoHref(repo.id),
        label: repo.name
    }
}

export function repoHref(repoId: number, path?: string) {
    return '#repo/' + repoId + (path ? '/' + path : '');
}

export function splitOnce(s: string, delimiter: string) : [string, string|undefined] {
    let at = s.indexOf(delimiter);
    return at === -1 ? [s, undefined] : [s.substr(0, at), s.substr(at + 1)];
}
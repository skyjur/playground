import {Link} from './ui';


export function repositoryLink(repo: Github.Repository) : Link {
    return {
        href: '#repo/' + repo.id,
        label: repo.name
    }
}
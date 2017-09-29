export async function apiGet(path) {
    return await (await fetch(`/github/v3${path}`, {credentials: 'same-origin'})).json();
}

export function getInstallations(): Promise<Github.InstallationsResponse> {
    return apiGet('/user/installations');
}

export function getInstallationRepositories(installationId: number) : Promise<Github.RepositoriesResponse> {
    return apiGet(`/user/installations/${installationId}/repositories`);
}

export async function getAllRepositories() : Promise<Github.Repository[]> {
    let resp = await getInstallations();
    let result = await Promise.all(resp.installations.map((obj=>getInstallationRepositories(obj.id))));
    return [].concat(... result.map(obj => obj.repositories));
}

export async function getContents(repoId, path) : Promise<Github.Content[]> {
    let resp: Github.Content[] = await apiGet(`/repositories/${repoId}/contents${path}`);
    return resp;
}

export function getUser() : Promise<Github.User> {
    return apiGet('/user');
}
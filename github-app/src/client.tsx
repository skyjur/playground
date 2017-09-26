/// <amd-module name="client" />
import * as React from 'react';
import * as DOM from 'react-dom';

class Repo {
    id: number;
    name: string;
}

interface Repos {
    total_count: number,
    repositories: Repo[]
}

interface Installation {
    id: number;
}

interface Installations {
    total_count: number,
    installations: Installation[]
}


class InstallationListComp extends React.Component {
    state: Installations;

    async componentDidMount() {
        this.setState(await $.get('/github/v3/user/installations'));
    }

    render() {
        if(!this.state) {
            return <div>Loading...</div>
        } else {
            return <div>
                {this.state.installations.map(this.renderInstallation)}
            </div>
        }
    }

    renderInstallation(obj: Installation) {
        return <div>
            <h1>Installation {obj.id}</h1>
            <RepoListComp installationId={obj.id} />
        </div>
    }
}

class RepoListComp extends React.Component {
    state: Repos;

    constructor(public props: {installationId: number}) {
        super(props);
    }

    async componentDidMount() {
        this.setState(await $.get(`/github/v3/user/installations/${this.props.installationId}/repositories`));
    }

    render() {
        if(!this.state) {
            return <div>Loading</div>
        } else {
            return <div className="RepoList">
                {this.state.repositories.map(this.renderRepo)}
            </div>
        }
    }

    renderRepo(repo: Repo) {
        return <div>
            <h2>{repo.name}</h2>
        </div>
    }
}

export function runApp(container) {
    DOM.render(<InstallationListComp />, container);
}
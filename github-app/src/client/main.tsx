/// <amd-module name="client" />
import * as React from 'react';
import * as DOM from 'react-dom';
import * as ui from './ui';
import * as api from './api';
import * as utils from './utils';


type Props = React.Props<any>;


interface MainControllerState {
    loading: boolean;
    repositories?: Github.Repository[],
    user?: Github.User,
    locationHash: string
}

export class MainController extends React.Component<{}, MainControllerState> {
    constructor() {
        super();
        this.state = {
            loading: true,
            locationHash: window.location.hash
        };
        window.addEventListener('hashchange', e => this.hashChangeHandler(e));
    }

    hashChangeHandler(e: Event) {
        this.setState({ ... this.state, locationHash: location.hash });
        let [part1, part2] = window.location.hash.split('/');
        if(part1 === '#repo') {
            this.openRepo(parseInt(part2));
        }
    }

    openRepo(repoId: number) {

    }

    async componentDidMount() {
        let userPromise = api.getUser();
        let reposPromise = api.getAllRepositories();
        this.setState({
            loading: false,
            repositories: await reposPromise,
            user: await userPromise
        });
    }

    render() {
        return this.state.loading ? <ui.Loading /> : (
            <div>
                <SidebarPanel {... this.state} />
                <ContentPanel {... this.state} />
            </div>
        );
    }

    static attachTo(container) {
        return DOM.render(<MainController />, container);
    }
}

class SidebarPanel extends React.Component<MainControllerState, {}> {
    render() {
        return <aside>
            <h3>
                Hi, <strong>{this.props.user.login}</strong>
            </h3>
            <ui.MenuSection
                label="Repositories"
                links={this.props.repositories.map(utils.repositoryLink)}
                activeHref={this.props.locationHash}
            />
            <ui.MenuSection
                label="Account"
                links={[
                    {label: "Logout", href:"/logout"}
                ]} />
        </aside>
    }
}

class ContentPanel extends React.Component<MainControllerState, {}> {
    render() {
        return <div></div>
    }
}
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
                {this.renderContent()}
            </div>
        );
    }

    static attachTo(container) {
        return DOM.render(<MainController />, container);
    }

    renderContent() {
        let [part1, part2] = utils.splitOnce(this.state.locationHash, '/');
        switch(part1) {
            case '#repo': {
                let [repoId, path] = utils.splitOnce(part2, '/');
                return <RepoContent key={part2} repoId={parseInt(repoId)} path={path} />
            }
        }
        return null;
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

interface RepoContentProps {
    repoId: number,
    path: string
}

interface RepoContetState {
    loading: boolean;
    content?: Github.Content[]
}

class RepoContent extends React.Component<RepoContentProps, RepoContetState> {
    constructor(props, context) {
        props = {... props, path: (props.path || '')}
        super(props, context);
        this.state = { loading: true };
        this.init();
    }

    async init() {
        this.setState({
            ... this.state,
            loading: false,
            content: await api.getContents(this.props.repoId, '/' + this.props.path)
        });
    }

    render() {
        if(this.state.loading) {
            return <ui.Loading />
        }
        return <table>
            {this.state.content.map(i => this.renderRow(i))}
        </table>
    }

    renderRow(item: Github.Content) {
        return <tr>
            <td>{ item.type }</td>
            <td>
                <a href={utils.repoHref(this.props.repoId, item.path)}>{ item.name }</a>
            </td>
            <td>
            </td>
        </tr>
    }

    
}
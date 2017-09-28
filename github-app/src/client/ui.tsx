import * as React from 'react';
import * as DOM from 'react-dom';


type Props = React.Props<any>;

export interface Link {
    href: string,
    label: string
}

export function Button(props: {onClick: Function}) {
}


export interface MenuProps {
    label: string,
    links: Link[],
    activeHref?: string
}


export class MenuSection extends React.Component<MenuProps, {}> {
    render() {
        return <section>
            <p>{this.props.label}:</p>
            <ul>
            {this.props.links.map(item =>
                <li>
                    <a href={item.href}
                    className={this.className(item.href)}
                        >{item.label}</a>
                </li>
            )}
            </ul>
        </section>
    }

    className(href: string) {
        return href === this.props.activeHref ? "active" : "";
    }
}

export function Loading() {
    return <div>Loading...</div>
}
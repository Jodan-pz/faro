import * as React from 'react';
import * as lodash from 'lodash';
import './nav.css';

type NavIndex = {
    indexGroup: number;
    indexTab: number;
};

class ProxyNav {
    private nav: Nav;
    constructor(nav: Nav) {
        this.nav = nav;
    }
    public index(): number { return this.nav.props.index !== undefined ? this.nav.props.index : 0; }
    public group(): number { return this.nav.props.group !== undefined ? this.nav.props.group : 0; }
    public focus(flag: boolean): void {
        this.nav.focus(flag);
    }
    public freeze(flag: boolean): void {
        this.nav.freeze(flag);
    }
}


class DeusExMachine {

    static freeze: boolean = false;
    private static onKeyFun: any = DeusExMachine.onKeyDown.bind(DeusExMachine);
    private static indexGroup: number = 0;
    private static indexTab: number = 0;
    private static orderGroup: number[] = [];
    private static currGroup: { [id: number]: Array<ProxyNav> } = {};

    private static map: Map<Nav, ProxyNav> = new Map<Nav, ProxyNav>();

    static add(nav: Nav): void {
        if (!DeusExMachine.map.has(nav)) {
            let proxy: ProxyNav = new ProxyNav(nav);
            DeusExMachine.map.set(nav, proxy);
            if (DeusExMachine.map.size === 1) DeusExMachine.addListener();
            DeusExMachine.performOrder();
        }
    }
    static remove(nav: Nav): void {
        if (DeusExMachine.map.has(nav)) {
            DeusExMachine.map.delete(nav);
            if (DeusExMachine.map.size === 0) DeusExMachine.removeListener();
            DeusExMachine.performOrder();
        }
    }

    static onfocus(nav: Nav): void {
        if (DeusExMachine.map.has(nav)) {
            let proxy: ProxyNav | undefined = DeusExMachine.map.get(nav);
            if (proxy && (DeusExMachine.indexGroup !== proxy.group() || DeusExMachine.indexTab !== proxy.index())) {
                DeusExMachine.currTab(false);
                DeusExMachine.indexGroup = proxy.group();
                DeusExMachine.indexTab = proxy.index();
                DeusExMachine.currTab(true);
            }
        }
    }

    private static performOrder(): void {
        DeusExMachine.orderGroup = [];
        DeusExMachine.currGroup = {};
        DeusExMachine.map.forEach((value: ProxyNav, key: Nav) => {
            let gn: number = value.group();
            if (DeusExMachine.currGroup[gn] === undefined) {
                DeusExMachine.currGroup[gn] = [];
                DeusExMachine.orderGroup.push(gn);
            }
            DeusExMachine.currGroup[gn].push(value);
            DeusExMachine.currGroup[gn] = DeusExMachine.currGroup[gn].sort((a: ProxyNav, b: ProxyNav) => a.index() - b.index());
        });
        DeusExMachine.orderGroup = DeusExMachine.orderGroup.sort((a: number, b: number) => a - b);
    }

    private static addListener(): void { window.addEventListener('keydown', DeusExMachine.onKeyFun); }
    private static removeListener(): void { window.removeEventListener('keydown', DeusExMachine.onKeyFun); }

    static onKeyDown(event: any): void {
        if (DeusExMachine.freeze) return;
        const { keyCode } = event;
        let validCode: boolean = keyCode === 37 || keyCode === 38 || keyCode === 39 || keyCode === 40;
        if (validCode) {
            event.preventDefault();
            DeusExMachine.performOrder();
            switch (keyCode) {
                case 37:
                    DeusExMachine.prevTab();
                    break;
                case 38:
                    DeusExMachine.prevGroup();
                    break;
                case 39:
                    DeusExMachine.nextTab();
                    break;
                case 40:
                    DeusExMachine.nextGroup();
                    break;
                default:
                    break;
            }
        }
    }

    private static lenGroup(): number {
        let gn: number = DeusExMachine.orderGroup[DeusExMachine.indexGroup];
        return (DeusExMachine.currGroup[gn] !== undefined) ? DeusExMachine.currGroup[gn].length : 0;
    }
    private static currTab(focus: boolean): void {
        let gn: number = DeusExMachine.orderGroup[DeusExMachine.indexGroup];
        if (DeusExMachine.currGroup[gn] !== undefined && DeusExMachine.currGroup[gn].length > 0 && DeusExMachine.indexTab < DeusExMachine.currGroup[gn].length) {
            DeusExMachine.currGroup[gn][DeusExMachine.indexTab].focus(focus);
        }
    }
    private static prevTab(): void {
        DeusExMachine.currTab(false);
        DeusExMachine.indexTab--;
        if (DeusExMachine.indexTab < 0) DeusExMachine.indexTab = DeusExMachine.lenGroup() - 1;
        DeusExMachine.currTab(true);
    }
    private static nextTab(): void {
        DeusExMachine.currTab(false);
        DeusExMachine.indexTab++;
        if (DeusExMachine.indexTab >= DeusExMachine.lenGroup()) DeusExMachine.indexTab = 0;
        DeusExMachine.currTab(true);
    }
    private static prevGroup(): void {
        DeusExMachine.currTab(false);
        DeusExMachine.indexGroup--;
        if (DeusExMachine.indexGroup < 0) DeusExMachine.indexGroup = DeusExMachine.orderGroup.length - 1;
        DeusExMachine.indexTab = 0;
        DeusExMachine.currTab(true);
    }
    private static nextGroup(): void {
        DeusExMachine.currTab(false);
        DeusExMachine.indexGroup++;
        if (DeusExMachine.indexGroup >= DeusExMachine.orderGroup.length) DeusExMachine.indexGroup = 0;
        DeusExMachine.indexTab = 0;
        DeusExMachine.currTab(true);
    }
}

export interface NavProps {
    group?: number;
    index?: number;
    onNav?: (focus: boolean) => void;
    focusStyle?: boolean;
}

interface NavState {
    focus: boolean;
    freeze: boolean;
}

export class Nav extends React.Component<NavProps, NavState> {

    public static freeze(flag: boolean): void {
        DeusExMachine.freeze = flag;
    }
    public static isFreeze(): boolean {
        return DeusExMachine.freeze;
    }
    /*
    public static getLength(): number {
        return DeusExMachine.list.length;
    }
    public static reversePath(reverse: boolean): void {
        DeusExMachine.reversePath(reverse);
    }
    public static getReverse(): boolean {
        return DeusExMachine.getReverse();
    }
    public static jumpFocus(index: number): boolean {
        return DeusExMachine.jumpFocus(index);
    }
    */
    // =================================================
    private bindlistenerFocus: any;
    constructor(props: any) {
        super(props);
        this.state = { focus: false, freeze: false };
        this.bindlistenerFocus = this.listenerFocus.bind(this);
    }

    public componentDidMount(): void {
        this.register();
    }
    public componentDidUpdate(): void {
        this.checkFocus();
    }
    public componentWillUnmount(): void {
        let element: any = this.getElement();
        if (element) {
            this.removeListener(element);
        }
        this.unregister();
    }
    public freeze(flag: boolean): void {
        if (flag !== this.state.freeze) {
            this.setState({ freeze: flag });
        }
    }
    public focus(flag: boolean): void {
        if (flag !== this.state.focus) {
            this.setState({ focus: flag });
        }
    }
    render() {
        const { group, index } = this.props;
        let reactChild: React.ReactNode[] = React.Children.toArray(this.props.children);
        if (reactChild.length > 0) {
            let grp: number = group !== undefined ? group : 0;
            let inx: number = index !== undefined ? index : 0;
            let att: string = 'nav-' + grp + '-' + inx;
            for (let i: number = 0; i < reactChild.length; i++) {
                if (React.isValidElement(reactChild[i])) {
                    let child: React.ReactElement<any> = reactChild[i] as React.ReactElement<any>;
                    let props: any = {...child.props};
                    let clz: string = (child.props.className ? child.props.className : '') + ' nav';
                    reactChild[i] = React.cloneElement(child, {...props,  navattribute: att, className: clz });
                    break;
                }
            }
        }
        return (
            <React.Fragment>
                {reactChild}
            </React.Fragment>
        );
    }
    private register(): void {
        DeusExMachine.add(this);
        this.checkFocus();
    }
    private unregister(): void {
        DeusExMachine.remove(this);
    }
    private listenerFocus(): void {

        DeusExMachine.onfocus(this);
    }
    private addListener(element: any): void {
        let thereIsListener: boolean | null = element.getAttribute('listenerFocus');
        if (!thereIsListener) {
            element.addEventListener('focus', this.bindlistenerFocus);
        }
        element.setAttribute('listenerFocus', true);
    }
    private removeListener(element: any): void {
        let thereIsListener: boolean | null = element.getAttribute('listenerFocus');
        if (thereIsListener) {
            element.removeEventListener('focus', this.bindlistenerFocus);
        }
        element.setAttribute('listenerFocus', false);
    }

    private getElement(): any {
        const { group, index } = this.props;
        let element: any = null;
        let nodelist = document.querySelectorAll('[navattribute]');
        let grp: number = group !== undefined ? group : 0;
        let inx: number = index !== undefined ? index : 0;
        let att: string = 'nav-' + grp + '-' + inx;
        for (let i: number = 0; i < nodelist.length; i++) {
            element = nodelist[i];
            let val = element.getAttribute('navattribute');
            if (val === att) break;
        }
        return element;
    }
    private checkFocus(): void {
        const { focus, freeze } = this.state;
        if (!freeze) {
            if (this.props.onNav) this.props.onNav(focus);
            let element: any = this.getElement();
            this.addListener(element);
            if (element) {
                if (lodash.isElement(element)) {
                    if (focus && lodash.hasIn(element, 'focus')) {
                        element.focus();
                    }
                }
            }
        }
    }
}
import * as React from 'react';

// t: currentTime
// b: startValue
// c: change in value
// d: duration

export enum Easing {
    linear,
    // quadratic easing in - accelerating from zero velocity
    easeInQuad,
    // quadratic easing out - decelerating to zero velocity
    easeOutQuad,
    // quadratic easing in/out - acceleration until halfway, then deceleration
    easeInOutQuad,
    // cubic easing in - accelerating from zero velocity
    easeInCubic,
    // cubic easing out - decelerating to zero velocity
    easeOutCubic,
    // cubic easing in/out - acceleration until halfway, then deceleration    
    easeInOutCubic,
    // quartic easing in - accelerating from zero velocity
    easeInQuart,
    // quartic easing out - decelerating to zero velocity
    easeOutQuart,
    // quartic easing in/out - acceleration until halfway, then deceleration
    easeInOutQuart,
    // quintic easing in - accelerating from zero velocity
    easeInQuint,
    // quintic easing out - decelerating to zero velocity
    easeOutQuint,
    // quintic easing in/out - acceleration until halfway, then deceleration    
    easeInOutQuint,
    // sinusoidal easing in - accelerating from zero velocity
    easeInSine,
    // sinusoidal easing out - decelerating to zero velocity
    easeOutSine,
    // sinusoidal easing in/out - accelerating until halfway, then decelerating 
    easeInOutSine,
    // exponential easing in - accelerating from zero velocity
    easeInExpo,
    // exponential easing out - decelerating to zero velocity 
    easeOutExpo,
    //  exponential easing in/out - accelerating until halfway, then decelerating
    easeInOutExpo,
    // circular easing in - accelerating from zero velocity
    easeInCirc,
    // circular easing out - decelerating to zero velocity
    easeOutCirc,
    // circular easing in/out - acceleration until halfway, then deceleration
    easeInOutCirc
}

const EasingFunc = {
    // simple linear tweening - no easing, no acceleration
    linear: (t: number, b: number, c: number, d: number) => {
        return c * t / d + b;
    },
    // quadratic easing in - accelerating from zero velocity
    easeInQuad: (t: number, b: number, c: number, d: number) => {
        t /= d;
        return c * t * t + b;
    },
    // quadratic easing out - decelerating to zero velocity
    easeOutQuad: (t: number, b: number, c: number, d: number) => {
        t /= d;
        return -c * t * (t - 2) + b;
    },
    // quadratic easing in/out - acceleration until halfway, then deceleration
    easeInOutQuad: (t: number, b: number, c: number, d: number) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    },
    // cubic easing in - accelerating from zero velocity
    easeInCubic: (t: number, b: number, c: number, d: number) => {
        t /= d;
        return c * t * t * t + b;
    },
    // cubic easing out - decelerating to zero velocity
    easeOutCubic: (t: number, b: number, c: number, d: number) => {
        t /= d;
        t--;
        return c * (t * t * t + 1) + b;
    },
    // cubic easing in/out - acceleration until halfway, then deceleration    
    easeInOutCubic: (t: number, b: number, c: number, d: number) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    },
    // quartic easing in - accelerating from zero velocity
    easeInQuart: (t: number, b: number, c: number, d: number) => {
        t /= d;
        return c * t * t * t * t + b;
    },
    // quartic easing out - decelerating to zero velocity
    easeOutQuart: (t: number, b: number, c: number, d: number) => {
        t /= d;
        t--;
        return -c * (t * t * t * t - 1) + b;
    },
    // quartic easing in/out - acceleration until halfway, then deceleration
    easeInOutQuart: (t: number, b: number, c: number, d: number) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t * t + b;
        t -= 2;
        return -c / 2 * (t * t * t * t - 2) + b;
    },
    // quintic easing in - accelerating from zero velocity
    easeInQuint: (t: number, b: number, c: number, d: number) => {
        t /= d;
        return c * t * t * t * t * t + b;
    },
    // quintic easing out - decelerating to zero velocity
    easeOutQuint: (t: number, b: number, c: number, d: number) => {
        t /= d;
        t--;
        return c * (t * t * t * t * t + 1) + b;
    },
    // quintic easing in/out - acceleration until halfway, then deceleration    
    easeInOutQuint: (t: number, b: number, c: number, d: number) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t * t * t + 2) + b;
    },
    // sinusoidal easing in - accelerating from zero velocity
    easeInSine: (t: number, b: number, c: number, d: number) => {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    // sinusoidal easing out - decelerating to zero velocity
    easeOutSine: (t: number, b: number, c: number, d: number) => {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    // sinusoidal easing in/out - accelerating until halfway, then decelerating 
    easeInOutSine: (t: number, b: number, c: number, d: number) => {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    // exponential easing in - accelerating from zero velocity
    easeInExpo: (t: number, b: number, c: number, d: number) => {
        return c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    // exponential easing out - decelerating to zero velocity 
    easeOutExpo: (t: number, b: number, c: number, d: number) => {
        return c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    //  exponential easing in/out - accelerating until halfway, then decelerating
    easeInOutExpo: (t: number, b: number, c: number, d: number) => {
        t /= d / 2;
        if (t < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        t--;
        return c / 2 * (-Math.pow(2, -10 * t) + 2) + b;
    },
    // circular easing in - accelerating from zero velocity
    easeInCirc: (t: number, b: number, c: number, d: number) => {
        t /= d;
        return -c * (Math.sqrt(1 - t * t) - 1) + b;
    },
    // circular easing out - decelerating to zero velocity
    easeOutCirc: (t: number, b: number, c: number, d: number) => {
        t /= d;
        t--;
        return c * Math.sqrt(1 - t * t) + b;
    },
    // circular easing in/out - acceleration until halfway, then deceleration
    easeInOutCirc: (t: number, b: number, c: number, d: number) => {
        t /= d / 2;
        if (t < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        t -= 2;
        return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
    }
};

const selectEasing = (easing: any) => {
    if (easing !== undefined) {
        if (typeof easing === 'function') return easing;
        else {
            switch (easing as Easing) {
                case Easing.easeOutQuad: return EasingFunc.easeOutQuad;
                case Easing.easeInOutQuad: return EasingFunc.easeInOutQuad;
                case Easing.easeInCubic: return EasingFunc.easeInCubic;
                case Easing.easeOutCubic: return EasingFunc.easeOutCubic;
                case Easing.easeInOutCubic: return EasingFunc.easeInOutCubic;
                case Easing.easeInQuart: return EasingFunc.easeInQuart;
                case Easing.easeOutQuart: return EasingFunc.easeOutQuart;
                case Easing.easeInOutQuart: return EasingFunc.easeInOutQuart;
                case Easing.easeInQuint: return EasingFunc.easeInQuint;
                case Easing.easeOutQuint: return EasingFunc.easeOutQuint;
                case Easing.easeInOutQuint: return EasingFunc.easeInOutQuint;
                case Easing.easeInSine: return EasingFunc.easeInSine;
                case Easing.easeOutSine: return EasingFunc.easeOutSine;
                case Easing.easeInOutSine: return EasingFunc.easeInOutSine;
                case Easing.easeInExpo: return EasingFunc.easeInExpo;
                case Easing.easeOutExpo: return EasingFunc.easeOutExpo;
                case Easing.easeInOutExpo: return EasingFunc.easeInOutExpo;
                case Easing.easeInCirc: return EasingFunc.easeInCirc;
                case Easing.easeOutCirc: return EasingFunc.easeOutCirc;
                case Easing.easeInOutCirc: return EasingFunc.easeInOutCirc;
                default: return EasingFunc.linear;
            }
        }
    }
    return EasingFunc.linear;
};


type EaseFunction = (counter: number, from: number, to: number, steps: number) => number;

export interface MoveProps {
    from: number | any;
    to: number | any;
    element: (prev: any, curr: any) => any;
    anim: boolean;

    // milliseconds default 1000
    time?: number;
    // 30 
    frameRate?: number;
    easing?: Easing | EaseFunction;
    resetAtTheEnd?: boolean;
    onEndMove?: () => void;
}

interface MoveState {
    old: MoveProps | undefined;
    easeFunction: EaseFunction;
    changed: boolean;
    tipof: string;
    counter: number;
    steps: number;
    prev: any;
    curr: any;
}

export class Move extends React.Component<MoveProps, MoveState> {

    private moveFun: () => void;
    private idInterval: NodeJS.Timer;
    private started: boolean = false;
    private ended: boolean = false;

    constructor(props: MoveProps) {
        super(props);
        this.moveFun = this.move.bind(this);
        this.state = {
            old: undefined,
            easeFunction: selectEasing(Easing.linear),
            changed: false,
            tipof: 'number',
            counter: 0,
            steps: 0,
            prev: props.from,
            curr: props.from,
        };
    }

    static getDerivedStateFromProps(nextProps: MoveProps, prevState: MoveState): MoveState {
        let tipof: string = prevState.tipof;
        let changed: boolean = false;
        let old: MoveProps | undefined = prevState.old;
        if (old === undefined) {
            changed = true;
        } else {
            changed = old.from !== nextProps.from
                || old.to !== nextProps.to
                || old.frameRate !== nextProps.frameRate
                || old.resetAtTheEnd !== nextProps.resetAtTheEnd
                || old.time !== nextProps.time;

        }
        if (changed) {
            tipof = typeof (nextProps.from);
            old = { ...nextProps };
        }

        return {
            ...prevState,
            easeFunction: selectEasing(nextProps.easing),
            tipof: tipof,
            changed: changed,
            old: old
        };
    }



    public componentDidMount(): void {
        this.checkChanged();
    }
    public componentDidUpdate(): void {
        this.checkChanged();
    }
    public componentWillUnmount(): void {
        this.removeTick();
    }

    public render(): JSX.Element {
        return this.getElement();
    }

    private getElement(): any {
        if (this.props.element) {
            return this.props.element(this.state.prev, this.state.curr);
        }
        return '';
    }

    private move(): void {
        const { to, from } = this.props;
        const { steps, tipof, easeFunction } = this.state;
        let counter: number = this.state.counter;
        if (counter < steps) {
            if (to !== undefined && from !== undefined) {
                counter++;
                if (tipof === 'number') {
                    let prev: number = this.state.curr;
                    let curr: number = easeFunction(counter, 0, to - from, steps) + from;
                    if (counter === steps) {
                        curr = to;
                        this.ended = true;
                    }
                    this.setState({
                        ...this.state,
                        prev: prev,
                        curr: curr,
                        counter: counter
                    });

                } else if (tipof === 'object') {
                    let prevProp: any = this.state.curr;
                    let newCur: any = { ...prevProp };
                    for (const key in from) {
                        if (from.hasOwnProperty(key) && to.hasOwnProperty(key)) {
                            let fromProp: number = from[key];
                            let toProp: number = to[key];
                            let currProp: number = easeFunction(counter, 0, toProp - fromProp, steps) + fromProp;
                            if (counter === steps) {
                                currProp = toProp;
                                this.ended = true;
                            }
                            newCur[key] = currProp;
                        }
                    }
                    this.setState({
                        ...this.state,
                        prev: prevProp,
                        curr: newCur,
                        counter: counter
                    });
                }
            }
        }
    }

    private totalTime(): number {
        const { time } = this.props;
        return time === undefined ? 1000 : time;
    }
    private frameRT(): number {
        const { frameRate } = this.props;
        return frameRate === undefined ? 30 : frameRate;
    }

    private checkChanged(): void {
        const { changed } = this.state;
        const { from } = this.props;
        if (changed) {
            this.closeTick();
            let step: number = this.frameRT() * this.totalTime() / 1000;
            this.started = false;
            this.ended = false;
            this.setState({
                ...this.state,
                changed: false,
                counter: 0,
                steps: step,
                prev: from,
                curr: from
            });
        } else if (this.ended && this.started) {
            const { resetAtTheEnd } = this.props;
            this.closeTick();
            if (this.props.onEndMove !== undefined) this.props.onEndMove();
            this.started = false;
            this.ended = false;
            if (!!resetAtTheEnd) {
                this.setState({ ...this.state, counter: 0, prev: from, curr: from });
            }
        } else {
            const { anim } = this.props;
            if (anim) this.startTick();
            else this.closeTick();
        }
    }
    private closeTick(): void {
        if (this.started) {
            this.started = false;
            this.removeTick();
        }
    }

    private startTick(): void {
        if (!this.started && !this.ended) {
            this.started = true;
            this.idInterval = setInterval(this.moveFun, this.totalTime() / this.state.steps);
        }
    }
    private removeTick(): void {
        clearInterval(this.idInterval);
    }

}
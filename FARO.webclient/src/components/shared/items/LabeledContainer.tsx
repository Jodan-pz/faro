import * as React from 'react';
import { ItemValue } from '../../../actions/model';
import '../../../styles/items/items.css';
import { Segment } from 'semantic-ui-react';

interface LabeledContainerProps extends ItemValue<any> {
    defaultValue?: any;
    label?: string;
    labelPosition?: 'top' | 'left';
    labelColor?: string; 
}
export class LabeledContainerItem extends React.Component<LabeledContainerProps, {}> {

    shouldComponentUpdate(nextProps: LabeledContainerProps, nextState: {}): boolean {
        const { value, disabled, label, labelPosition } = this.props;
        if (
            value === undefined
            || value !== nextProps.value
            || disabled !== nextProps.disabled
            || label !== nextProps.label
            || labelPosition !== nextProps.labelPosition
        ) return true;
        return false;
    }

    listenerItemChange = (name: string | number, value: any) => {
        if (this.props.onChange) {
            this.props.onChange(name, value);
        }
    }
    render() {
        const { name, label, labelPosition, children, disabled, value, style, className, defaultValue, labelColor } = this.props;
        let element: any = null;
        let itemChildren: any[] = React.Children.toArray(children);
        if (React.isValidElement(itemChildren[0])) element = itemChildren[0];
        if (element === null) return null;

        let tempName: any = element && element.props && element.props.name || '';
        let tempVal: any = element && element.props && element.props.value || defaultValue;
        let onChange: any = element && element.props && element.props.onChange || undefined;

        let props: ItemValue<any> = {
            disabled: disabled,
            name: name === undefined ? tempName : name,
            onChange: onChange === undefined ? (name: string | number, newValue: any) => this.listenerItemChange(name, newValue) : onChange,
            value: value === undefined ? tempVal : value
        };

        let cloneElement: any = React.cloneElement(element, props);
        let isLeft: boolean = labelPosition !== undefined && labelPosition === 'left';
        let margin: string = '3px';
        let cssSegment: React.CSSProperties = {
            width: '100%',
            margin: margin,
            padding: '0px',
            backgroundColor: '#E8E8E8',
            display: isLeft ? 'flex' : 'block',
            ...style
        };

        let cssSpan: React.CSSProperties = isLeft ? { margin: margin, marginTop: 'auto', marginBottom: 'auto' } : { margin: margin };
        let cssCont: React.CSSProperties = isLeft ? { ...cssSpan, paddingTop: margin, paddingBottom: margin, width: '100%' } : { margin: margin }; 
        let color: string = labelColor === undefined ? 'gray' : labelColor;
        return (
            <Segment style={cssSegment} className={className}>
                <div style={cssSpan}>
                    <span style={{ color: color }}>{label}</span>
                </div>
                <div style={cssCont}>
                    {cloneElement}
                </div>
            </Segment>
        );
    }
}

/*
export class LabeledContainerItem extends React.Component<LabeledContainerProps, {}> {
    constructor(props: LabeledContainerProps) {
        super(props);
    }

    listenerItemChange = (name: string | number, value: any) => {
        if (this.props.onChange) {
            this.props.onChange(name, value);
        }
    }

    render() {
        const { children, label, value, disabled } = this.props;
        let element: any = null;
        let itemChildren: any[] = React.Children.toArray(children);
        if (React.isValidElement(itemChildren[0])) {
            element = itemChildren[0];
        }
        if (element === null) return null;

        let props: ItemValue<any> = {
            name: this.props.name,
            disabled: disabled,
            onChange: (name: string | number, newValue: any) => this.listenerItemChange(name, newValue),
            value: value
        };
        let cloneElement: any = React.cloneElement(element, props);

        let clzz: string = this.props.className ? this.props.className : 'labeledContainerBox';
        let style: React.CSSProperties = this.props.style ? this.props.style : {};

        let elemntLabel: any = undefined;
        if (label !== undefined) elemntLabel = (<div style={{ ...(this.props.styleLabel || {}) }} className={'label'}>{label}</div>);

        return (
            <div className={clzz} style={style}>
                {elemntLabel && elemntLabel}
                <div className={'labelContent'} style={this.props.styleInput || {}}>{cloneElement}</div>
            </div>
        );
    }
}
*/

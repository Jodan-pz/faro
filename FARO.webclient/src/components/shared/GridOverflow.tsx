import * as React from 'react';

interface FlexProps extends React.Props<any> {
    style?: any;
    className?: string;
    fluid?: boolean;
}
interface FlexContainerProps extends FlexProps {
    direction?: 'column' | 'row';
}
interface FlexItemProps extends FlexProps {
    flex?: string;
    fluid?: boolean;
}
interface OverflowItemProps extends FlexProps {
    reference?: any;
}
export class FlexContainer extends React.PureComponent<FlexContainerProps> {
    static FlexItem = (props: FlexItemProps) => {
        let { style, fluid, flex, ...others } = props;
        if (fluid) flex = '1 1 100%';
        return <div {...others} style={{ flex: flex, ...style }} />;
    }
    static FlexOverflowItem = (props: OverflowItemProps) => {
        const { reference, children, ...other } = props;
        return (
            <FlexContainer.FlexItem {...other} style={{ overflow: 'hidden' }} fluid >
                <OverflowItem reference={reference} children={children}/>
            </FlexContainer.FlexItem >
        );
    }
    render() {
        const { style, fluid = true, direction = 'column', ...others } = this.props;
        return <div {...others} style={{ display: 'flex', flexDirection: direction, height: fluid ? '100%' : '', ...style }} />;
    }
}
export const OverflowItem = (props: OverflowItemProps) => {
    const { reference, ...others } = props;
    return <div {...others} ref={reference} style={{ overflowY: 'auto', overflowX: 'auto', height: '100%' }} className={`${others.className || ''} widget overflow`}/>;
}; 

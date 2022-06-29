import * as React from 'react';
import { Icon, Menu, Feed, MenuProps, MenuItem, SemanticCOLORS } from 'semantic-ui-react';
import { ConfirmWidget } from './DialogWidget';
import { Link } from 'app-support';
import '../../styles/headerMenu.css';

export interface MenuWidgetProps extends MenuProps {
    header?: React.ReactNode;
    icon?: any;
    children?: React.ReactNode;
    
}
export interface MenuEditabledWidgetProps extends MenuWidgetProps {
    disabled?: boolean;
    modified?: boolean;
    onDelete?: () => void;
    onCancel?: () => void;
    onSave?: () => void;
    onEdit?: () => void;
}
export interface MenuAdvancedWidgetProps {
    loader?: any;
    title?: any;
    meta?: any;
    activeKey?: string;
    items: any[];
    size?: 'small' | 'large';
    className?: string;
}

export const HeaderMenuWidget = (props: MenuWidgetProps) => {
    const { header, icon, children, modified, ...menuPros } = props;

    menuPros.className = (`${menuPros.className || ''} headermenu widget`).trim();
    let css: React.CSSProperties   = modified ? {backgroundColor: '#ffe18f' } : {};
    const childrenLeft = React.isValidElement(header) ? header : 
        (   
            <Menu.Menu position="left">
                <MenuItem>
                    {icon && <Icon name={icon} />}
                    {header}
                </MenuItem>
            </Menu.Menu>
        );
    return (
        <div className={'headermenuTest'} >
            <Menu attached="top" borderless  style={css} {...menuPros}>
                {childrenLeft}
                <Menu.Menu position="right" style={{ paddingRight: '5px' }}>
                    {children}
                </Menu.Menu>
            </Menu>
        </div>

    );
};

export const dialogMenuWidget = (modified: boolean, content: string, action?: () => void, menuIcon?: string, question?: any, style?: any, force: boolean = false) => {
    if (action) {
        if ((modified && question) || force) {
            return <ConfirmWidget children={question} onConfirm={action} trigger={<Menu.Item content={content} icon={menuIcon} style={style} />} />;
        }
        return <Menu.Item content={content} icon={menuIcon} onClick={action} style={style} />;
    }
    return null;
};

export const HeaderMenuEditabledWidget = (props: MenuEditabledWidgetProps) => {
    const { disabled, modified, onCancel, onEdit, onEditJSON, onDelete, onSave, children, ...menuProps } = props;

    return (
        <HeaderMenuWidget {...menuProps}>
            {children}
            {dialogMenuWidget(modified || false, 'Delete', onDelete, 'cancel', 'Are you sure you want delete current item?', { color: 'red' }, true)}
            {disabled && dialogMenuWidget(modified || false, 'Edit', onEdit, 'edit')}
            {disabled && dialogMenuWidget(modified || false, 'JSON', onEditJSON, 'file alternate outline')}
            {!disabled && dialogMenuWidget(modified || false, 'Save', onSave, 'save', 'Are you sure you want to save the changes?', { color: 'green' })}
            {!disabled && dialogMenuWidget(modified || false, 'Cancel', onCancel, 'reply', 'Are you sure you want to loose your changes?')}
        </HeaderMenuWidget>
    );
};
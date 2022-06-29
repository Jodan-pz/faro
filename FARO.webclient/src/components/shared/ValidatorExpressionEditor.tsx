import { ItemValue } from 'src/actions/model';
import * as React from 'react';

import AceEditor from 'react-ace';
import { acequire } from 'brace';

import { KEYTAG, EXPRTAG, DECTAG } from '../Utils';

import 'brace/mode/plain_text';
import 'brace/mode/sql';
import 'brace/snippets/batchfile';
import 'brace/ext/language_tools';

import 'brace/theme/sqlserver';
import 'brace/theme/twilight';

import 'brace/mode/java';

type FuncDesc = {
    name: string;
    args?: Array<string>;
    ret?: string;
};

type Vars = {
    value: string;
    meta: string;
    caption: string;
};

const keyWordsDesc: Array<FuncDesc> = [
    {
        name: 'AND'
    },
    {
        name: 'OR'
    },
    {
        name: 'NOT'
    },
    {
        name: 'Substring',
        args: ['{value}', 'int from', 'int? length'],
        ret: 'string (string value, int from, int? length)'
    },
    {
        name: 'Coalesce',
        args: ['params'],
        ret: 'object (params object[] parms)'
    },
    {

        name: 'Iif',
        args: ['condition', 'trueReturn', 'falseReturn'],
        ret: 'object (bool condition, object trueReturn, object falseReturn)'
    },
    {

        name: 'ParseDate',
        args: ['string dateToParse', 'string format'],
        ret: 'string (string dateToParse, string format)'
    },
    {

        name: 'IsGreaterInMonths',
        args: ['dateFrom', 'dateTo', 'months'],
        ret: 'bool (object dateFrom, object dateTo, int months)'
    },
    {

        name: 'IfNull',
        args: ['{value}', '{defaultValue}'],
        ret: 'object (object value, object defaultValue)'
    },
    {

        name: 'IsNull',
        args: ['{value}'],
        ret: 'bool (object value)'
    },
    {

        name: 'IsNullOrEmpty',
        args: ['{value}'],
        ret: 'bool (object value)'
    },
    {

        name: 'NullVar',
        args: ['{value}'],
        ret: 'NullVariable (object value)'
    }
];


const TextHighlightRules: any = acequire('ace/mode/text_highlight_rules').TextHighlightRules;

class CustomHighlightRules extends TextHighlightRules {
    public static LISTVARS: Array<string>;
    constructor() {
        super();
        let keywords = '';
        keyWordsDesc.forEach(k => {
            if (k.args === undefined) keywords += k.name + '|';
        });

        let builtinConstants = 'true|false|';

        if (CustomHighlightRules.LISTVARS) CustomHighlightRules.LISTVARS.forEach(c => builtinConstants += c + '|');


        let builtinFunctions = '';
        keyWordsDesc.forEach(k => {
            if (k.ret !== undefined) builtinFunctions += k.name + '|';
        });

        // let dataTypes = 'int|numeric|decimal|date|varchar|char|bigint|float|double|bit|binary|text|set|timestamp|money|real|number|integer';
        let dataTypes = '';

        let keywordMapper = this.createKeywordMapper({
            'support.function': builtinFunctions,
            'keyword': keywords,
            'constant.language': builtinConstants,
            'storage.type': dataTypes
        }, 'identifier', true);

        this.$rules = {
            'start': [{
                token: 'comment',
                regex: '--.*$'
            }, {
                token: 'comment',
                start: '/\\*',
                end: '\\*/'
            }, {
                token: 'string',           // " string
                regex: '".*?"'
            }, {
                token: 'string',           // ' string
                regex: '\'.*?\''
            }, {
                token: 'string',           // ` string (apache drill)
                regex: '`.*?`'
            }, {
                token: 'constant.numeric', // float
                regex: '[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b'
            }, {
                token: keywordMapper,
                regex: '[a-zA-Z_$][a-zA-Z0-9_$]*\\b'
            }, {
                token: 'keyword.operator',
                regex: '\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|='
            }, {
                token: 'paren.lparen',
                regex: '[\\(]'
            }, {
                token: 'paren.rparen',
                regex: '[\\)]'
            }, {
                token: 'text',
                regex: '\\s+'
            }]
        };
        this.normalizeRules();
    }
}



class CustomSqlMode extends acequire('ace/mode/java')
    .Mode {
    constructor(consts: Array<string>) {
        super();
        // no buono ma per adesso va bene così
        CustomHighlightRules.LISTVARS = consts || [];
        this.HighlightRules = CustomHighlightRules;
    }
}

const thereIsChar = (str: string, char: string, from: number, left: boolean = true) => {
    if (str && char && from >= 0) {
        let len: number = str.length;
        for (let i: number = left ? from - 1 : from; left ? i >= 0 : i < len; i = (left ? i - 1 : i + 1)) {
            let curr = str.charAt(i);
            if (curr === ' ') continue;
            if (curr !== char) return false;
            if (curr === char) return true;
        }
    }
    return false;
};
const isVar = (session: any, pos: { row: number, column: number }) => {
    if (session.doc && session.doc.$lines && session.doc.$lines.length > 0) {
        let line: string = session.doc && session.doc.$lines[pos.row];
        let thereIsLeft: boolean = thereIsChar(line, '{', pos.column);
        let thereIsRight: boolean = thereIsChar(line, '}', pos.column, false);
        return thereIsLeft && thereIsRight;
    }
    return false;
};
const createKeyWord = () => {
    return keyWordsDesc.map((v, indx) => {
        let type: string = v.args !== undefined || v.ret !== undefined ? 'fun' : '';
        let value: string = v.name;
        if (type === 'fun') {
            let temp: string = '';
            if (v.args && v.args.length > 0) {
                let len: number = (v.args as Array<string>).length;
                for (let i: number = 0; i < len; i++) {
                    temp += v.args[i];
                    // temp += `{${v.args[i]}}`;
                    if (i < len - 1) temp += '; ';
                }
            }
            value = `${value}(${temp})`;
        }
        return {
            value: value,
            type: type,
            score: 1000,
            args: v.args,
            caption: v.name,
            content: v.ret || ''
        };
    });
};


interface ExpressionEditorProps extends ItemValue<string> {
    fields?: Array<string>;
}

export class ValidatorExpressionEditor extends React.Component<ExpressionEditorProps, {}> {

    ace: any;

    setAce = (varsList: Array<Vars>) => {

        const langTools = acequire('ace/ext/language_tools');

        let customCompleters = {

            getCompletions: (editor: any, session: any, pos: any, prefix: any, callback: any) => {
                let vars: boolean = isVar(session, pos);
                if (!vars) {
                    callback(null, createKeyWord());
                } else {
                    if (varsList) {
                        callback(null, varsList);
                    }
                }
            },
            getDocTooltip: function (item: any) {
                if (item.type === 'fun' && !item.docHTML) {
                    item.docHTML = [
                        '<b>', item.content, '</b>'
                    ].join('');
                }
            }
        };

        langTools.setCompleters([customCompleters]);

    }
    onChange = (newvalue: string, event?: any) => {
        if (this.props.onChange) {
            this.props.onChange(this.props.name || '', newvalue);
        }
    }

    render() {
        const { value } = this.props;

        return (
            <AceEditor
                ref={(r) => {
                    // if (!this.ace) {
                    this.ace = r;
                    if (this.ace) {
                        const { fields } = this.props;
                        let listVars: Array<Vars> = [];
                        let listNameVars: Array<string> = [];

                        let imgFields = fields ? fields : [];
                        if (imgFields && imgFields.length > 0) {
                            imgFields.forEach(f => {
                                let iskey: boolean = f.startsWith(KEYTAG);
                                let isExpr: boolean = f.startsWith(EXPRTAG);
                                let isDec: boolean = f.startsWith(DECTAG);
                                let hasTag: boolean = iskey || isExpr || isDec;
                                let tag: string = iskey ? KEYTAG : (isExpr ? EXPRTAG : (isDec ? DECTAG : ''));
                                let name: string = hasTag ? f.substring(tag.length, f.length) : f;
                                let type: string = iskey ? 'KEY' : (isExpr ? 'EXP' : (isDec ? 'DEC' : ''));
                                listVars.push({ value: f, meta: type, caption: name });
                                listNameVars.push(name);
                            });
                        }

                        const customMode = new CustomSqlMode(listNameVars);
                        this.ace.editor.getSession().setMode(customMode);
                        this.setAce(listVars);
                    }
                    // }
                }}

                maxLines={20}
                minLines={5}
                mode={'sql'}
                theme={'sqlserver'}
                width="100%"
                height="100%"
                style={{ minHeight: '30px' }}
                name={name}
                readOnly={false}
                value={value}
                onChange={this.onChange}
                fontSize={14}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableSnippets: true,
                    showLineNumbers: true,
                }}
            />);
    }
}
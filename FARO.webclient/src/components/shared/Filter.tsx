import * as React from 'react';
import { ArgumentFilter } from 'src/actions/model';
import { Input, InputOnChangeData, Button, Dropdown, DropdownItemProps } from 'semantic-ui-react';
import { FilterMatchMode, TagsMatchMode } from 'mglib-faro.webclient/MGLib_FARO.WEBAPI';
import { updateFilter } from '../../actions';
import '../../styles/image/imageKeySelector.css';
import { appConnector } from 'app-support';
import * as reducers from '../../reducers';

interface FilterProps {
    onSearch?: () => void;
}
interface FilterState {
    search: boolean;
    clean: boolean;
}


const conn = appConnector<FilterProps>()(
    (s, p) => ({
        currFilter: reducers.getFilter(s)
    }),
    {
        updateFilter
    }
);


class FilterComp extends conn.StatefulCompo<FilterState> {
    private defaultFilter: ArgumentFilter = {
        filter: '',
        filterMatchMode: FilterMatchMode.Contains,
        tags: [],
        tagsMatchMode: TagsMatchMode.Any,
        pageIndex: undefined,
        pageSize: undefined
    };

    constructor(props: any) {
        super(props);
        this.state = { search: false, clean: false };
    }

    componentDidUpdate(prevProps: any, prevState: any): void {
        const { search, clean } = this.state;
        if (clean) {
            this.setState({ search: true, clean: false }, () => {
                let filt: ArgumentFilter = {
                    filter: '',
                    filterMatchMode: FilterMatchMode.Contains,
                    tags: [],
                    tagsMatchMode: TagsMatchMode.Any,
                    pageIndex: undefined,
                    pageSize: undefined
                };
                this.updateFilter(filt);
            });
        } else if (search) {
            this.setState({ ...this.state, search: false }, () => {
                // let filter: ArgumentFilter = { ... (this.props.currFilter || this.defaultFilter) };
                if (this.props.onSearch) {
                    this.props.onSearch();
                }
            });
        }
    }

    updateFilter = (newFilter: ArgumentFilter) => {
        this.props.updateFilter(newFilter);
    }

    keyPress = (ev: any) => {
        const { charCode } = ev;
        if (charCode === 13) {
            ev.preventDefault();
            this.setState({ search: true });
        }
    }

    changeFilter = (prop: keyof ArgumentFilter, value: any) => {
        this.updateFilter({ ...(this.props.currFilter || this.defaultFilter), [prop]: value });
    }

    iconsName = () => {
        let icons: string[] = [];
        icons[FilterMatchMode.Exact] = 'circle';
        icons[FilterMatchMode.Contains] = 'dot circle outline';
        icons[FilterMatchMode.StartsWith] = 'arrow alternate circle right outline';
        return icons;
    }
    render() {
        const { currFilter } = this.props;
        const { filter, filterMatchMode, tags, tagsMatchMode } = currFilter || this.defaultFilter;

        let fmatchMode: number = filterMatchMode !== undefined ? filterMatchMode : FilterMatchMode.Contains;
        let icons: string[] = this.iconsName();
        let selectedIcon: string = icons[fmatchMode];

        let options: Array<DropdownItemProps> = (tags || []).map((tag: string, index: number) => {
            return {
                key: index,
                text: tag,
                value: tag
            } as DropdownItemProps;
        });

        let currentValues: Array<any> = [];
        options.forEach(el => {
            if (tags && currentValues.length < 5) {
                if (tags.find((t: string) => t === el.value) !== undefined) {
                    currentValues.push(el.value);
                }
            }
        });
        let len: number = currentValues.join('').length;
        let widthDiv: number = (len * 12);
        if (widthDiv < 400) widthDiv = 400;
        if (widthDiv > 850) widthDiv = 850;
        let optionsTags: Array<DropdownItemProps> = [
            { key: 0, text: TagsMatchMode[TagsMatchMode.All], value: TagsMatchMode.All },
            { key: 1, text: TagsMatchMode[TagsMatchMode.Any], value: TagsMatchMode.Any }
        ];
        return (
            <div className="filter"  >
                <div className="itemfilter">
                    <Input style={{ borderRadius: '0px' }} onKeyPress={this.keyPress} icon placeholder="Search..." value={filter || ''} onChange={(event: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => this.changeFilter('filter', data.value)}>
                        <input style={{ borderRadius: '0px' }} />
                    </Input>
                    <Dropdown
                        style={{ margin: '0px', backgroundColor: 'white', borderRadius: '0px' }}
                        icon={selectedIcon}
                        button
                        className="icon"
                    >
                        <Dropdown.Menu>
                            <Dropdown.Header icon="search" content="Match mode" />
                            <Dropdown.Divider />
                            <Dropdown.Item icon={icons[FilterMatchMode.Exact]} text={FilterMatchMode[FilterMatchMode.Exact]} value={0} onClick={() => this.changeFilter('filterMatchMode', FilterMatchMode.Exact)} />
                            <Dropdown.Item icon={icons[FilterMatchMode.Contains]} text={FilterMatchMode[FilterMatchMode.Contains]} value={1} onClick={() => this.changeFilter('filterMatchMode', FilterMatchMode.Contains)} />
                            <Dropdown.Item icon={icons[FilterMatchMode.StartsWith]} text={FilterMatchMode[FilterMatchMode.StartsWith]} value={2} onClick={() => this.changeFilter('filterMatchMode', FilterMatchMode.StartsWith)} />
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className="itemfilter" style={{ width: widthDiv + 'px' }}>
                    <Dropdown

                        placeholder="Add tags"
                        options={options}
                        search
                        selection
                        fluid
                        multiple
                        allowAdditions
                        value={currentValues}
                        onChange={(event: React.SyntheticEvent<HTMLElement>, { value }) => this.changeFilter('tags', value as Array<string>)}
                    />
                    <Dropdown
                        style={{ width: '65px', backgroundColor: 'white' }}
                        icon=""
                        button
                        options={optionsTags}
                        value={tagsMatchMode}
                        onChange={(event: React.SyntheticEvent<HTMLElement>, { value }) => this.changeFilter('tagsMatchMode', value as TagsMatchMode)}
                    />
                </div>

                <div className="itemfilter"><Button style={{ margin: '0px', backgroundColor: 'white' }} icon="erase" onClick={() => this.setState({ ...this.state, clean: true })} /></div>
                <div className="itemfilter"><Button style={{ margin: '0px', backgroundColor: 'white' }} icon="search" onClick={() => this.setState({ ...this.state, search: true })} /></div>
            </div>);
    }
}



export const Filter = conn.connect(FilterComp);
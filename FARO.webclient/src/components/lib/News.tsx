import * as React from 'react';
import * as xml2js from 'xml2js';
import { Transition, Dropdown, Icon } from 'semantic-ui-react';

const STYLE_ELEMENT: React.CSSProperties = {
    backgroundColor: '#2185D0',
    color: 'white',
    fontWeight: 'bold'
};

interface Item {
    quote: string;
    date: string;
    url: string;

}

interface NewsProp {
    seconds?: number;
}

interface NewsState {
    feed: string;
    quote: Item;
    enabled: boolean;
    animate: boolean;
}


const parseString = xml2js.parseString;



export default class News extends React.Component<NewsProp, NewsState> {
    private currentFeed: string = '';
    private indexTimeOut: NodeJS.Timer;
    private ddata: Item[] = [{ quote: '', date: '', url: '' }];

    private option: Array<any> = [
        { value: 'https://www.gazzetta.it/rss/calcio.xml', text: 'Gazzetta', key: 'Gazzetta' },
        { value: 'http://xml2.corriereobjects.it/rss/homepage.xml', text: 'Corriere', key: 'Corriere' },
        { value: 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', text: 'New York Times', key: 'New York Times' }
    ];
    constructor(props: any) {
        super(props);
        this.currentFeed = this.option[0].value;
        this.state = { quote: this.ddata[0], enabled: true, animate: true, feed: this.currentFeed };
        this.loadData(this.currentFeed);
    }

    tick = () => {
        if (this.state.enabled && this.ddata.length > 0) {
            clearTimeout(this.indexTimeOut);
            this.indexTimeOut = setTimeout(
                () => {
                    const i = Math.floor(Math.random() * this.ddata.length);
                    this.setState({ animate: !this.state.animate, quote: this.ddata[i] }, this.tick);
                },
                this.props.seconds || 10000
            );
        }
    }

    loadData(feed: string): void {
        fetch(feed)
            .then(r => r.text())
            .then(r => {
                parseString(r, (err: any, res: any) => {
                    if (res) {
                        this.ddata = res.rss.channel[0].item.map((item: any) => {
                            let title: string = item.title[0];
                            if (item.category && item.category['0']) {
                                title = item.category['0']._ + ' ' + title;
                            }
                            return {
                                quote: title,
                                date: item.pubDate[0],
                                url: item.link[0]
                            };
                        });
                        if (this.ddata) {
                            this.tick();
                        }
                    }
                });
            });
    }

    componentDidUpdate(): void {
        if (this.state.feed && this.state.feed !== this.currentFeed) {
            this.currentFeed = this.state.feed;
            this.loadData(this.currentFeed);
        }
    }
    componentWillUnMount() {
        this.setState({ enabled: false });
    }

    render() {
        const { quote, url } = this.state.quote;
        return (
            <div style={{ display: 'flex', margin: 'auto' }}>
                {/*
                <Dropdown
                    trigger={<Icon circular name={'setting'} />}
                    options={this.option}
                    pointing={'top left'}
                    icon={null}
                    onChange={(event: React.SyntheticEvent, data: any) => {
                        this.setState({ feed: data.value });
                    }} 
                />
                */}
                <Transition visible={this.state.animate} animation="shake" duration={500}>
                    <div style={{ overflow: 'hidden', margin: 'auto', marginLeft: '5px', width: '200px' }}>
                        <a style={{ color: 'black', whiteSpace: 'nowrap' }} href={url} target="blank"><b>{quote || '...'}</b></a>
                    </div>
                </Transition>
            </div>
        );
    }
}





import * as React from 'react';
import { ImageEditor } from './ImageEditor';
import { ImageAggregatorsContainer } from './ImageAggregatorsContainer';
import { ImageModel } from 'src/actions/model';
import { Tab } from 'semantic-ui-react';
import ValidatorEditor from '../validators/ValidatorEditor';
import { ImageValidatorContainer } from './ImageValidatorsContainer';


interface ImageContainerEditorProps {
    onContinue?: (where: string) => void;
    onEdit?: (where: string, id: string) => void;
    id: string;
}


export class ImageContainerEditor extends React.Component<ImageContainerEditorProps, { nameImage: string }> {


    constructor(props: any) {
        super(props);
        this.state = { nameImage: '' };
    }
    changeName = (name: string) => {
        const { nameImage } = this.state;
        if (name && nameImage !== name) {
            this.setState({ nameImage: name });
        }
    }
    change = (item: ImageModel) => {
        this.changeName(item.name!);

    }
    render() {

        const panes: Array<any> = [
            {
                menuItem: 'Image', render: () => (
                    <Tab.Pane>
                        <ImageEditor
                            onEdit={(where: string, id: string) => this.props.onEdit && this.props.onEdit(where, id)}
                            onContinue={(where: string) => this.props.onContinue && this.props.onContinue(where)}
                            id={this.props.id}
                            onSave={(item: ImageModel) => this.changeName(item.name!)}
                        />
                    </Tab.Pane>)
            },
            // { menuItem: 'Validators', render: () => (
            //     <Tab.Pane>
            //         <ImageValidatorContainer idImage={this.props.id} nameImage={this.state.nameImage}/>
            //     </Tab.Pane>) },  
            {
                menuItem: 'Aggregators', render: () => (
                    <Tab.Pane>
                        <ImageAggregatorsContainer idImage={this.props.id} nameImage={this.state.nameImage} />
                    </Tab.Pane>)
            }
        ];

        return (<Tab panes={panes} />);
    }
}



/*

 <div style={{ display: 'flex', width: '100%' }}>
                <div style={{ width: w1 + '%' }}>
                    <ImageEditor onContinue={(where: string) => this.props.onContinue && this.props.onContinue(where)} id={this.props.id} onSave={(item: ImageModel) => this.changeName(item.name!)} />
                </div>

                <div style={{ height: '100%', width: wb + '%', backgroundColor: 'black', margin: mrg + '%' }} />

                <div style={{ width: w2 + '%' }}>
                    <ImageAggregatorsContainer idImage={this.props.id} nameImage={this.state.nameImage} />
                </div>
            </div>

*/
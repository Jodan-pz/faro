import * as React from 'react';
import * as reducers from '../../reducers';
import { appConnector } from 'app-support';
import { ImageModel, UNIQUE_IMAGE, ArgumentListImage } from '../../actions/model';
import { Segment, Modal, Button, Icon } from 'semantic-ui-react';
import { imageSearch, imageSearchClear } from '../../actions';
import { HeaderMenuWidget } from '../shared/MenuWidget';
import { DropValue } from '../shared/items/DropValue';
import { searchArgumetListImage } from '../Utils';

type DropImage = {
    id: string,
    name: string
};

interface AggregatorModalImageListProps {
    onSelectImage?: (image: { id: string, name: string }) => void;
    onCloseModal?: () => void;
}


const conn = appConnector<AggregatorModalImageListProps>()(
    (s, p) => ({
        imageList: reducers.getImageSearch(s, UNIQUE_IMAGE)
    }),
    {
        imageSearch,
        imageSearchClear,
    }
);

class AggregatorModalImageListComp extends conn.StatefulCompo<{ image: DropImage, selected: boolean }> {

    constructor(props: any) {
        super(props);
        this.state = { image: { id: '', name: '' }, selected: false };
    }
    componentDidMount() {
        const params: ArgumentListImage = searchArgumetListImage();
        this.props.imageSearch(params);
    }
    componentWillUnmount(): void {
        this.props.imageSearchClear(UNIQUE_IMAGE);
    }
    changeDrop = (newValue: DropImage) => {
        this.setState({ image: { ...newValue }, selected: true });
    }
    closeModal = () => {
        if (this.props.onCloseModal) {
            this.props.onCloseModal();
        }
    }

    confirmModal = () => {
        const { selected, image } = this.state;
        if (selected && image.id && image.name && this.props.onSelectImage) {
            this.props.onSelectImage(image);
        }
    }

    render() {
        const { imageList } = this.props;
        const { selected, image } = this.state;
        let items: DropImage[] = [];
        let currentValue: DropImage = image && image.id.length > 0 ? image : { name: '', id: '' };
        if (imageList && imageList.length > 0) {
            items = imageList.map((img: ImageModel) => {
                return {
                    id: img.id,
                    name: img.name
                } as DropImage;
            });
        }

        return (
            <Modal open closeOnEscape closeOnDimmerClick={false} onClose={() => this.closeModal()}>
                <Modal.Content>
                    <Segment>
                        <div><Icon name={'file outline'} />Select an image</div>
                        <DropValue
                            name={'drop'}
                            keyValue={'name'}
                            items={items}
                            selection
                            search
                            value={currentValue}
                            onChange={(name: string | number, newValue: any) => this.changeDrop(newValue)}
                        />
                    </Segment>
                </Modal.Content>
                <Modal.Actions>
                    <Button disabled={!selected} content="Confirm" onClick={(ev: any) => this.confirmModal()} />
                    <Button content="Close" onClick={(ev: any) => this.closeModal()} />
                </Modal.Actions>
            </Modal>);
    }


}


export const AggregatorModalImageList = conn.connect(AggregatorModalImageListComp);
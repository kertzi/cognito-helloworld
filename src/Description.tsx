import * as React from 'react';


interface IProps {
    countBy: number
}

interface IState {
    count: number
}


class Description extends React.PureComponent<IProps, IState> {
    public static defaultProps: Partial<IProps> = {
        countBy: 1
    }

    public state: IState = {
        count: 0
    }

    public increase = () => {
        this.setState({
            count: this.state.count + this.props.countBy
        });
    }

    public render() {
        const count: number = this.state.count;

        return (
            <div>
                Number {count}
            </div>
        );
    }

}

export default Description;
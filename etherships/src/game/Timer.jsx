import React, { Component } from 'react';

import { setInterval } from 'timers';

import { connect } from 'react-redux';

import { incrementSeconds } from '../actions/boardActions';

class Timer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            timer: null,
        };
    }

    componentDidMount() {
        const timer = setInterval(() => {
            if (this.props.board.seconds < this.props.countdown) {
                this.props.incrementSeconds();
            } else {
                clearInterval(this.state.timer);
            }

        }, 1000);

        this.setState({
            timer,
        });
    }

    componentWillUnmount() {
        if(!this.state.timer) {
            clearInterval(this.state.timer);
        }
    }

    formatTime = (countdown) => {
        if (countdown - this.props.board.seconds > 60) {
            const minutes = Math.floor((countdown - this.props.board.seconds) / 60);
            const sec = (countdown - this.props.board.seconds) % 60;

            return `${minutes} min ${sec} s left`;
        } else {
            return `${countdown - this.props.board.seconds}s left`;
        }
    }

    render() {
        const { countdown } = this.props;

        return (
            <div className="small-titles">
                { this.formatTime(countdown) }
            </div>
        );
    }
}

const mapStateToProps = (props) => ({
    ...props
});

const mapDispatchToProps = {
    incrementSeconds,
};
  
export default connect(mapStateToProps, mapDispatchToProps)(Timer);

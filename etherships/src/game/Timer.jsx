import React, { Component } from 'react';

import { setInterval } from 'timers';

class Timer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            timer: null,
            seconds: 0,
            countdown: props.countdown,
        };
    }

    componentDidMount() {
        const timer = setInterval(() => {
            if (this.state.seconds < this.state.countdown) {
                this.setState({
                    seconds: ++this.state.seconds
                });
            } else {
                // clearInterval(this.state.timer);
            }

        }, 1000);

        this.setState({
            timer,
        });
    }

    componentWillReceiveProps(newProps) {
        console.log('New Props', newProps);

        this.setState({
            countdown: newProps.countdown,
            seconds: 0,
        });
    }

    componentWillUnmount() {
        if(!this.state.timer) {
            clearInterval(this.state.timer);
        }
    }

    formatTime = (countdown) => {
        if (countdown - this.state.seconds > 60) {
            const minutes = Math.floor((countdown - this.state.seconds) / 60);
            const sec = (countdown - this.state.seconds) % 60;

            return `${minutes} min ${sec} s left`;
        } else {
            return `${countdown - this.state.seconds}s left`;
        }
    }

    render() {
        const { countdown } = this.state;

        return (
            <div className="grey-text-medium">
                { this.formatTime(countdown) }
            </div>
        );
    }
}

export default Timer;

import React, { Component } from 'react';

import { setInterval } from 'timers';

class Timer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            seconds: 0,
            timer: null,
        };
    }

    componentDidMount() {
        const timer = setInterval(() => {
            if (this.state.seconds < this.props.countdown) {
                this.setState({
                    seconds: this.state.seconds + 1
                });
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
        if (countdown - this.state.seconds > 60) {
            const minutes = Math.floor((countdown - this.state.seconds) / 60);
            const sec = (countdown - this.state.seconds) % 60;

            return `${minutes} min ${sec} s left`;
        } else {
            return `${countdown - this.state.seconds}s left`;
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


export default Timer;

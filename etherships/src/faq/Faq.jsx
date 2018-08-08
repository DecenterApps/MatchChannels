import React, { Component } from 'react';

import { browserHistory } from 'react-router/lib';

import './Faq.css';

class Faq extends Component {

    goBack = () => {
        browserHistory.push('/');
    };

    render() {
        return (
            <div className="faq-container">
                <div>
                    <button className="back-button" onClick={this.goBack}>back</button>
                    <div className='logo' />
                </div>

                <div className="question-title">
                    FAQ
                </div>

                <div className="question-area">
                    <div className="question">
                        <div className="question-title">How can I remove information about myself from Google's search results?</div>
                        <div className="question-text">
                            Google search results are a reflection of the content publicly available on the web. Search engines can’t remove content directly
                            from websites, so removing search results from Google wouldn’t remove the content from the web.
                            If you want to remove something from the web, you should contact the webmaster of the site
                            the content is posted on and ask him or her to make a change. Once the content has been
                            removed and Google has noted the update, the information will no longer appear in Google’s
                            search results. If you have an urgent removal request, you can also visit our help page for more informatio
                        </div>
                    </div>

                    <div className="question">
                        <div className="question-title">Are my search queries sent to websites when I click on Google Search results?</div>
                        <div className="question-text">
                            Google search results are a reflection of the content publicly available on the web.
                            Search engines can’t remove content directly from websites,
                            so removing search results from Google wouldn’t remove the content from the web.
                            If you want to remove something from the web, you should contact the webmaster of the site the content is posted
                            on and ask him or her to make a change. Once the content has been removed and Google has noted
                            the update, the information will no longer appear in Google’s search results. If you have an
                            urgent removal request, you can also visit our help page for more information
                        </div>
                    </div>

                    <div className="question">
                        <div className="question-title">Are my search queries sent to websites when I click on Google Search results?</div>
                        <div className="question-text">
                            Google search results are a reflection of the content publicly available on the web.
                            Search engines can’t remove content directly from websites,
                            so removing search results from Google wouldn’t remove the content from the web.
                            If you want to remove something from the web, you should contact the webmaster of the site the content is posted
                            on and ask him or her to make a change. Once the content has been removed and Google has noted
                            the update, the information will no longer appear in Google’s search results. If you have an
                            urgent removal request, you can also visit our help page for more information
                        </div>
                    </div>

                    <div className="question">
                        <div className="question-title">Are my search queries sent to websites when I click on Google Search results?</div>
                        <div className="question-text">
                            Google search results are a reflection of the content publicly available on the web.
                            Search engines can’t remove content directly from websites,
                            so removing search results from Google wouldn’t remove the content from the web.
                            If you want to remove something from the web, you should contact the webmaster of the site the content is posted
                            on and ask him or her to make a change. Once the content has been removed and Google has noted
                            the update, the information will no longer appear in Google’s search results. If you have an
                            urgent removal request, you can also visit our help page for more information
                        </div>
                    </div>
                </div>


            </div>
        )
    }
}

export default Faq;
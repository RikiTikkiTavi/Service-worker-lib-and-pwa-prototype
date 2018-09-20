import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";


class UpdateButton extends Component {

    state = {
        updateStatus: undefined
    };

    triggerUpdate() {
        fetch('/update-caches').then((r) => {
            r.text().then((rText) => {
                switch (rText) {
                    case '0':
                        this.setState({updateStatus: '0: No Update'});
                        break;
                    case '1':
                        this.setState({updateStatus: '1: Updating. Will notify, when ready'});
                        break;
                    case '404':
                        this.setState({updateStatus: '404: Error'})
                }
            })
        })
    }

    render() {
        if (this.state.updateStatus !== undefined) {
            return (
                <Fragment>
                    <button type="button" onClick={this.triggerUpdate.bind(this)} className="btn btn-primary">Update
                    </button>
                    <br/>
                    <div className="alert alert-primary" role="alert">{this.state.updateStatus}</div>
                </Fragment>
            )
        }
        return (
            <button type="button" onClick={this.triggerUpdate.bind(this)} className="btn btn-primary">Update</button>
        )
    }

}

UpdateButton.propTypes = {
    dispatch: PropTypes.func,
};

export default connect((state, props, dispatch) => ({
    dispatch
}))(UpdateButton);

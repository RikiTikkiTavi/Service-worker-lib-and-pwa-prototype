import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

class ServiceFullContent extends Component {
	render() {
		const {service} = this.props;

		return (
			<div className="container">
				<div className="row">
					<div className="col-12">
						<h2>{service.name}</h2>
					</div>
				</div>
				<div className="row">
					<div className="col-12">
						<p> {service.content} </p>
					</div>
				</div>
			</div>
		);
	}
}

ServiceFullContent.propTypes = {
	dispatch: PropTypes.func,
	service: PropTypes.object,
};

export default connect((state, props, dispatch) => ({
	dispatch
}))(ServiceFullContent);

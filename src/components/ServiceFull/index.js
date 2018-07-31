import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import ServiceFullContent from "./service-full-content";
import ServiceFullContentPreload from './service-full-content-preload';


class ServiceFull extends Component {

	render() {

		const {loading, services} = this.props;

		if(loading){
			return(
				<ServiceFullContentPreload/>
			)
		}

			let SERVICE = services
				.find((service) => service.id === parseInt(this.props.match.params.id));

		return (
			<ServiceFullContent service={SERVICE}/>
		);
	}
}

ServiceFull.propTypes = {
	dispatch: PropTypes.func,
	services: PropTypes.array,
	loading: PropTypes.bool
};

export default connect((state, props, dispatch) => ({
	dispatch
}))(ServiceFull);

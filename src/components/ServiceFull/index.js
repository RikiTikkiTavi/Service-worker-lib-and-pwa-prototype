import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import Header from "./../Header";
import emulateGetServices from '../ServiceList/list-of-services';
import ServiceFullContent from "./service-full-content";
import ServiceFullContentPreload from './service-full-content-preload';
import getListOfServices from '../../actions/getListOfServices'


class ServiceFull extends Component {

	constructor(props) {
		super(props);
		this.state = {
			SERVICE: {},
			loading: true
		};

	}

	componentDidMount() {
		console.log("DidMount")
		this._asyncRequest =
			getListOfServices()
				.then(SERVICES => {
					let SERVICE = SERVICES.find((service) => service.id === parseInt(this.props.match.params.id));
					this._asyncRequest = null;
					this.setState({SERVICE: SERVICE, loading: false});
				});
	}

	componentWillUnmount() {
		if (this._asyncRequest) {
			this._asyncRequest.cancel();
		}
	}

	render() {

		if(this.state.loading){
			return(
				<Fragment>
					<Header/>
					<ServiceFullContentPreload/>
				</Fragment>
			)
		}

		const SERVICE = this.state.SERVICE;

		return (
			<Fragment>
				<Header/>
				<ServiceFullContent service={SERVICE}/>
			</Fragment>
		);
	}
}

ServiceFull.propTypes = {
	dispatch: PropTypes.func,
};

export default connect((state, props, dispatch) => ({
	dispatch
}))(ServiceFull);

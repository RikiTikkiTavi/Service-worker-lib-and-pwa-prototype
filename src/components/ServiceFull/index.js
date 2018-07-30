import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import Header from "./../Header";
import ServiceFullContent from "./service-full-content";
import ServiceFullContentPreload from './service-full-content-preload';
import {newServiceCollection, ServiceCollection} from '../../models'


class ServiceFull extends Component {

	constructor(props) {
		super(props);
		this.state = {
			SERVICE: {},
			loading: true
		};

	}

	handleServiceCollectionFetchSuccess(collection){
		let SERVICES = collection.toJSON();
		let SERVICE = SERVICES.find((service) => service.id === parseInt(this.props.match.params.id));
		this.setState({SERVICE: SERVICE, loading: false});
	}

	handleServiceCollectionFetchError(collection, response, options){
		console.warn("COLLECTION", collection);
		console.warn("RESPONSE", response);
		console.warn("OPTIONS", options);
		alert("Can't load content. This page is not available.")
	}


	componentDidMount() {
		const ServiceCollection = newServiceCollection();
		ServiceCollection.fetch({
			success: (collection) => this.handleServiceCollectionFetchSuccess(collection),
			error: (collection, response, options) =>
				this.handleServiceCollectionFetchError(collection, response, options),
		})
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

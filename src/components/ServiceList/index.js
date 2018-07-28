/* eslint-disable no-underscore-dangle */
import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Header from '../Header'
import ServiceListPreload from './service-list-preload'
import getListOfServices from '../../actions/getListOfServices'
import axios from 'axios'
import {ServiceCollection} from '../../models'
import ServiceList from './service-list'

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			SERVICES: [],
			loading: true
		};
	}

	testFallback() {
		axios
			.get('/api')
			.catch(error => {
				console.log(error);
			})
			.then(response => {
				alert(response.data)
			})

	}

	/*handleServiceCollectionFetchSuccess(collection){
		let SERVICES = collection.toJSON();
		this.setState({SERVICES: SERVICES, loading: false});
	}*/

	componentDidMount() {
		this._asyncRequest =
			ServiceCollection.fetch
				.then(SERVICES => {
					console.log("GOT RESPONSE");
					this._asyncRequest = null;
					this.setState({SERVICES: SERVICES, loading: false});
				});
	}

	componentWillUnmount() {
		if (this._asyncRequest) {
			this._asyncRequest.cancel();
		}
	}

	render() {
		if (this.state.loading) {
			return (
				<Fragment>
					<Header/>
					<ServiceListPreload/>
				</Fragment>
			);
		}
		const SERVICES = this.state.SERVICES;

		return (
			<Fragment>
				<Header/>
				<ServiceList SERVICES={SERVICES} testFallback={this.testFallback.bind(this)}/>
			</Fragment>
		);
	}
}

App.propTypes = {
	dispatch: PropTypes.func
};

export default connect((state, props, dispatch) => ({
	dispatch
}))(App);

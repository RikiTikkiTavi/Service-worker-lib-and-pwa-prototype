/* eslint-disable no-underscore-dangle */
import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ServiceListPreload from './service-list-preload'
import axios from 'axios'
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

	render() {
		if (this.props.loading) {
			return (
				<ServiceListPreload/>
			);
		}
		const SERVICES = this.props.services;

		return (
			<ServiceList SERVICES={SERVICES}
			             testFallback={this.testFallback.bind(this)}
			/>
		);
	}
}

App.propTypes = {
	dispatch: PropTypes.func,
	loading: PropTypes.bool,
	services: PropTypes.array,
};

export default connect((state, props, dispatch) => ({
	dispatch
}))(App);

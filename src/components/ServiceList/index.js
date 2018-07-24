/* eslint-disable no-underscore-dangle */
import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import Header from '../Header'
import ServiceListPreload from './service-list-preload'
import getListOfServices from '../../actions/getListOfServices'
import axios from 'axios'

import emulateGetServices from './list-of-services';

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

	componentDidMount() {
		this._asyncRequest =
			getListOfServices()
				.then(SERVICES => {
					console.log(SERVICES)
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
				<div className="container service-list__container">
					<div className="row">
						<div className="col-12">
							<button onClick={this.testFallback.bind(this)} className="btn btn-primary">Test Fallback</button>
						</div>
					</div>
					<div className="row">
						{SERVICES.map((service, index) => {
							let cols;
							service.type === 'small' ? (cols = 4) : (cols = 12);
							return (
								<div key={index} className={`col-md-${cols}`}>
									<div className="card">
										<div className="card-body">
											<h5 className="card-title">{service.name}</h5>
											<p className="card-text">{service.description}</p>
											<Link
												ref={e => (this.el = e)}
												to={`/services/${service.id}`}
												className="btn btn-primary text-light">
												More
											</Link>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
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

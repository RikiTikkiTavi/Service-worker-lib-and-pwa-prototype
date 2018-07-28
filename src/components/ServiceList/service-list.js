import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom'

class ServiceList extends Component {
	render(){
		const SERVICES = this.props.SERVICES;
		return (
			<div className="container service-list__container">
				<div className="row">
					<div className="col-12">
						<button onClick={this.props.testFallback.bind(this)} className="btn btn-primary">Test Fallback</button>
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
		)
	}
}

ServiceList.propTypes = {
	SERVICES: PropTypes.array,
	testFallback: PropTypes.func
};

module.exports = ServiceList;

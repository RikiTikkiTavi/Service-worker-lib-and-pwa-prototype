import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {Link} from "react-router-dom";

class ServiceListPreload extends Component {
	render() {
		return (
			<Fragment>
				<div className="container service-list__container">
					<div className="row">
						<div className={`col-md-12`}>
							<div className="card card__preload">
								<div className="card-body">
									<h5 className="card-title"><div className="card-title__preload"/></h5>
									<p className="card-text"><div className="card-text__preload"/></p>
									<div className="card-link__preload"/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Fragment>
		);
	}
}

module.exports = ServiceListPreload;

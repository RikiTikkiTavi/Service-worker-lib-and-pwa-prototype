import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

class CategoryFullContent extends Component {
	render() {
		const {category} = this.props;

		return (
			<div className="container">
				<div className="row">
					<div className="col-12">
						<h2>{category.title}</h2>
					</div>
				</div>
				<div className="row">
					<div className="col-12">
						<p> {category.title} </p>
						<img className="img-fluid" src={`https://pa.adac.rsm-stage.de/${category.image}`}/>
					</div>
				</div>
			</div>
		);
	}
}

CategoryFullContent.propTypes = {
	dispatch: PropTypes.func,
	category: PropTypes.object,
};

export default connect((state, props, dispatch) => ({
	dispatch
}))(CategoryFullContent);

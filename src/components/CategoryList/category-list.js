import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom'

class CategoryList extends Component {
	render(){
		const CATEGORIES = this.props.CATEGORIES;
		return (
			<div className="container service-list__container">
				<div className="row">
					{Object.keys(CATEGORIES).map((keyName, keyIndex) => {
						const category = CATEGORIES[keyName];
						let stylesObject = {
							backgroundImage: `url(https://pa.adac.rsm-stage.de/${category.image_bg})`
						};
						return (
							<div key={keyIndex} className={`col-md-12`}>
								<div className="card" style={stylesObject}>
									<div className="card-body">
										<h5 className="card-title">{category.title}</h5>
										<p className="card-text">{category.title}</p>
										<Link
											ref={e => (this.el = e)}
											to={`/categories/${category.id}`}
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

CategoryList.propTypes = {
	CATEGORIES: PropTypes.object,
};

module.exports = CategoryList;

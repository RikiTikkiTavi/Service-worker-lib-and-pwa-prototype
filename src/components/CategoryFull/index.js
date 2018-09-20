import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import CategoryFullContent from "./category-full-content";
import CategoryFullContentPreload from './category-full-content-preload';


class CategoryFull extends Component {

	render() {

		const {loading, CATEGORIES} = this.props;
		let categories = CATEGORIES.elements;

		if (loading) {
			return (
				<CategoryFullContentPreload/>
			)
		}

		let category = categories[this.props.match.params.id];

		return (
			<CategoryFullContent category={category}/>
		);
	}
}

CategoryFull.propTypes = {
	dispatch: PropTypes.func,
    CATEGORIES: PropTypes.object,
	loading: PropTypes.bool
};

export default connect((state, props, dispatch) => ({
	dispatch
}))(CategoryFull);

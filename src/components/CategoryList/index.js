/* eslint-disable no-underscore-dangle */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import CategoryListPreload from './templates/category-list-preload'
import CategoryList from './category-list-index'


class App extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		if (this.props.loading) {
			return (
				<CategoryListPreload/>
			);
		}
		return (
			<CategoryList CATEGORIES = {this.props.categories}/>
		);
	}
}

App.propTypes = {
	dispatch: PropTypes.func,
	loading: PropTypes.bool,
	categories: PropTypes.object
};

export default connect((state, props, dispatch) => ({
	dispatch
}))(App);

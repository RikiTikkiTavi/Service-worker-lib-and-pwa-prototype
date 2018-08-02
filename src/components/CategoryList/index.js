/* eslint-disable no-underscore-dangle */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import CategoryListPreload from './category-list-preload'
import CategoryList from './category-list'

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true
		};
	}

	render() {
		if (this.props.loading) {
			return (
				<CategoryListPreload/>
			);
		}
		const CATEGORIES = this.props.categories;

		return (
			<CategoryList CATEGORIES = {CATEGORIES}/>
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

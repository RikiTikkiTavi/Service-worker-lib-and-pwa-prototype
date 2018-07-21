import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import PropTypes from "prop-types";
import HeaderPage from './header-page'

class Header extends Component {
	render() {
		return (
			<Fragment>
				<HeaderPage/>
			</Fragment>
		)
	}
}

Header.propTypes = {
};

export default connect((state, props, dispatch) => ({
	dispatch
}))(Header);

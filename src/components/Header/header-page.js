import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class HeaderPage extends Component {
  render() {
    return (
      <Fragment>
        <header className="header-page">
          <div className="container text-center">
            <div className="row">
              <div className="col-12">
                <h1 className="header-page__heading">
                  Project prototype header
                  <br />
                </h1>
              </div>
            </div>
          </div>
        </header>
      </Fragment>
    );
  }
}

HeaderPage.propTypes = {
};

export default connect((state, props, dispatch) => ({
  dispatch
}))(HeaderPage);

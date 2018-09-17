import React from 'react';

const CategoryList = (props) => {
    const {children} = props;

    return (
        <div className="container service-list__container">
            <div className="row">
                {children}
            </div>
        </div>
    )

};

module.exports = CategoryList;

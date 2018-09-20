import React from 'react';

const CategoryList = (props) => {
    const {children, updatedElementsQuantity} = props;

    return (
        <div className="container service-list__container">
            <div className="row">
                <div className="col-12">
                    <p>Elements Updated: {updatedElementsQuantity}</p>
                </div>
            </div>
            <div className="row">
                {children}
            </div>
        </div>
    )

};

module.exports = CategoryList;

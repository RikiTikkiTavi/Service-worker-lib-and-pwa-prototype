import {Link} from 'react-router-dom'
import React from "react";

function CategoryItem(props) {
    const {category, keyIndex, stylesObject, updateDot} = props;

    return (
        <div key={keyIndex} className='col-md-12'>
            <div className="card" style={stylesObject}>
                <div className="card-body">
                    {updateDot}
                    <h5 className="card-title">{category.title}</h5>
                    <p className="card-text">{category.title}</p>
                    <Link
                        to={`/categories/${category.id}`}
                        className="btn btn-primary text-light">
                        More
                    </Link>
                </div>
            </div>
        </div>
    )

}

module.exports = CategoryItem;

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import CategoryList from './templates/category-list'
import CategoryItem from './templates/category-item'

class CategoryListIndex extends Component {
    render() {
        const CATEGORIES = this.props.CATEGORIES;
        return (

            <CategoryList>
                {Object.keys(CATEGORIES).map((keyName, keyIndex) => {

                    const category = CATEGORIES[keyName];

                    let stylesObject = {
                        backgroundImage: `url(https://pa.adac.rsm-stage.de/${category.image_bg})`
                    };

                    return (
                        <CategoryItem key={keyIndex}
                                      category={category}
                                      keyIndex={keyIndex}
                                      stylesObject={stylesObject}/>
                    );

                })}
            </CategoryList>
        )
    }
}

CategoryListIndex.propTypes = {
    CATEGORIES: PropTypes.object,
};

module.exports = CategoryListIndex;

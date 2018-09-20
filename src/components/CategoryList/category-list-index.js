import React, {Component} from 'react';
import PropTypes from 'prop-types';
import CategoryList from './templates/category-list'
import CategoryItem from './templates/category-item'
import UpdateDot from './templates/update-dot'

class CategoryListIndex extends Component {
    render() {
        const ctgrs = this.props.CATEGORIES.elements;
        let updatedElementsQuantity = this.props.CATEGORIES['updatedElementsQuantity'];
        return (

            <CategoryList updatedElementsQuantity={updatedElementsQuantity}>
                {Object.keys(ctgrs).map((keyName, keyIndex) => {

                    const category = ctgrs[keyName];

                    let stylesObject = {
                        backgroundImage: `url(https://pa.adac.rsm-stage.de/${category.image_bg})`
                    };

                    let displayClass = "";
                    if(category["isUpdated"]===1){
                        displayClass = "dot--display"
                    }

                    return (
                        <CategoryItem key={keyIndex}
                                      category={category}
                                      keyIndex={keyIndex}
                                      stylesObject={stylesObject}
                                      updateDot = {<UpdateDot displayClass={displayClass}/>}
                        />
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

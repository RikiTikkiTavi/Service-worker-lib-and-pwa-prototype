import React from "react";

function UpdateDot(props) {
    const {displayClass} = props;


    return (
        <div className={`${displayClass} d-none`}>
            DOT
        </div>
    )


}

module.exports = UpdateDot;

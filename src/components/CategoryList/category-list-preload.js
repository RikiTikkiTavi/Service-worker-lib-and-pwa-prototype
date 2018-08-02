import React, {Fragment} from 'react';

const CategoryListPreload = () => {
	return (
		<Fragment>
			<div className="container service-list__container">
				<div className="row">
					<div className={`col-md-12`}>
						<div className="card card__preload">
							<div className="card-body">
								<div className="card-title card-title__preload"/>
								<div className="card-text card-text__preload"/>
								<div className="card-link__preload"/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Fragment>
	)
}

module.exports = CategoryListPreload;

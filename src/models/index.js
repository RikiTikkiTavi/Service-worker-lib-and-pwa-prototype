import Backbone from 'backbone';
import axios from 'axios';

let ServiceCollectionClass = Backbone.Collection.extend({
	url: '/api/get_list_of_services',
	fetch:
		axios
			.get('/api/get_list_of_services')
			.catch(error => {
				console.log(error);
			})
			.then(response => response.data)
});
let ServiceCollection = new ServiceCollectionClass();

module.exports = {ServiceCollection};
import axios from 'axios'

function getListOfServices()
{
	return axios
		.get('/api/get_list_of_services')
		.catch(error => {
			console.log(error);
		})
		.then(response => (response.data));
}

module.exports = getListOfServices;
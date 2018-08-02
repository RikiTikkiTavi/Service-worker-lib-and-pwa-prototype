import Backbone from 'backbone';
import axios from 'axios';

let ServiceCollection = Backbone.Collection.extend({
	url: '/api/get_list_of_services',
});

let AdacApiModel = Backbone.Model.extend({
	url: 'https://pa.adac.rsm-stage.de/api/contents/bjoern@hempel.li/updates/contents.json?confirm=0&firstupdate=1&last_update=0&token=80efdb358e43b56b15a9af74bcdca3b8b595eac7f1fd47aca0b01dfa005c91d0',
});

export function  newServiceCollection() {
	return new ServiceCollection();
}

export function  newAdacApiModel() {
	return new AdacApiModel();
}
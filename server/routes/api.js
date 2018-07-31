const express = require('express');

const router = express.Router();

/* GET LIST OF SERVICES */
router.get('/get_list_of_services', (req, res) => {
	/* TEMPORARY TIMER FOR PRELOAD */
	const list_of_services = [
		{"id": 1, "name": "Общий план поступления", "description": "Поэтапный план поступления основанный на ваших данных.", "size": "big", "image": "/content/images/cat_1.jpg"},
		{
			"id": 2,
			"name": "Special title treatment",
			"description": "With supporting text below as a natural lead-in to additional content.",
			"size": "small",
			"image": "/content/images/cat_2.jpg"
		},
		{
		"id": 3, "name": "Special title treatment", "description": "With supporting text below as a natural lead-in to additional content.", "size": "small", "image": "/content/images/cat_1.jpg"},
		{
			"id": 4,
			"name": "Special title treatment",
			"description": "With supporting text below as a natural lead-in to additional content.",
			"size": "small",
			"image": "/content/images/cat_2.jpg"
		}];
	res.set("need-to-cache-text", "1");
	res.set("need-to-cache-images", "0");
	setTimeout(() => {
		res.send(list_of_services)
	}, 1000);
});

/* HANDLE INDEX */
router.get('/', (req, res) => {
	res.send('/api');
});

module.exports = router;
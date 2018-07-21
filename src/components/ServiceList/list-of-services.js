let emulateGetServices = new Promise((resolve => {
	const SERVICES = [
		{
			id: 1,
			name: 'Special title treatment 1',
			description:
				'With supporting text below as a natural lead-in to additional content.',
			type: 'big',
			form_id: 1,
			content: 'With supporting text below as a natural lead-in to additional content. ' +
			'With supporting text below as a natural lead-in to additional content. ' +
			'With supporting text below as a natural lead-in to additional content.'
		},
		{
			id: 2,
			name: 'Special title treatment 2',
			description:
				'With supporting text below as a natural lead-in to additional content.',
			type: 'big',
			form_id: 1,
			content: 'With supporting text below as a natural lead-in to additional content. ' +
			'With supporting text below as a natural lead-in to additional content. ' +
			'With supporting text below as a natural lead-in to additional content.'
		},
		{
			id: 3,
			name: 'Special title treatment 3',
			description:
				'With supporting text below as a natural lead-in to additional content.',
			type: 'big',
			form_id: 1,
			content: 'With supporting text below as a natural lead-in to additional content. ' +
			'With supporting text below as a natural lead-in to additional content. ' +
			'With supporting text below as a natural lead-in to additional content.'
		},
	];
	setTimeout(() => {
		resolve(SERVICES);
	}, 2000);
}));

export default emulateGetServices;

exports.getFakeData = (req, res) => {
	const fakeData = [
		{ id: 1, name: 'Alice', email: 'alice@example.com' },
		{ id: 2, name: 'Bob', email: 'bob@example.com' },
		{ id: 3, name: 'Charlie', email: 'charlie@example.com' },
	]

	res.json(fakeData)
}

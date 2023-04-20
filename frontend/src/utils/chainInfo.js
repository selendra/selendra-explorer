const filterCount = (data, name) => {
	const count = [];
	data?.filter((filter) => {
		if (filter.name === name) {
			count.push(filter?.count);
			return true;
		}
		return false;
	});
	return count[0];
};

export { filterCount };

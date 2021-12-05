export default function groupOptions(options) {
	const groupLabelsSet = new Set([]);
	const groups = [];
	for (const option of options) {
		const label = option.label || '';
		if (!groupLabelsSet.has(label)) {
			groups.push({ label, options: [] });
			groupLabelsSet.add(label);
		}
		const group = groups.find((group) => group.label === label);
		group.options.push(option);
	}
	return groups;
}

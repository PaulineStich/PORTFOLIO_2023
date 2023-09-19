const span = (text, index) => {
	const node = document.createElement('span');

	node.textContent = text;
	node.style.setProperty('--index', index);

	return node;
};

export const byLetter = (text) => [...text].map(span);

export const byWord = (text) => text.split(' ').map(span);

export const splitText = () => {
	let splitTarget = document.querySelectorAll('[split-by]');
	splitTarget.forEach((node) => {
		const type = node.getAttribute('split-by');
		let nodes = null;
		let specList = [];
		let specCount = 0;
		node.innerHTML = node.innerHTML.replace(/<a.+?<\/a>/g, (a) => {
			let code = '%' + specCount++ + '%';
			specList[specList.length] = a;
			return code;
		});
		if (type === 'letter') {
			nodes = byLetter(node.innerText);
		} else if (type === 'word') {
			nodes = byWord(node.innerText);
		}

		if (nodes) {
			node.firstChild.replaceWith(...nodes);

			let html = node.innerHTML;
			for (let i = 0; i < specCount; i++) {
				html = html.replace('%' + i + '%', specList[i]);
			}
			node.innerHTML = html;
		}
	});
};

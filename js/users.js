const content = document.querySelector('.users-table-container');
const table = content.querySelector('.users-table');
const userPostsContainer = content.querySelector('.user-sidebar');
const countInputForPage = document.getElementById('col-row'); // инпут, который говорит сколько максимум строк может быть на одной странице
let itemsPerPage = 10; // добавить возможность изменять количество отображаемых пользователей
let currentPage = 0;

function loadUsers() { // загружаем пользователей
	fetch('https://dummyjson.com/users')
	.then(res => res.json())
	.then(data => {
		const users = data.users;
		users.map(user => {
			generateRows({ // берем нужные данные и передаем их в функцию generateRows
				id: user.id,
				username: user.username,
				email: user.email,
				name: `${user.lastName} ${user.firstName}`,
				birthDate: user.birthDate,
				height: user.height,
				ip: user.ip
			});
		});

		createPagination();
		showPage(currentPage);
	})
	.catch(err => console.log(err));
}

function getUserPosts(e) {
	const row = e.currentTarget;

	if (row.tagName !== 'TR') {
		return;
	}

	const id = row.firstChild.textContent;

	fetch(`https://dummyjson.com/users/${id}/posts`)
	.then(res => res.json())
	.then(data => {
		const posts = data.posts;
		posts.map(post => generateUserPosts({
			id: post.id,
			title: post.title,
			text: post.body
		}))
	});

	userPostsContainer.classList.add('active'); // отображаем боковую панель
}

function generateRows(user) { // создаем строку с пользователем
	const row = document.createElement('tr');
	
	for (let field in user) {
		const cell = document.createElement('td');
		cell.innerHTML = user[field];
		row.appendChild(cell)
	}

	row.addEventListener('click', (e) => getUserPosts(e));

	table.tBodies[0].appendChild(row);
}

function generateUserPosts(post) {
	const postContainer = document.createElement('article');
	const title = document.createElement('h3');
	const text = document.createElement('p');

	postContainer.classList.add('user-sidebar-post');

	title.innerHTML = post.title;
	text.innerHTML = post.text;

	postContainer.appendChild(title);
	postContainer.appendChild(text);
	userPostsContainer.appendChild(postContainer);
}

function showPage(page) { // показываем текущую или выбранную страницу
	const items = Array.from(content.getElementsByTagName('tr')).slice(1);
	const start = page * itemsPerPage; // определяем какие элементы показывать
	const end = start + itemsPerPage; // определяем на каком элементе заканчивать страницу

	resetSortingSettings(); // сброс настроек сортировки при отображении новой страницы

	items.forEach((item, index) => {
		item.classList.toggle('hidden', index < start || index >= end);
	});

	updateActiveButton(); // обновляем состояние кнопки
}

function createPagination() { // создаем пагинацию
	const items = Array.from(content.getElementsByTagName('tr')).slice(1);
	const totalPages = Math.ceil(items.length / itemsPerPage); // определяем количество страниц
	const paginationConteiner = document.createElement('div');

	paginationConteiner.classList.add('users-table-pagination');

	for (let i = 0; i < totalPages; i++) { // создаем кнопки для пагинации
		const button = document.createElement('button');
		
		button.classList.add('pagination-item');
		button.innerHTML = i + 1;
		button.addEventListener('click', () => {
			currentPage = i;
			resetSortingSettings(); // Сброс настроек сортировки
			sortUsers();
			showPage(currentPage);
			updateActiveButton();
		});

		paginationConteiner.appendChild(button);
	}

	removePagination(); // Удаляем прошлую пагинацию
	content.appendChild(paginationConteiner);
}

function removePagination() { // функция для удаления прошлой пагинации
	const existingPagination = content.querySelector('.users-table-pagination');
	if (existingPagination) {
	  existingPagination.remove();
	}
}

function updateActiveButton() { // обновляем состояние активной кнопки
	const buttons = document.querySelectorAll('.users-table-pagination .pagination-item');

	buttons.forEach((button, index) => {
		if (index === currentPage) { // если индекс кнопки это текущая страница, то добавляем .active
			button.classList.add('active');
		} else {
			button.classList.remove('active');
		}
	});
}

// функции сравнения для разных 'типов': 1 - по возрастанию, -1 - по убыванию
function compareNumbers(a, b, sortOrder) {
	if (sortOrder === '1') {
	  return a - b;
	} else {
	  return b - a;
	}
}
 
function compareDates(a, b, sortOrder) {
	if (sortOrder === '1') {
		return b - a;
	} else {
		return a - b;
	}
}
 
function compareStrings(a, b, sortOrder) {
	if (sortOrder === '1') {
	  return b.localeCompare(a);
	} else {
	  return a.localeCompare(b);
	}
}
 
function compareIPAddresses(a, b, sortOrder) {
	const splitA = a.split('.').map(Number); // разделяем строку на массив чисел
	const splitB = b.split('.').map(Number);
 
	if (sortOrder === '1') {
	  	for (let i = 0; i < 4; i++) {
		 	if (splitA[i] !== splitB[i]) {
				return splitA[i] - splitB[i];
		 	}
	  	}
	} else {
	  	for (let i = 0; i < 4; i++) {
		 	if (splitB[i] !== splitA[i]) {
				return splitB[i] - splitA[i];
		 	}
	  	}
	}
}

function compareNames(a, b, sortOrder) {
	const aLastName = a.split(' ')[0]; // сортировка по фамилии
  	const bLastName = b.split(' ')[0];

  	if (sortOrder === '1') {
		return bLastName.localeCompare(aLastName);
  	} else {
		return aLastName.localeCompare(bLastName);
  	}
}

function getCellValue(cell, fieldType) {
	const cellContent = cell.textContent.trim();

	if (!cellContent) {
		return;
	}
	
	switch (fieldType) { // Проверка типа поля
		case 'number':
		  return Number(cellContent);
		case 'date':
		  return new Date(cellContent);
		case 'string':
		  return cellContent.toLowerCase();
		case 'ip':
		  return cellContent;
		default:
		  return cellContent.toLowerCase();
	}
}

function sortUsers() {
	const sort = document.getElementById('sort').value;
	const cell = +document.getElementById('field').value;
	const fieldType = determineFieldType(cell);
	const items = Array.from(table.getElementsByTagName('tr'))
	.slice(1)
	.sort((a, b) => {
		const aValue = getCellValue(a.cells[cell], fieldType);
    	const bValue = getCellValue(b.cells[cell], fieldType);

		switch (fieldType) {
			case 'number':
				return compareNumbers(aValue, bValue, sort);
			case 'date':
				return compareDates(aValue, bValue, sort);
			case 'string':
				return compareStrings(aValue, bValue, sort);
			case 'ip':
				return compareIPAddresses(aValue, bValue, sort);
			case 'name':
				return compareNames(aValue, bValue, sort);
			default:
				return;
		}
	});

	table.tBodies[0].append(...items);
}

function resetSortingSettings() { // значения сортировки по умолчанию
	document.getElementById('sort').value = '1'; // Установим сортировку по возрастанию
	document.getElementById('field').value = '0'; // Установим поле для сортировки по умолчанию
}

function determineFieldType(field) {
	switch (field) {
		case 0:
		case 5:
			return 'number';
		case 3:
			return 'name';
		case 4:
			return 'date';
		case 6: 
			return 'ip';
		default:
			return 'string';
	}
}

document.addEventListener('DOMContentLoaded', loadUsers);

document.querySelector('.cross').addEventListener('click', () => {
	const items = userPostsContainer.querySelectorAll('.user-sidebar-post');

	items.forEach(item => item.remove());
	userPostsContainer.classList.remove('active');
});

document.querySelector('.sort-users').addEventListener('click', sortUsers);

countInputForPage.addEventListener('change', () => {
	itemsPerPage = Number(countInputForPage.value);
	resetSortingSettings();
	showPage(currentPage);
	createPagination(); // Обновим пагинацию при изменении количества строк на странице
});
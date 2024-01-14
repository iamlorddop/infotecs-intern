const content = document.querySelector('.users-table-container');
const table = content.querySelector('.users-table');
const userPostsContainer = content.querySelector('.user-sidebar');
const countInputForPage = document.getElementById('col-row'); 
let itemsPerPage = 10;
let currentPage = 0;

document.addEventListener('DOMContentLoaded', loadUsers);

document.querySelector('.close-sidebar').addEventListener('click', () => {
	const items = userPostsContainer.querySelectorAll('.user-sidebar-post');

	items.forEach(item => item.remove());
	userPostsContainer.classList.remove('active');
});

document.querySelector('.sort-users').addEventListener('click', sortUsers);

countInputForPage.addEventListener('change', () => {
	itemsPerPage = Number(countInputForPage.value);
	resetSortingSettings();
	showPage(currentPage);
	createPagination(); // Обновим пагинацию
});

/**
 * Запрос пользователей пользователей
 * 
 */
function loadUsers() {
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

/**
 * Делает запрос постов по id пользователя
 * 
 * @param {Event} e 
 */
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

/**
 * Cоздает строку с пользователем в таблице
 * 
 * @param {Object} user 
 */
function generateRows(user) {
	const row = document.createElement('tr');
	
	for (let field in user) {
		const cell = document.createElement('td');
		cell.innerHTML = user[field];
		row.appendChild(cell)
	}

	row.addEventListener('click', (e) => getUserPosts(e));

	table.tBodies[0].appendChild(row);
}

/**
 * Создает пост пользователя и добавляет их в .user-sidebar
 * 
 * @param {Object} post 
 */
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

/**
 * Показываем текущую или выбранную страницу с набором записей
 * 
 * @param {Number} page Номер текущей страницы
 */
function showPage(page) {
	const items = Array.from(content.getElementsByTagName('tr')).slice(1);
	const start = page * itemsPerPage;
	const end = start + itemsPerPage;

	resetSortingSettings(); // сброс настроек сортировки при отображении новой страницы

	items.forEach((item, index) => {
		item.classList.toggle('hidden', index < start || index >= end);
	});

	updateActiveButton(); // обновляем состояние кнопки
}

/**
 * Cоздает пагинацию
 * 
 */
function createPagination() {
	const items = Array.from(content.getElementsByTagName('tr')).slice(1);
	const totalPages = Math.ceil(items.length / itemsPerPage);
	const paginationConteiner = document.createElement('div');

	paginationConteiner.classList.add('users-table-pagination');

	for (let i = 0; i < totalPages; i++) {
		const button = document.createElement('button');
		button.classList.add('pagination-item');
		button.innerHTML = i + 1;
		button.addEventListener('click', () => {
			currentPage = i;
			resetSortingSettings();
			sortUsers();
			showPage(currentPage);
			updateActiveButton();
		});
		paginationConteiner.appendChild(button);
	}

	removePagination();
	content.appendChild(paginationConteiner);
}

/**
 * Удаляет не актуальную пагинацию
 * 
 */
function removePagination() { 
	const existingPagination = content.querySelector('.users-table-pagination');
	if (existingPagination) {
	  existingPagination.remove();
	}
}

/**
 * Обновляет состояние активной кнопки
 * 
 */
function updateActiveButton() {
	const buttons = document.querySelectorAll('.users-table-pagination .pagination-item');
	buttons.forEach((button, index) => button.classList.toggle('active', index === currentPage));
}

/**
 * 
 * @param {String} cell 
 * @param {String} fieldType 
 * @returns {String|Number|Date}
 */
function getCellValue(cell, fieldType) {
	const cellContent = cell.textContent.trim();

	if (!cellContent) {
		return;
	}
	
	switch (fieldType) {
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

/**
 * Сортирует пользователей в зависимости 
 * от указанных значений в select
 * 
 */
function sortUsers() {
	const sort = document.getElementById('sort').value;
	const cell = Number(document.getElementById('field').value);
	const fieldType = determineFieldType(cell);

	const items = Array.from(table.getElementsByTagName('tr'))
	.slice(1)
	.sort((a, b) => {
		const aValue = getCellValue(a.cells[cell], fieldType);
    const bValue = getCellValue(b.cells[cell], fieldType);

		switch (fieldType) {
			case 'number':
        return (sort === '1') ? aValue - bValue : bValue - aValue;
			case 'date':
        return (sort === '1') ? bValue - aValue : aValue - bValue;
			case 'string':
        return (sort === '1') ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
			case 'ip':
        const splitA = aValue.split('.').map(Number);
        const splitB = bValue.split('.').map(Number);
      
        if (sort === '1') {
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
			case 'name':
        return (sort === '1') 
                ? bValue.split(' ')[0].localeCompare(aValue.split(' ')[0]) 
                : aValue.split(' ')[0].localeCompare(bValue.split(' ')[0])
			default:
				return;
		}
	});

	table.tBodies[0].append(...items);
}

/**
 * Устанавливает значения сортировки по умолчанию
 * По умолчанию: по возрастанию, поле id
 * 
 */
function resetSortingSettings() {
	document.getElementById('sort').value = '1';
	document.getElementById('field').value = '0';
}

/**
 * Определяет тип для поля в таблице,
 * для дальнейщего использования в сортировке
 * 
 * @param {Number} field Номер поля таблицы
 * @returns {String} Тип поля
 */
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
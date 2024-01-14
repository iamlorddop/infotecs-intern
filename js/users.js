const content = document.querySelector('.users-table-container');
const table = content.querySelector('.users-table');
const itemsPerPage = 5;
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

function generateRows(user) { // создаем строку с пользователем
	const row = document.createElement('tr');

	for (let field in user) {
		const cell = document.createElement('td');
		cell.innerHTML = user[field];
		row.appendChild(cell)
	}

	table.tBodies[0].appendChild(row);
}

function showPage(page) { // показываем текущую или выбранную страницу
	const items = Array.from(content.getElementsByTagName('tr')).slice(1);
	const start = page * itemsPerPage; // определяем какие элементы показывать
	const end = start + itemsPerPage; // определяем на каком элементе заканчивать страницу

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
			showPage(currentPage);
			updateActiveButton();
		});

		paginationConteiner.appendChild(button);
	}

	content.appendChild(paginationConteiner);
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

document.addEventListener('DOMContentLoaded', loadUsers);
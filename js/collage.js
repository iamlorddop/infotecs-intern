const collage = document.querySelector('.collage-container');
const fullscreenContainer = document.querySelector('.fullscreen-container');
const fullscreenImage = document.querySelector('.fullscreen-img');
const buttonDownloadFull = document.querySelector('.download-full');
const buttonCloseFull = document.querySelector('.close-full');
let images = []; // массив для временного хранения изображений
let loadedImages = 0;
let currentIndex = 0;
let totalImages = 20; // максимум изображений в коллаже
let allowImageAddition = true; // флаг, разрешающий смену изображений (если режим просмотра, то флаг ставится в false)

function loadImage() {
	fetch('https://dog.ceo/api/breeds/image/random')
	.then(res => res.json())
	.then(data => {
		const imageUrl = data.message;
		const image = new Image();

		image.src = imageUrl;
		image.onload = () => {
			if (loadedImages <= totalImages) {
				addImageToCollage(image);
			}
			
			setTimeout(loadImage, 3000);
			loadedImages++;
		};
	})
	.catch(err => console.log(err));
}

function addImageToCollage(image) {
	if (!allowImageAddition) { // запрет на добавление изображений
		return;
  	}

	const newImage = image;
	const collageCoord = collage.getBoundingClientRect(); // доработать
	let collageFull = false; // доработать
	
	newImage.style.display = 'block';
	images.push(newImage);
	collage.appendChild(newImage);
}

function openFullscreen(imageUrl) {
	allowImageAddition = false; // Запрет на добавление новых изображений
	fullscreenImage.src = imageUrl;
	fullscreenContainer.classList.add('active');
}

function closeFullscreen() {
	allowImageAddition = true; // Возобновить добавление новых изображений
	fullscreenContainer.classList.remove('active');
}

function downloadImage() {
	const link = document.createElement('a');
	link.href = fullscreenImage.src;
	link.download = 'dog_image.jpg';
	document.body.appendChild(link);
	link.click();
	link.remove();
}

document.addEventListener('DOMContentLoaded', loadImage);

collage.addEventListener('click', e => {
	const clickedImage = e.target;

	if (clickedImage.tagName !== 'IMG' && clickedImage.parentNode !== collage) {	// Проверяем, является ли кликнутый элемент изображением в коллаже
		return;
	}

	openFullscreen(clickedImage.src);
});

buttonDownloadFull.addEventListener('click', downloadImage);
buttonCloseFull.addEventListener('click', closeFullscreen);
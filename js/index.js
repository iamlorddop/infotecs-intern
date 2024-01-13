// задание коллаж
const collage = document.querySelector('.collage-container');
const fullscreenContainer = document.querySelector('.fullscreen-container');
const fullscreenImage = document.querySelector('.fullscreen-img');
const buttonDownloadFull = document.querySelector('.download-full');
const buttonCloseFull = document.querySelector('.close-full');
const scrollToTop = document.querySelector('.btn-top');
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
	if (!allowImageAddition) {
		return;
  	}

	if (image.width > collage.clientWidth || image.offsetHeight > collage.clientHeight) {
		return;
	}

	currentIndex = (currentIndex + 1) % images.length;

	const newImage = image.cloneNode();
	newImage.style.display = 'block';

	images[currentIndex] = newImage;
	collage.appendChild(newImage);
}

function getRandomPosition(max) {
	return Math.floor(Math.random() * max);
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
	document.body.removeChild(link);
}

document.addEventListener('DOMContentLoaded', loadImage);

collage.addEventListener('click', e => {
	const clickedImage = e.target;

	// Проверяем, является ли кликнутый элемент изображением в коллаже
	if (clickedImage.tagName === 'IMG' && clickedImage.parentNode === collage) {
		openFullscreen(clickedImage.src);
	}
});

buttonDownloadFull.addEventListener('click', downloadImage);
buttonCloseFull.addEventListener('click', closeFullscreen);

scrollToTop.addEventListener('click', () => window.scrollTo(0, 0));
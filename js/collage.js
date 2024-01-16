const collage = document.querySelector('.collage-container');
const fullscreenContainer = document.querySelector('.fullscreen-container');
const fullscreenImage = document.querySelector('.fullscreen-img');
const buttonDownloadFull = document.querySelector('.download-full');
const buttonCloseFull = document.querySelector('.close-full');
let images = []; // массив для временного хранения изображений
let currentIndex = 0;
let occupiedSpace = 0; // Показывает сколько места занято в коллаже
let allowImageAddition = true; // флаг, разрешающий смену изображений (если режим просмотра, то флаг ставится в false)

document.addEventListener('DOMContentLoaded', displayImages);

collage.addEventListener('click', e => {
	const clickedImage = e.target;

	if (clickedImage.tagName !== 'IMG' && clickedImage.parentNode !== collage) {
		return;
	}

	openFullscreen(clickedImage.src);
});

buttonDownloadFull.addEventListener('click', downloadImage);
buttonCloseFull.addEventListener('click', closeFullscreen);

/**
 * Запрашивает случайное изображение собаки
 * 
 */
async function loadImage() {
  try {
    const res = await fetch('https://dog.ceo/api/breeds/image/random', {mode: 'cors'});
    const data = await res.json();
    const imageUrl = data.message;
    images.push(imageUrl);
  } catch (err) {
    console.log(err);
  }
}

/**
 * Отображает изображения на странице при загрузке,
 * запращивая данные с помощью функции loadImage
 * 
 */
async function displayImages() {
  const collagePadding = 10; // Отступ от края контейнера
  const collageHeight = collage.offsetHeight - 2 * collagePadding; // Учитываем отступы сверху и снизу
  let totalImages = 20;

  // Запрет на добавление изображений
  if (!allowImageAddition) { 
    return;
  }

  await loadImage();
  const img = new Image();

  // Когда изображение полностью загружено
  img.onload = function() {
    img.style.display = 'block';
    collage.appendChild(img);
    currentIndex++;
    occupiedSpace = img.offsetTop + img.offsetHeight; // Запоминаем сколько занято места

    // Проверка, поместится ли изображение в оставшееся место
    if (occupiedSpace > collageHeight) {
      clearCollage();
      return;
    }

    if (currentIndex < totalImages) {
      setTimeout(displayImages, 3000); // Задержка в 3 секунды
    } else {
      clearCollage();
      currentIndex = 0;
    }
  };

  img.src = images[currentIndex];
}

/**
 * Очищает коллаж от изображений
 * 
 */
function clearCollage() {
  const imgs = collage.getElementsByTagName('img');

  for (let i = 0; i < imgs.length; i++) {
    imgs[i].classList.add('remove');
  }

  setTimeout(() => {
    collage.innerHTML = '';
    images = [];
    currentIndex = 0;
    occupiedSpace = 0;
    displayImages();
  }, 1000);
}

/**
 * Показывает изображение на весь экран
 * 
 * @param {String} imageUrl source кликнутого изображения
 */
function openFullscreen(imageUrl) {
	allowImageAddition = false; // Запрет на добавление новых изображений
	fullscreenImage.src = imageUrl;
	fullscreenContainer.classList.add('active');
}

/**
 * Возращает изображение в исходный размер
 * 
 */
function closeFullscreen() {
	allowImageAddition = true; // Возобновить добавление новых изображений
	fullscreenContainer.classList.remove('active');
  displayImages();
}

/**
 * Создает ссылку для загрузки изображения
 * 
 */
function downloadImage() {
	const link = document.createElement('a');
	link.href = fullscreenImage.src;
	link.download = 'dog_image.jpg';
	document.body.appendChild(link);
	link.click();
	link.remove();
}
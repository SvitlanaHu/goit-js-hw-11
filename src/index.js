import PixabayApiService from './js/pixabay-api';
import { lightbox } from './js/lightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
    searchForm: document.querySelector('.search-form'),
    galleryContainer: document.querySelector('.gallery'),
    // loadMoreBtn: document.querySelector('.load-more'),
};
let isShown = 0;
const pixabayApiService = new PixabayApiService();
const perPage = pixabayApiService.PER_PAGE;
let nextPage = 2;

refs.searchForm.addEventListener('submit', onSearch);
// refs.loadMoreBtn.addEventListener('click', onLoadMore);

const options = {
    rootMargin: '50px',
    root: null,
    threshold: 0.3,
};
const observer = new IntersectionObserver(onLoadMore, options);

function onSearch(element) {
    element.preventDefault();
    window.addEventListener('scroll', handleScroll);

    refs.galleryContainer.innerHTML = '';
    pixabayApiService.query =
        element.currentTarget.elements.searchQuery.value.trim();
    pixabayApiService.resetPage();

    if (pixabayApiService.query === '') {
        Notify.warning('Please, fill the main field');
        return;
    }

    isShown = 0;
    fetchPicturesNext();
    onRenderGallery(hits);
    lightbox.refresh();
    autoScroll();
}

function onLoadMore() {
    pixabayApiService.incrementPage();
    fetchPicturesNext();
}

async function fetchPicturesNext() {
    // refs.loadMoreBtn.classList.add('is-hidden');

    const result = await pixabayApiService.fetchPictures();
    const { hits, total } = result;
    const totalHits = result.totalHits;
    const totalPages = totalHits / perPage;
    console.log("result", result);
    // isShown += hits.length;
    console.log("hits", hits);
    console.log("total", total);
    console.log("totalHits", totalHits);

    if (totalHits === 0) {
        Notify.failure(
            `Sorry, there are no images matching your search query. Please try again.`
        );
        // refs.loadMoreBtn.classList.add('is-hidden');
        return;
    }

    isShown = totalHits;
    Notify.success(`Hooray! We found ${isShown} images on ${Math.ceil(isShown / perPage)} pages !!!`);
    onRenderGallery(hits);
    totalPages -= 1;

    if (isShown <= perPage) {
        console.log("isShown", isShown);
    } else {
        isShown -= perPage;
        console.log("isShown", isShown);
    }

    if (isShown <= perPage) {
        Notify.info("We're sorry, but you've reached the end of search results.");
    }
    return hits;
}

function onRenderGallery(elements) {
    const markup = elements
        .map(
            ({
                webformatURL,
                largeImageURL,
                tags,
                likes,
                views,
                comments,
                downloads,
            }) => {
                return `<div class="photo-card">
    <a href="${largeImageURL}">
      <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
        ${downloads}
      </p>
    </div>
    </div>`;
            }
        )
        .join('');
    refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
    lightbox.refresh();
}

// Функція для бескінечного скролу
function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
        onLoadMore();
    }
    // console.log(scrollTop, scrollHeight, clientHeight);
}


// Цей код дозволяє автоматично прокручувати сторінку на висоту 2 карток галереї, коли вона завантажується
function autoScroll() {
    const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
    });
}
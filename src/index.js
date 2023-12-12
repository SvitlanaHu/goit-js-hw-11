import PixabayApiService from './js/pixabay-api';
import { lightbox } from './js/lightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
    searchForm: document.querySelector('.search-form'),
    galleryContainer: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more'),
};
let isShown = 0;
const pixabayApiService = new PixabayApiService();

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

const options = {
    rootMargin: '50px',
    root: null,
    threshold: 0.3,
};
const observer = new IntersectionObserver(onLoadMore, options);

function onSearch(element) {
    element.preventDefault();

    refs.galleryContainer.innerHTML = '';
    pixabayApiService.query =
        element.currentTarget.elements.searchQuery.value.trim();
    pixabayApiService.resetPage();

    if (pixabayApiService.query === '') {
        Notify.warning('Please, fill the main field');
        return;
    }

    isShown = 0;
    fetchPictures();
    onRenderGallery(hits);
}

function onLoadMore() {
    pixabayApiService.incrementPage();
    fetchPictures();
}

async function fetchPictures() {
    refs.loadMoreBtn.classList.add('is-hidden');

    const result = await pixabayApiService.fetchPictures();
    const { hits, total } = result;
    const totalHits = result.totalHits;
    const totalPages = totalHits / 40;
    console.log("result", result);
    isShown += hits.length;
    console.log("hits", hits);
    console.log("total", total);

    if (!hits.length) {
        Notify.failure(
            `Sorry, there are no images matching your search query. Please try again.`
        );
        refs.loadMoreBtn.classList.add('is-hidden');
        return;
    }

    onRenderGallery(hits);
    isShown += hits.length;

    if (isShown < total) {
        Notify.success(`Hooray! We found ${totalHits} images on ${Math.ceil(totalPages)} pages !!!`);
        refs.loadMoreBtn.classList.remove('is-hidden');
    }

    if (isShown >= total) {
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

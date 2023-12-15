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
// const observer = new IntersectionObserver(onLoadMore, options);

async function onSearch(element) {
    element.preventDefault();
    window.addEventListener('scroll', handleScroll);

    refs.galleryContainer.innerHTML = '';
    pixabayApiService.query =
        element.currentTarget.elements.searchQuery.value.trim();
    pixabayApiService.resetPage();
    pixabayApiService.page = 1;
    console.log("query: ", pixabayApiService.query);
    if (pixabayApiService.query === '') {
        Notify.warning('Please, fill the main field');
        return;
    }
    try {
        const response = await pixabayApiService.fetchPictures();
        const totalImages = response.totalHits;
        if (totalImages === 0) {

            alertNoEmptySearch();
            return;
        }
        if (totalImages < perPage) {
            alertEndOfSearch();

        }
        onRenderGallery(response.hits);
        lightbox.refresh();

        Notify.success(`Hooray! We found ${response.totalHits} images on ${Math.ceil(response.totalHits / perPage)} pages !!!`);
    } catch (error) {
        console.log(error);
    }
}

async function onLoadMore() {
    pixabayApiService.page += 1;

    try {
        const result = await pixabayApiService.fetchPictures();
        const { hits, total } = result;
        const totalHits = result.totalHits;
        const lastPages = Math.ceil(totalHits / perPage);
        console.log("result", result);
        // isShown += hits.length;
        console.log("hits", hits);
        console.log("total", total, "totalHits", totalHits, "lastPages", lastPages);

        onRenderGallery(hits);
        lightbox.refresh();
        // autoScroll();
        if (lastPages === pixabayApiService.page) {
            alertEndOfSearch();
            window.removeEventListener('scroll', handleScroll);
            return;
        }
    } catch (error) {
        alertEndOfSearch();
    }
}

async function fetchPicturesNext(el) {
    // refs.loadMoreBtn.classList.add('is-hidden');

    const result = await pixabayApiService.fetchPictures();
    const { hits } = result;
    const totalHits = result.totalHits;

    el.preventDefault();
    window.addEventListener('scroll', handleScroll);

    isShown = totalHits;
    onRenderGallery(hits);
    // console.log("nextPage", nextPage);
    if (nextPage < Math.ceil(totalHits / perPage)) {
        alertEndOfSearch();
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

function alertNoEmptySearch() {
    Notify.failure(
        'Sorry, there are no images matching your search query. Please try again..'
    );
}

function alertEndOfSearch() {
    Notify.warning(
        "We're sorry, but you've reached the end of search results."
    );
}

// Функція для бескінечного скролу
function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 5) {
        onLoadMore();
    }
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
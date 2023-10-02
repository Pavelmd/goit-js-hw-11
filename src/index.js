import NewsApiService from './js/news-api';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { lightbox } from './js/light-box';
import { refs } from './js/refs';


refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

refs.loadMoreBtn.classList.add('is-hidden');






let isShown = 0;
const newsApiService = new NewsApiService();



const options = {
  rootMargin: '50px',
  root: null,
  threshold: 0.3,
};
const observer = new IntersectionObserver(onLoadMore, options);



function onLoadMore() {
  newsApiService.incrementPage();
  fetchGallery();
}

async function fetchGallery() {
  refs.loadMoreBtn.classList.add('is-hidden');

  const result = await newsApiService.fetchGallery();
  const { hits, total } = result;
  console.log(total);
  isShown += hits.length;
  

  if (!hits.length) {
    Notify.failure(
      `Sorry, there are no images matching your search query. Please try again.`
    );
    refs.loadMoreBtn.classList.add('is-hidden');
    return;
  }

  onRenderGallery(hits);
  

  if (isShown < total) {
    Notify.success(`Hooray! We found ${total} images !!!`);
    refs.loadMoreBtn.classList.remove('is-hidden');
  }

  if (isShown >= total) {
    Notify.success(`Hooray! We found ${total} images !!!`);
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
}
function onSearch(element) {
  element.preventDefault();

  refs.galleryContainer.innerHTML = '';
  newsApiService.query =
    element.currentTarget.elements.searchQuery.value.trim();
  newsApiService.resetPage();

  if (newsApiService.query === '') {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notify.warning('Please, fill the main field');
    return;
  }

  isShown = 0;
  fetchGallery();
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

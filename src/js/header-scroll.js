window.onscroll = () => changeHeaderBackground();

function changeHeaderBackground() {
    const header = document.querySelector('header');
    const headerOffsetTrigger = header.offsetHeight;
    const pageOffset = window.pageYOffset;

    if (pageOffset > headerOffsetTrigger) {
        header.classList.add('header--no-transparency');
    } else {
        header.classList.remove('header--no-transparency');
    }
}
const { height: cardHeight } = document
    .querySelector(".gallery")
    .firstElementChild.getBoundingClientRect();

window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
});
function checkPosition() {
    // Нам потрібно знати висоту документа та висоту екрану:
    const height = document.body.offsetHeight;
    const screenHeight = window.innerHeight;

    // Вони можуть відрізнятися: якщо на сторінці багато контенту, висота документа буде більшою за висоту екрана (звідси і скролл).

    // Записуємо, скільки пікселів користувач вже проскролив:
    const scrolled = window.scrollY;

    // Позначимо поріг, після наближення якого викликатимемо якусь дію. У нашому випадку – чверть екрана до кінця сторінки:
    const threshold = height - screenHeight / 4;

    // Відстежуємо, де знаходиться низ екрана щодо сторінки:
    const position = scrolled + screenHeight;

    if (position >= threshold) {
        // Якщо ми перетнули смугу-поріг, викликаємо потрібну дію.
    }
}

; (() => {
    window.addEventListener('scroll', checkPosition);
    window.addEventListener('resize', checkPosition);
})()

// Обробку прокручування варто трохи пригальмовувати, щоб вона виконувалася трохи рідше і таким чином менше навантажувала браузер. Додамо функцію throttle()
function throttle(callee, timeout) {
    let timer = null;

    return function perform(...args) {
        if (timer) return;

        timer = setTimeout(() => {
            callee(...args);

            clearTimeout(timer);
            timer = null;
        }, timeout)
    }
}

// І тепер призначимо обробником подій трохи загальмовану функцію:
; (() => {
    window.addEventListener('scroll', throttle(checkPosition, 250));
    window.addEventListener('resize', throttle(checkPosition, 250));
})()

// Далі створимо функцію для запитів на сервер:
async function fetchPosts() {
    const { posts, next } = await server.posts(nextPage);
    // Робимо щось з posts та next.
}

// І використовуємо її в checkPosition().Оскільки fetchPosts() асинхронна, checkPosition() теж стане асинхронною
async function checkPosition() {
    // ...Старий код.

    if (position >= threshold) {
        await fetchPosts()
    }
}

// У функції fetchPosts() ми отримуємо список постів, кожен з яких хочемо додати на сторінку. Напишемо функцію appendPost(), яка цим займатиметься:
function appendPost(postData) {
    // Якщо даних немає, нічого не робимо:
    if (!postData) return;

    // Зберігаємо посилання на елемент, всередину якого додамо нові елементи-світи:
    const main = document.querySelector('main');

    // Використовуємо функцію composePost, яку напишемо трохи пізніше - вона перетворює дані на HTML-елемент:
    const postNode = composePost(postData);

    // Додаємо створений елемент у main:
    main.append(postNode)
}

// Функція appendPost() використовує в собі composePost().Напишемо і її також:
function composePost(postData) {
    // Якщо нічого не передано, нічого не повертаємо:
    if (!postData) return;

    // Звертаємося до шаблону, який створили раніше:
    const template = document.getElementById('post_template');

    // ...і витягаємо його вміст. У нашому випадку вмістом буде «скелет» світа, елемент article. Вказуємо, що нам необхідно його склонувати, а не використовувати сам елемент,так як він зміниться сам, і ми не зможемо зробити кілька світів:
    const post = template.content.cloneNode(true);

    // З postData отримуємо всю необхідну інформацію:
    const { title, body, likes, reposts } = postData;

    // Додаємо відповідні тексти та числа до потрібних місць у «скелеті»:
    post.querySelector('h1').innerText = title;
    post.querySelector('p').innerText = body;
    post.querySelector('button:first-child').innerText += likes;
    post.querySelector('button:last-child').innerText += reposts;

    // Повертаємо створений елемент, щоб його можна було додати на сторінку:
    return post;
}

// У реальному додатку нам потрібно було б повісити обробники кліків по кнопках в цьому новому свиті.Без обробників кнопки нічого не робитимуть. Поки додамо обробку даних у fetchPosts()
async function fetchPosts() {
    // Якщо ми вже надіслали запит або новий контент закінчився, то новий запит відправляти не треба:
    if (isLoading || !shouldLoad) return;

    // Запобігаємо новим запитам, поки не закінчиться цей:
    isLoading = true;
    const { posts, next } = await server.posts(nextPage);
    posts.forEach(appendPost);

    // Наступного разу запитуємо сторінку з номером next:
    nextPage = next;

    // Якщо ми побачили, що контент закінчився, відзначаємо, що більше запитувати нічого не треба:
    if (!next) shouldLoad = false;

    // Коли запит виконано та оброблено, знімаємо прапор isLoading:
    isLoading = false;
}

// Обробка проміжних та крайніх випадків. Якщо зараз запустити програму, то вона працюватиме. Але при прокручуванні до кінця сторінки замість однієї порції контенту надсилатиме кілька. (І ніколи не закінчить це робити 😁) Щоб вирішити ці проблеми, потрібно завести змінні, які стежитимуть за станом застосунку:
// Яка сторінка наступна:
let nextPage = 2;

// Якщо надіслали запит, але ще не отримали відповіді, не потрібно надсилати ще один запит.:
let isLoading = false;

// Якщо контент закінчився, взагалі більше не потрібно надсилати жодних запитів:
let shouldLoad = true;







// window.onscroll = () => changeHeaderBackground();

// function changeHeaderBackground() {
//     const header = document.querySelector('header');
//     const headerOffsetTrigger = header.offsetHeight;
//     const pageOffset = window.pageYOffset;

//     if (pageOffset > headerOffsetTrigger) {
//         header.classList.add('header--no-transparency');
//     } else {
//         header.classList.remove('header--no-transparency');
//     }
// }
// const { height: cardHeight } = document
//     .querySelector(".gallery")
//     .firstElementChild.getBoundingClientRect();

// window.scrollBy({
//     top: cardHeight * 2,
//     behavior: "smooth",
// });
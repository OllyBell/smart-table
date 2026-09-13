// import './fonts/ys-display/fonts.css'
// import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
// @todo: подключение
import { initSorting } from './components/sorting.js'; 
import { initPagination } from "./components/pagination.js";

import { initFiltering } from "./components/filtering.js";

import { initSearching } from "./components/searching.js";


// Создаем константу API, куда сохраняем результат initData.
// Данные подготовятся внутри, но отдаваться будут только по запросу.
const API = initData(); // в скобочках sourceData????


/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {

    if (!sampleTable || !sampleTable.container) {
        return {};
    }

    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);    // приведём количество страниц к числу
    const page = parseInt(state.page ?? 1);                // номер страницы по умолчанию 1 и тоже число

    return {                                            // расширьте существующий return вот так
        ...state,
        rowsPerPage,
        page
    };
}

// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ КОМПОНЕНТОВ ---
// Объявляем их заранее, чтобы они были видны и в init(), и в render()
let applyFiltering = null;
let updateIndexes = null;
let applyPagination = null;
let updatePagination = null;
let applySearch = null;
let applySorting = null; 

// Новая асинхронная функция инициализации
async function init() {
    // Получаем индексы через наш новый API
    //const { sellers, customers } = await API.getIndexes();
    const indexes = await API.getIndexes();

    if (typeof updateIndexes === 'function') {
        updateIndexes(sampleTable.filter.elements, {
            searchBySeller: indexes.sellers
        });
        console.log('✅ Фильтры заполнены списками');
    }
    
    // ВАЖНО: Теперь нам нужно передать эти индексы туда, где они нужны.
    // В твоем коде есть закомментированный блок инициализации фильтрации:
    /*
    if (sampleTable.filter && sampleTable.filter.elements) {
        applyFiltering = initFiltering(sampleTable.filter.elements, { 
            searchBySeller: indexes.sellers 
        });
    }
    */
    // Раскомментируй его и замени `indexes.sellers` на `sellers`.
    // Также убедись, что `customers` тоже передается, если компонент фильтрации его ждет.
    
    // if (sampleTable.filter && sampleTable.filter.elements) {
    //     applyFiltering = initFiltering(sampleTable.filter.elements, { 
    //         searchBySeller: sellers,
    //         searchByCustomer: customers // Если компонент ожидает и клиентов
    //     });
    // }

    
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {

    console.log('--- НАЧАЛО RENDER ---');
    console.log('🖱️ Действие (action):', action ? action.name : 'нет действия (change/reset)');

    let state = collectState(); // состояние полей из таблицы

    // 👇 ЛОГ 1: Что мы реально прочитали из HTML формы?
    // Если тут page: 1, значит, форма не обновилась (проблема в HTML или table.js)
    console.log('📋 STATE FROM FORM:', state); 

    let query = {}; // создание пустого запроса

    // Получаем данные через наш API
    // Теперь мы не берем данные из глобальной переменной, а запрашиваем их каждый раз при рендере
    //const { total, items } = await API.getRecords(query);

    //let result = [...items]; // Копируем полученные данные, чтобы не мутировать оригинал

    // @todo: использование

    // ШАГ 1: ПОИСК
    if (typeof applySearch === 'function') { 
        query = applySearch(query, state, action);
    }

    // ШАГ 2: ФИЛЬТРАЦИЯ (Сначала убираем лишнее)
    if (typeof applyFiltering === 'function') {
        query = applyFiltering(query, state, action);
    }

    // ШАГ 3: СОРТИРОВКА
    // Сортируем весь массив данных согласно нажатой кнопке
    if (typeof applySorting === 'function') {
        query = applySorting(query, state, action);
    }

    // ШАГ 4: ПАГИНАЦИЯ
    // Берем уже отсортированный массив и показываем только нужную страницу
    // if (typeof applyPagination === 'function') {
    //     query = applyPagination(query, state, action);
    // }


    // САМОЕ ВАЖНОЕ ДЛЯ ПАГИНАЦИИ:
    // Мы должны добавить параметры limit (сколько строк) и page (какая страница) 
    // в объект query ПЕРЕД тем, как отправлять его на сервер.
    if (typeof applyPagination === 'function') {
        query = applyPagination(query, state, action);
    }
    // 👇 ЛОГ 2: Что мы отправляем на сервер?
    // Если тут page: 1, а в STATE было page: 2, значит проблема в applyPagination
    console.log('🚀 QUERY BEFORE REQUEST:', query);
    try {
        // 3. Запрос к серверу
        const { total, items } = await API.getRecords(query);
        
        // 👇 ЛОГ 3: Что вернул сервер?
        // Если total большой, а items те же самые — сервер игнорирует page.
        console.log('📥 SERVER RESPONSE:', { total, itemsCount: items.length });

        // 4. Обновляем интерфейс пагинации (рисуем кнопки)
        if (typeof updatePagination === 'function') {
            updatePagination(total, query);
        }

        // 5. Отрисовываем таблицу
        if (typeof sampleTable.render === 'function') {
            sampleTable.render(items);
        }
        
        console.log('✅ Таблица обновлена успешно');
    } catch (error) {
        console.error('💥 Ошибка при запросе к серверу:', error);
    }
}

// 1. Создаем таблицу (это создает DOM-элементы и вешает базовые слушатели)
const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// Добавляем контейнер таблицы на страницу
const appRoot = document.querySelector('#app');
if (appRoot) {
    appRoot.appendChild(sampleTable.container);
} else {
    console.error('Элемент #app не найден в HTML!');
}




// 1. Сначала инициализируем ПОИСК (так как он должен работать первым)
if (sampleTable.search && sampleTable.search.elements) {
    // Передаем элемент поля ввода и имя поля ('search'), которое будет в state
    applySearch = initSearching(sampleTable.search.elements.searchInput, 'search');
} else {
    console.warn('⚠️ Элементы поиска не найдены. Проверьте шаблон search и ключ searchInput.');
}

// Инициализация фильтрации
// if (sampleTable.filter && sampleTable.filter.elements) {
//     applyFiltering = initFiltering(sampleTable.filter.elements, { // передаём элементы фильтра
//         // для элемента с именем searchBySeller устанавливаем массив продавцов
//         searchBySeller: indexes.sellers // Передаем массив продавцов из подготовленных индексов
//     });
// } else {
//     console.warn('⚠️ Элементы фильтра не найдены. Проверьте шаблон filter и ключ searchBySeller.');
// }
if (sampleTable.filter && sampleTable.filter.elements) {
    const result = initFiltering(sampleTable.filter.elements);
    applyFiltering = result.applyFiltering;
    updateIndexes = result.updateIndexes;
} else {
    console.warn('⚠️ Элементы фильтра не найдены. Проверьте шаблон filter и ключ searchBySeller.');
}

// Инициализация сортировки
if (sampleTable.header && sampleTable.header.elements) {
    applySorting = initSorting([        // Нам нужно передать сюда массив элементов, которые вызывают сортировку, чтобы изменять их визуальное представление
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);
} else {
    console.warn('⚠️ Элементы сортировки не найдены. Проверьте шаблон header и ключи sortByDate/sortByTotal.');
}


// Инициализация пагинации
if (sampleTable.pagination && sampleTable.pagination.elements) {
    const paginationResult = initPagination(
        sampleTable.pagination.elements,
        (el, page, isCurrent) => {
            const input = el.querySelector('input');
            const label = el.querySelector('span');

            if (input) input.value = page;
            if (label) label.textContent = page;
            if (input) input.checked = isCurrent;

            return el;
        }
    );
    applyPagination = paginationResult.applyPagination;
    updatePagination = paginationResult.updatePagination;
}


// ЗАПУСКАЕМ ПЕРВУЮ ОТРИСОВКУ
init().then(render);
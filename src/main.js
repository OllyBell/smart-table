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

// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ КОМПОНЕНТОВ
// Объявляем их заранее, чтобы они были видны и в init(), и в render()
let applyFiltering = null;
let updateIndexes = null;
let applyPagination = null;
let updatePagination = null;
let applySearch = null;
let applySorting = null; 

// Новая асинхронная функция инициализации
async function init() {
    // Получаем индексы через новый API
    //const { sellers, customers } = await API.getIndexes();
    const indexes = await API.getIndexes();

    if (typeof updateIndexes === 'function') {
        updateIndexes(sampleTable.filter.elements, {
            searchBySeller: indexes.sellers
        });
    }
    
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {

    console.log('--- НАЧАЛО RENDER ---');
    console.log('🖱️ Действие (action):', action ? action.name : 'нет действия (change/reset)');

    let state = collectState(); // состояние полей из таблицы

    let query = {}; // создание пустого запроса

    // @todo: использование

    // ПОИСК
    if (typeof applySearch === 'function') { 
        query = applySearch(query, state, action);
    }

    // ФИЛЬТРАЦИЯ (Сначала убираем лишнее)
    if (typeof applyFiltering === 'function') {
        query = applyFiltering(query, state, action);
    }

    // СОРТИРОВКА
    if (typeof applySorting === 'function') {
        query = applySorting(query, state, action);
    }

    // ПАГИНАЦИЯ
    if (typeof applyPagination === 'function') {
        query = applyPagination(query, state, action);
    }

    try {
        // Запрос к серверу
        const { total, items } = await API.getRecords(query);

        // Обновляем интерфейс пагинации (рисуем кнопки)
        if (typeof updatePagination === 'function') {
            updatePagination(total, query);
        }

        // Отрисовываем таблицу
        if (typeof sampleTable.render === 'function') {
            sampleTable.render(items);
        }
        
        console.log('Таблица обновлена успешно');
    } catch (error) {
        console.error('Ошибка при запросе к серверу:', error);
    }
}

// Создаем таблицу (это создает DOM-элементы и вешает базовые слушатели)
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



if (sampleTable.search && sampleTable.search.elements) {
    
    applySearch = initSearching(sampleTable.search.elements.searchInput, 'search');
} else {
    console.warn('⚠️ Элементы поиска не найдены. Проверьте шаблон search и ключ searchInput.');
}

// Инициализация фильтрации

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
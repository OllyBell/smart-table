import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
// @todo: подключение
import { initSorting } from './components/sorting.js'; 
import { initPagination } from "./components/pagination.js";

import { initFiltering } from "./components/filtering.js";

import { initSearching } from "./components/searching.js";


// Исходные данные используемые в render()
const {data, ...indexes} = initData(sourceData);

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

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
    let state = collectState(); // состояние полей из таблицы

    console.log('📦 Исходные данные (длина):', data.length);
    console.log('👁 Первая строка данных:', data[0]);

    let result = [...data]; // копируем для последующего изменения
    // @todo: использование

    // ШАГ 1: ПОИСК
    if (typeof applySearch === 'function') { 
        result = applySearch(result, state, action);
    }

    // ШАГ 2: ФИЛЬТРАЦИЯ (Сначала убираем лишнее)
    if (typeof applyFiltering === 'function') {
        result = applyFiltering(result, state, action);
    }

    // ШАГ 3: СОРТИРОВКА
    // Сортируем весь массив данных согласно нажатой кнопке
    if (typeof applySorting === 'function') {
        result = applySorting(result, state, action);
    }

    // ШАГ 4: ПАГИНАЦИЯ
    // Берем уже отсортированный массив и показываем только нужную страницу
    if (typeof applyPagination === 'function') {
        result = applyPagination(result, state, action);
    }


    // Отрисовываем итоговый массив строк
    if (typeof sampleTable.render === 'function') {
        sampleTable.render(result);
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

// @todo: инициализация

let applySearch = null;
let applySorting = null;
let applyPagination = null;
let applyFiltering = null;


// 1. Сначала инициализируем ПОИСК (так как он должен работать первым)
if (sampleTable.search && sampleTable.search.elements) {
    // Передаем элемент поля ввода и имя поля ('search'), которое будет в state
    applySearch = initSearching(sampleTable.search.elements.searchInput, 'search');
} else {
    console.warn('⚠️ Элементы поиска не найдены. Проверьте шаблон search и ключ searchInput.');
}

// Инициализация фильтрации
if (sampleTable.filter && sampleTable.filter.elements) {
    applyFiltering = initFiltering(sampleTable.filter.elements, { // передаём элементы фильтра
        // для элемента с именем searchBySeller устанавливаем массив продавцов
        searchBySeller: indexes.sellers // Передаем массив продавцов из подготовленных индексов
    });
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
    applyPagination = initPagination(
        sampleTable.pagination.elements, // передаём сюда элементы пагинации, найденные в шаблоне
        (el, page, isCurrent) => {                    // и колбэк, чтобы заполнять кнопки страниц данными
            const input = el.querySelector('input');
            const label = el.querySelector('span');
            
            if (input) input.value = page;
            if (label) label.textContent = page;
            
            // input может быть null, если структура шаблона отличается
            if (input) input.checked = isCurrent;
            
            return el;
        }
    );
} else {
    console.warn('⚠️ Элементы пагинации не найдены. Проверьте шаблон pagination.');
}


// 3. ЗАПУСКАЕМ ПЕРВУЮ ОТРИСОВКУ
// Теперь все переменные (applySorting, applyPagination, sampleTable) точно созданы!
render();

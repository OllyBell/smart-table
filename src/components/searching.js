import {rules, createComparison} from "../lib/compare.js";


export function initSearching(searchField) {
    // @todo: #5.1 — настроить компаратор

    // 1. Создаем массив правил специально для поиска.
    // 'skipEmptyTargetValues': если пользователь ничего не ввел, поиск не срабатывает (показываем всё).
    // rules.searchMultipleFields(...): правило, которое ищет подстроку сразу в нескольких полях данных.
    //    - Первый аргумент: имя поля в state (которое мы передали в searchField).
    //    - Второй аргумент: список полей в данных, где нужно искать (date, customer, seller).
    //    - Третий аргумент: false (обычно означает регистронезависимый поиск или точное поведение, зависит от реализации библиотеки).
    // const searchRules = [
    //     'skipEmptyTargetValues',
    //     rules.searchMultipleFields(searchField, ['date', 'customer_id', 'seller_id'], false)
    // ];

    // 2. Создаем саму функцию сравнения (компаратор) на основе этих правил.
    // Теперь compare(row, state) умеет проверять, есть ли текст из state[searchField] в указанных полях строки row.
    // const compare = createComparison(searchRules);
    const compare = createComparison(
        rules.searchMultipleFields(searchField, ['date', 'customer_id', 'seller_id'], false),
        { skipEmptyTargetValues: true } // Если библиотека принимает второй аргумент как опции
    );

    return (data, state, action) => {
        // @todo: #5.2 — применить компаратор
        // Просто фильтруем массив данных: оставляем только те строки, для которых compare возвращает true.
        // Если поле поиска пустое, правило 'skipEmptyTargetValues' вернет true для всех строк.
        return data.filter(row => compare(row, state));
        
    }
}
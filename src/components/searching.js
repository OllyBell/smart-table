import { createComparison, rules } from "../lib/compare.js";

export function initSearching(searchField) {
    // @todo: #5.1 — настроить компаратор
    
    // ГЛАВНОЕ: Передаем ТОЛЬКО имя правила в виде массива строк.
    // Это единственный способ избежать ошибки ruleNames.map is not a function.
    // Библиотека сама внутри себя вызовет rules['searchMultipleFields']() 
    // и применит нужные настройки.
    const compare = createComparison(['searchMultipleFields']);

    return (data, state, action) => {
        // @todo: #5.2 — применить компаратор
        // Функция compare теперь умеет работать с state.
        // Она сама знает, что искать в полях, соответствующих searchField.
        return data.filter(row => compare(row, state));
    };
}
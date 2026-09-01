import {createComparison, defaultRules} from "../lib/compare.js";



export function initFiltering(elements, config) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(config).forEach((elementName) => {
        const selectElement = elements[elementName];
        
        if (selectElement) {
            // Создаем массив элементов <option>
            const options = Object.values(config[elementName]).map(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                return option;
            });

            // Вставляем все опции в select. 
            // Оператор ... распаковывает массив [opt1, opt2, opt3] в аргументы opt1, opt2, opt3
            selectElement.append(...options);
        } else {
            console.warn(`Элемент ${elementName} не найден в шаблоне фильтра.`);
        }
    });

    // @todo: #4.3 — настроить компаратор
    const compare = createComparison(defaultRules);

    return (data, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if (action && action.name === 'clear') {
            const parent = action.parentElement;
            const input = parent ? parent.querySelector('input') : null;
            
            if (input) {
                input.value = ''; // Очищаем визуально
                // input.dispatchEvent(new Event('input')); // Иногда нужно, чтобы сработал change/input event
            }
            
            // Так как мы очистили поле, нам не нужно применять фильтрацию.
            // Мы можем сразу вернуть исходные данные, чтобы не тратить ресурсы на перебор.
            // Но важно: мы НЕ меняем state, мы просто возвращаем data как есть.
            return data; 
        }

        // @todo: #4.5 — отфильтровать данные используя компаратор
        return data.filter(row => compare(row, state));
    }
}
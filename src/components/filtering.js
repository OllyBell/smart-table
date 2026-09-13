export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            elements[elementName].append(...Object.values(indexes[elementName]).map(name => {
                const el = document.createElement('option');
                el.textContent = name;
                el.value = name;
                return el;
            }))
        })
    }

    const applyFiltering = (query, state, action) => {
        // код с обработкой очистки поля
        if (action && action.name === 'clear') {
            const parent = action.parentElement;
            const input = parent ? parent.querySelector('input') : null;
            
            if (input) {
                input.value = ''; // Визуально очищаем поле
                // Примечание: В серверной модели нам важно, чтобы при следующем рендере
                // это поле не попало в query. Так как value теперь пустой, 
                // цикл ниже сам его проигнорирует.
            }
            
            // Возвращаем текущий query без изменений (или можно вернуть пустой, 
            // но лучше оставить текущий, чтобы не сбросить другие фильтры случайно)
            return query; 
        }
         

        // @todo: #4.5 — отфильтровать данные, используя компаратор
        const filter = {};
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) { // ищем поля ввода в фильтре с непустыми данными
                    filter[`filter[${elements[key].name}]`] = elements[key].value; // чтобы сформировать в query вложенный объект фильтра
                }
            }
        })

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query; // если в фильтре что-то добавилось, применим к запросу
    }

    return {
        updateIndexes,
        applyFiltering
    }
}
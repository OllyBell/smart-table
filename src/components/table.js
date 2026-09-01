import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    // @todo: #1.2 —  вывести дополнительные шаблоны до и после таблицы
    // 1. Обработка шаблонов "ДО" таблицы (before)
    // Важно: идем в обратном порядке, чтобы при prepend они встали правильно
    if (before && before.length > 0) {
        before.reverse().forEach(subName => {
            // Клонируем шаблон и сразу сохраняем объект в root под ключом subName
            // Теперь можно будет обращаться как root.search, root.header и т.д.
            root[subName] = cloneTemplate(subName);
            
            // Вставляем контейнер этого шаблона в начало основного контейнера таблицы
            root.container.prepend(root[subName].container);
        });
    }

    // 2. Обработка шаблонов "ПОСЛЕ" таблицы (after)
    // Здесь порядок обычный, используем append
    if (after && after.length > 0) {
        after.forEach(subName => {
            root[subName] = cloneTemplate(subName); // клонируем и получаем объект, сохраняем в таблице
            
            // Вставляем контейнер в конец основного контейнера
            root.container.append(root[subName].container);
        });
    }

    // @todo: #1.3 —  обработать события и вызвать onAction()
    // 1. Обработка change: просто сигнализируем, что что-то изменилось
    root.container.addEventListener('change', (e) => {
        onAction(); 
    });

    // 2. Обработка reset: ждем, пока браузер очистит поля, потом зовем onAction
    root.container.addEventListener('reset', (e) => {
        setTimeout(() => {
            onAction();
        }, 0);
    });

    // 3. Обработка submit: останавливаем перезагрузку, передаем кнопку
    root.container.addEventListener('submit', (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });


    const render = (data) => {
        // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
        //const nextRows = [];
        const nextRows = data.map(item => {
            const row = cloneTemplate(rowTemplate);
            Object.keys(item).forEach(key => {
                if (row.elements[key]) {
                    row.elements[key].textContent = item[key];
                }
            });
            return row.container;
        });
        root.elements.rows.replaceChildren(...nextRows);
    }

    return {...root, render};
}
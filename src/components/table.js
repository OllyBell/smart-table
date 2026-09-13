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
    // Обработка шаблонов "ДО" таблицы (before)
    // идем в обратном порядке, чтобы при prepend они встали правильно
    if (before && before.length > 0) {
        before.reverse().forEach(subName => {

            root[subName] = cloneTemplate(subName);
            
            root.container.prepend(root[subName].container);
        });
    }

    if (after && after.length > 0) {
        after.forEach(subName => {
            root[subName] = cloneTemplate(subName);
            
            root.container.append(root[subName].container);
        });
    }

    // @todo: #1.3 —  обработать события и вызвать onAction()
    root.container.addEventListener('change', (e) => {
        onAction(undefined); 
    });

    root.container.addEventListener('reset', (e) => {
        setTimeout(() => {
            onAction(undefined);
        }, 0);
    });

    root.container.addEventListener('submit', (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });


    const render = (data) => {
        // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
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
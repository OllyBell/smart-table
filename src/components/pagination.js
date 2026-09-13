import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // @todo: #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
    const pageTemplate = pages.firstElementChild.cloneNode(true);    // в качестве шаблона берём первый элемент из контейнера со страницами
    pages.firstElementChild.remove();                                // и удаляем его (предполагаем, что там больше ничего, как вариант, можно и всё удалить из pages)

    // Переменная для хранения общего количества страниц (чтобы работала кнопка "Last")
    let pageCount = 0; 


    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        // Обработка действий (Prev, Next, First, Last)
        if (action) {
            switch (action.name) {
                case 'prev': page = Math.max(1, page - 1); break;
                case 'next': 
                    
                    // page = Math.min(pageCount, page + 1);
                    page = page + 1;
                    break;
                case 'first': page = 1; break;
                case 'last': //page = pageCount; break;
                    if (pageCount > 0) {
                        page = pageCount;
                    }
                    break;
            }
        }

        
        return { ...query, limit, page };
    }

    
    const updatePagination = (total, { page, limit }) => {
        // Считаем реальное количество страниц на основе ответа сервера
        pageCount = Math.ceil(total / limit);
        
        // Гарантируем, что текущая страница не больше общего количества
        const safePage = Math.min(page, pageCount);

        // Получаем список видимых страниц
        const visiblePages = getPages(safePage, pageCount, 5);

        // Рисуем кнопки
        pages.replaceChildren(...visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            return createPage(el, pageNumber, pageNumber === safePage);
        }));

        // Обновляем текст статуса
        fromRow.textContent = (safePage - 1) * limit + 1;
        toRow.textContent = Math.min((safePage * limit), total);
        totalRows.textContent = total;
    }

    return {
    updatePagination,
    applyPagination
    };

    
}
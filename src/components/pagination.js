import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // @todo: #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
    const pageTemplate = pages.firstElementChild.cloneNode(true);    // в качестве шаблона берём первый элемент из контейнера со страницами
    pages.firstElementChild.remove();                                // и удаляем его (предполагаем, что там больше ничего, как вариант, можно и всё удалить из pages)

    // 2. Переменная для хранения общего количества страниц (чтобы работала кнопка "Last")
    let pageCount = 0; 

    /**
     * ЭТА ФУНКЦИЯ ВЫЗЫВАЕТСЯ ДО ЗАПРОСА К СЕРВЕРУ.
     * Она берет текущее состояние (page, rowsPerPage) и добавляет параметры в query.
     * Она НЕ рисует кнопки и НЕ режет данные.
     */
    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;
        // let page = parseInt(state.page) || 1;

        // Обработка действий (Prev, Next, First, Last)
        if (action) {
            switch (action.name) {
                case 'prev': page = Math.max(1, page - 1); break;
                case 'next': 
                    // Важно: если мы еще не знаем pageCount (первый запуск), считаем условно
                    // Но лучше брать pageCount из замыкания или передавать его. 
                    // Для простоты пока используем большое число или текущее pageCount
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

        // Возвращаем НОВЫЙ объект query с добавленными параметрами limit и page
        // Мы не меняем исходный query, а создаем новый (принцип иммутабельности)
        // return Object.assign({}, query, {
        //     limit,
        //     page
        // });
        return { ...query, limit, page };
    }

    /**
     * ЭТА ФУНКЦИЯ ВЫЗЫВАЕТСЯ ПОСЛЕ ПОЛУЧЕНИЯ ДАННЫХ ОТ СЕРВЕРА.
     * Она получает total (сколько всего записей) и обновляет интерфейс пагинации.
     */
    const updatePagination = (total, { page, limit }) => {
        // 1. Считаем реальное количество страниц на основе ответа сервера
        pageCount = Math.ceil(total / limit);
        
        // Гарантируем, что текущая страница не больше общего количества
        // (на случай, если на последней странице удалили данные)
        const safePage = Math.min(page, pageCount);

        // 2. Получаем список видимых страниц (например, [1, 2, 3, 4, 5] или [10, 11, 12, 13, 14])
        const visiblePages = getPages(safePage, pageCount, 5);

        // 3. Рисуем кнопки
        pages.replaceChildren(...visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            return createPage(el, pageNumber, pageNumber === safePage);
        }));

        // 4. Обновляем текст статуса ("Showing 1 to 10 of 100")
        fromRow.textContent = (safePage - 1) * limit + 1;
        toRow.textContent = Math.min((safePage * limit), total);
        totalRows.textContent = total;
    }

    return {
    updatePagination,
    applyPagination
    };

    
}
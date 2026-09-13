// 1. Сначала ВСЕ импорты
import { makeIndex } from "./lib/utils.js";

// константа с адресом сервера
const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api'; 

// переменные для кеширования данных
let sellers;
let customers;
let lastResult;
let lastQuery;

// функция для приведения строк в тот вид, который нужен нашей таблице
const mapRecords = (data) => data.map(item => ({
    id: item.receipt_id,
    date: item.date,
    seller: sellers[item.seller_id],
    customer: customers[item.customer_id],
    total: item.total_amount
}));

// Экспортируемая функция
export function initData() {
    // функция получения индексов
    const getIndexes = async () => {
        // Если данные уже загружены (кеш), просто возвращаем их
        if (sellers && customers) {
            return { sellers, customers };
        }

        try {
            // Параллельно запрашиваем продавцов и клиентов
            const [rawSellers, rawCustomers] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(res => {
                    if (!res.ok) throw new Error(`Ошибка продавцов: ${res.status}`);
                    return res.json();
                }),
                fetch(`${BASE_URL}/customers`).then(res => {
                    if (!res.ok) throw new Error(`Ошибка клиентов: ${res.status}`);
                    return res.json();
                }),
            ]);

            // ВАЖНО: Сервер уже прислал данные в формате { id: "Имя Фамилия" }
            // Нам не нужно делать makeIndex, так как reduce упадет на объекте.
            // Мы просто сохраняем ответ сервера как есть.
            sellers = rawSellers;
            customers = rawCustomers;

            console.log('✅ Справочники успешно загружены и сохранены в кэш');
            return { sellers, customers };

        } catch (error) {
            console.error('💥 Ошибка при загрузке индексов:', error);
            throw error; // Пробрасываем ошибку дальше, чтобы main.js мог её обработать
        }
    };
    

    // функция получения записей о продажах с сервера
    const getRecords = async (query = {}, isUpdated = false) => {
        const qs = new URLSearchParams(query); // преобразуем объект параметров в SearchParams объект, представляющий query часть url
        const nextQuery = qs.toString(); // и приводим к строковому виду

        if (lastQuery === nextQuery && !isUpdated) { // isUpdated параметр нужен, чтобы иметь возможность делать запрос без кеша
            return lastResult; // если параметры запроса не поменялись, то отдаём сохранённые ранее данные
        }

        // если прошлый квери не был ранее установлен или поменялись параметры, то запрашиваем данные с сервера
        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        lastQuery = nextQuery; // сохраняем для следующих запросов
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    };
}
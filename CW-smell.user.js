// ==UserScript==
// @name         CW smell
// @namespace    http://tampermonkey.net/
// @version      1.0.11
// @description  Меняет запахи по исходному запаху + по имени/статусу/должности.
// @author       achterstem
// @match        http*://*.catwar.net/*
// @match        http*://*.catwar.su/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=catwar.su
// @license      MIT
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @run-at       document-idle
// @homepageURL  https://greasyfork.org/ru/scripts/555607-cw-smell
// @downloadURL  https://github.com/Achterstem/CW-smell/raw/refs/heads/main/CW-smell.user.js
// @updateURL    https://github.com/Achterstem/CW-smell/raw/refs/heads/main/CW-smell.user.js
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'CUSTOM_SMELLS_DATA';
    const BATCH_SIZE = 10; // Количество клеток для обработки за один раз
    const UPDATE_DELAY = 100; // Задержка между обновлениями в мс

    const gmGetValueSync = (key, defaultValue) => {
        if (typeof GM_getValue === 'function') {
            try {
                return GM_getValue(key, defaultValue);
            } catch (e) {
                console.error("Возврат дефолта.", e);
            }
        }
        return defaultValue;
    };

    const gmSetValueSync = (key, value) => {
        if (typeof GM_setValue === 'function') {
            try {
                GM_setValue(key, value);
            } catch (e) {
                console.error("Сохранение не выполнено.", e);
            }
        }
    };

    const gmDeleteValueSync = (key) => {
        if (typeof GM_deleteValue === 'function') {
            try {
                GM_deleteValue(key);
            } catch (e) {
                console.error("Удаление не выполнено.", e);
            }
        }
    };

    const DEFAULT_RULES = [
        // ЗАСТЫВШАЯ ЭПОХА
        ['odoroj/232.png', 'Провидец Времени', 'odoroj/432.png'],
        ['odoroj/232.png', 'Провидица Времени', 'odoroj/432.png'],
        ['odoroj/232.png', 'Наследник', 'odoroj/432.png'],
        ['odoroj/232.png', 'Наследница', 'odoroj/432.png'],
        ['odoroj/232.png', 'Верховодец', 'odoroj/432.png'],
        ['odoroj/232.png', 'Сказитель', 'odoroj/432.png'],
        ['odoroj/232.png', 'Сказительница', 'odoroj/432.png'],
        ['odoroj/232.png', 'Егерь', 'odoroj/432.png'],
        ['odoroj/232.png', 'Старший Отец', 'odoroj/432.png'],
        ['odoroj/232.png', 'Старшая Матерь', 'odoroj/432.png'],
        ['odoroj/232.png', 'Знахарь', 'odoroj/432.png'],
        ['odoroj/232.png', 'Последователь Знахаря', 'odoroj/432.png'],
        ['odoroj/232.png', 'Последовательница Знахаря', 'odoroj/432.png'],
        ['odoroj/232.png', 'Вояка', 'odoroj/432.png'],
        ['odoroj/232.png', 'Добытчик', 'odoroj/432.png'],
        ['odoroj/232.png', 'Добытчица', 'odoroj/432.png'],
        ['odoroj/232.png', 'Заботливый Отец', 'odoroj/432.png'],
        ['odoroj/232.png', 'Заботливая Матерь', 'odoroj/432.png'],
        ['odoroj/232.png', 'Последователь', 'odoroj/432.png'],
        ['odoroj/232.png', 'Последовательница', 'odoroj/432.png'],
        ['odoroj/232.png', 'Постигающий', 'odoroj/432.png'],
        ['odoroj/232.png', 'Постигающая', 'odoroj/432.png'],
        ['odoroj/232.png', 'Новорожденное Дитя', 'odoroj/432.png'],
        ['odoroj/232.png', 'Старец', 'odoroj/432.png'],
        ['odoroj/232.png', 'Старица', 'odoroj/432.png'],

        // ПЛЕМЯ ТУМАННОГО ЗАЛИВА
        ['odoroj/232.png', 'возрождённый', 'odoroj/177.png'],
        ['odoroj/232.png', 'возрождённая', 'odoroj/177.png'],
        ['odoroj/232.png', 'воспитанник', 'odoroj/177.png'],
        ['odoroj/232.png', 'воспитанница', 'odoroj/177.png'],
        ['odoroj/232.png', 'преданный Моря', 'odoroj/177.png'],
        ['odoroj/232.png', 'преданная Моря', 'odoroj/177.png'],
        ['odoroj/232.png', 'старший преданный Моря', 'odoroj/177.png'],
        ['odoroj/232.png', 'старшая преданная Моря', 'odoroj/177.png'],
        ['odoroj/232.png', 'поверенный', 'odoroj/177.png'],
        ['odoroj/232.png', 'поверенная', 'odoroj/177.png'],
        ['odoroj/232.png', 'приближённый', 'odoroj/177.png'],
        ['odoroj/232.png', 'приближённая', 'odoroj/177.png'],
        ['odoroj/232.png', 'советник', 'odoroj/177.png'],
        ['odoroj/232.png', 'советница', 'odoroj/177.png'],
        ['odoroj/232.png', 'служитель Моря', 'odoroj/177.png'],
        ['odoroj/232.png', 'служительница Моря', 'odoroj/177.png'],
        ['odoroj/232.png', 'душа Моря', 'odoroj/177.png'],
        ['odoroj/232.png', 'неприкасаемый', 'odoroj/177.png'],
        ['odoroj/232.png', 'неприкасаемая', 'odoroj/177.png'],
        ['odoroj/232.png', 'сухопутный', 'odoroj/177.png'],
        ['odoroj/232.png', 'сухопутная', 'odoroj/177.png'],
        ['odoroj/232.png', 'очистившийся', 'odoroj/177.png'],
        ['odoroj/232.png', 'очистившаяся', 'odoroj/177.png'],
        ['odoroj/232.png', 'Помнящий', 'odoroj/177.png'],
        ['odoroj/232.png', 'Помнящая', 'odoroj/177.png'],
        ['odoroj/232.png', 'преемник Помнящего', 'odoroj/177.png'],
        ['odoroj/232.png', 'преемница Помнящего', 'odoroj/177.png'],
        ['odoroj/232.png', 'житель пещер', 'odoroj/177.png'],
        ['odoroj/232.png', 'жительница пещер', 'odoroj/177.png'],
        ['odoroj/232.png', 'представитель жителей пещер', 'odoroj/177.png'],
        ['odoroj/232.png', 'представительница жителей пещер', 'odoroj/177.png'],
        ['odoroj/232.png', 'житель скал', 'odoroj/177.png'],
        ['odoroj/232.png', 'жительница скал', 'odoroj/177.png'],
        ['odoroj/232.png', 'вождь жителей скал', 'odoroj/177.png'],

        // СОШЕДШИЕ
        ['odoroj/232.png', 'Путешественник', 'odoroj/400.png'],
        ['odoroj/232.png', 'Путешественница', 'odoroj/400.png'],
        ['odoroj/232.png', 'Искатель приключений', 'odoroj/400.png'],
        ['odoroj/232.png', 'Искательница приключений', 'odoroj/400.png'],
        ['odoroj/232.png', 'Старший искатель приключений', 'odoroj/400.png'],
        ['odoroj/232.png', 'Старшая искательница приключений', 'odoroj/400.png'],
        ['odoroj/232.png', 'Рыцарь', 'odoroj/400.png'],
        ['odoroj/232.png', 'Цисин', 'odoroj/400.png'],
        ['odoroj/232.png', 'Издатель', 'odoroj/400.png'],
        ['odoroj/232.png', 'Мудрец', 'odoroj/400.png'],
        ['odoroj/232.png', 'Эйдолон', 'odoroj/400.png'],
        ['odoroj/232.png', 'Гладиатор', 'odoroj/400.png'],
        ['odoroj/232.png', 'Предвестник', 'odoroj/400.png'],
        ['odoroj/232.png', 'Анемо Архонт', 'odoroj/400.png'],
        ['odoroj/232.png', 'Гео Архонт', 'odoroj/400.png'],
        ['odoroj/232.png', 'Электро Архонт', 'odoroj/400.png'],
        ['odoroj/232.png', 'Дендро Архонт', 'odoroj/400.png'],
        ['odoroj/232.png', 'Гидро Архонт', 'odoroj/400.png'],
        ['odoroj/232.png', 'Пиро Архонт', 'odoroj/400.png'],
        ['odoroj/232.png', 'Крио Архонт', 'odoroj/400.png'],
        ['odoroj/232.png', 'Избранник небес', 'odoroj/400.png'],
        ['odoroj/232.png', 'Хранитель небесного порядка', 'odoroj/400.png'],
        ['odoroj/232.png', 'Маленькая океанида', 'odoroj/400.png'],
        ['odoroj/232.png', 'Таинственный натурфилософ', 'odoroj/400.png'],
        ['odoroj/232.png', 'Дракон рассвета и заката', 'odoroj/400.png'],
        ['odoroj/232.png', 'Дракон рассвета и заката', 'odoroj/400.png'],
        ['odoroj/232.png', 'Рыцарь Вечности', 'odoroj/400.png'],
        ['odoroj/232.png', 'Нечто из иного мира', 'odoroj/400.png'],
        ['odoroj/232.png', 'Странствующий звездочёт', 'odoroj/400.png'],

        // АКАДЕМИЯ ХАУККА
        ['odoroj/232.png', 'Ректор', 'odoroj/466.png'],
        ['odoroj/232.png', 'Проректор', 'odoroj/466.png'],
        ['odoroj/232.png', 'Декан', 'odoroj/466.png'],
        ['odoroj/232.png', 'Социальный педагог', 'odoroj/466.png'],
        ['odoroj/232.png', 'Медбрат', 'odoroj/466.png'],
        ['odoroj/232.png', 'Медсестра', 'odoroj/466.png'],
        ['odoroj/232.png', 'Профессор', 'odoroj/466.png'],
        ['odoroj/232.png', 'Преподаватель', 'odoroj/466.png'],
        ['odoroj/232.png', 'Куратор', 'odoroj/466.png'],
        ['odoroj/232.png', 'Выпускник', 'odoroj/466.png'],
        ['odoroj/232.png', 'Студент', 'odoroj/466.png'],
        ['odoroj/232.png', 'Староста', 'odoroj/466.png'],
        ['odoroj/232.png', 'Астроном', 'odoroj/466.png'],
        ['odoroj/232.png', 'Большая шишка', 'odoroj/466.png'],
        ['odoroj/232.png', 'Гражданин', 'odoroj/466.png'],

        // ОЗХ
        ['odoroj/150.png', 'Вождь', 'odoroj/452.png'],
        ['odoroj/150.png', 'Преемник', 'odoroj/452.png'],
        ['odoroj/150.png', 'Преемница', 'odoroj/452.png'],
        ['odoroj/150.png', 'Голос Мару', 'odoroj/452.png'],
        ['odoroj/150.png', 'Шаман', 'odoroj/452.png'],
        ['odoroj/150.png', 'Голос Калао', 'odoroj/452.png'],
        ['odoroj/150.png', 'Шёпот Мару', 'odoroj/452.png'],
        ['odoroj/150.png', 'Шёпот Исины', 'odoroj/452.png'],
        ['odoroj/150.png', 'Шёпот Калао', 'odoroj/452.png'],
        ['odoroj/150.png', 'Благословлённый Мару', 'odoroj/452.png'],
        ['odoroj/150.png', 'Благословлённый Исиной', 'odoroj/452.png'],
        ['odoroj/150.png', 'Благословлённый Калао', 'odoroj/452.png'],
        ['odoroj/150.png', 'Благословлённая Мару', 'odoroj/452.png'],
        ['odoroj/150.png', 'Благословлённая Исиной', 'odoroj/452.png'],
        ['odoroj/150.png', 'Благословлённая Калао', 'odoroj/452.png'],
        ['odoroj/150.png', 'Последователь Мару', 'odoroj/452.png'],
        ['odoroj/150.png', 'Последователь Исины', 'odoroj/452.png'],
        ['odoroj/150.png', 'Последователь Калао', 'odoroj/452.png'],
        ['odoroj/150.png', 'Последовательница Мару', 'odoroj/452.png'],
        ['odoroj/150.png', 'Последовательница Исины', 'odoroj/452.png'],
        ['odoroj/150.png', 'Последовательница Калао', 'odoroj/452.png'],
        ['odoroj/150.png', 'Познающий Пути', 'odoroj/452.png'],
        ['odoroj/150.png', 'Познающая Пути', 'odoroj/452.png'],
        ['odoroj/150.png', 'Благословенный Шакти', 'odoroj/452.png'],
        ['odoroj/150.png', 'Благословенная Шакти', 'odoroj/452.png'],
        ['odoroj/150.png', 'Завершивший Путь', 'odoroj/452.png'],
        ['odoroj/150.png', 'Завершившая Путь', 'odoroj/452.png'],
        ['odoroj/150.png', 'Малютка', 'odoroj/452.png'],
        ['odoroj/150.png', 'Чужеземец', 'odoroj/452.png'],
        ['odoroj/150.png', 'Чужеземка', 'odoroj/452.png'],
        ['odoroj/150.png', 'Искатель стези', 'odoroj/452.png'],
        ['odoroj/150.png', 'Искательница стези', 'odoroj/452.png'],

        // КАССИОПЕЯ
        ['odoroj/403.png', 'Созидатель звёзд', 'odoroj/456.png'],
        ['odoroj/403.png', 'Избранник Нави', 'odoroj/456.png'],
        ['odoroj/403.png', 'Избранник Шедар', 'odoroj/456.png'],
        ['odoroj/403.png', 'Избранник Каф', 'odoroj/456.png'],
        ['odoroj/403.png', 'Избранник Сегин', 'odoroj/456.png'],
        ['odoroj/403.png', 'Избранник Рукбах', 'odoroj/456.png'],
        ['odoroj/403.png', 'Приближенный Нави', 'odoroj/456.png'],
        ['odoroj/403.png', 'Приближенный Шедар', 'odoroj/456.png'],
        ['odoroj/403.png', 'Приближенный Сегин', 'odoroj/456.png'],
        ['odoroj/403.png', 'Приближенный Рукбах', 'odoroj/456.png'],
        ['odoroj/403.png', 'Матушка-Плеяда', 'odoroj/456.png'],
        ['odoroj/403.png', 'Гордость звездных предков', 'odoroj/456.png'],
        ['odoroj/403.png', 'Сияние Нави', 'odoroj/456.png'],
        ['odoroj/403.png', 'Сияние Шедар', 'odoroj/456.png'],
        ['odoroj/403.png', 'Сияние Каф', 'odoroj/456.png'],
        ['odoroj/403.png', 'Сияние Сегин', 'odoroj/456.png'],
        ['odoroj/403.png', 'Сияние Рукбах', 'odoroj/456.png'],
        ['odoroj/403.png', 'Мерцающий Нави', 'odoroj/456.png'],
        ['odoroj/403.png', 'Мерцающий Шедар', 'odoroj/456.png'],
        ['odoroj/403.png', 'Мерцающий Каф', 'odoroj/456.png'],
        ['odoroj/403.png', 'Мерцающий Сегин', 'odoroj/456.png'],
        ['odoroj/403.png', 'Мерцающий Рукбах', 'odoroj/456.png'],
        ['odoroj/403.png', 'Искорка', 'odoroj/456.png'],
        ['odoroj/403.png', 'Созидательница звёзд', 'odoroj/456.png'],
        ['odoroj/403.png', 'Избранница Нави', 'odoroj/456.png'],
        ['odoroj/403.png', 'Избранница Шедар', 'odoroj/456.png'],
        ['odoroj/403.png', 'Избранница Каф', 'odoroj/456.png'],
        ['odoroj/403.png', 'Избранница Сегин', 'odoroj/456.png'],
        ['odoroj/403.png', 'Избранница Рукбах', 'odoroj/456.png'],
        ['odoroj/403.png', 'Приближенная Нави', 'odoroj/456.png'],
        ['odoroj/403.png', 'Приближенная Шедар', 'odoroj/456.png'],
        ['odoroj/403.png', 'Приближенная Сегин', 'odoroj/456.png'],
        ['odoroj/403.png', 'Приближенная Рукбах', 'odoroj/456.png'],
        ['odoroj/403.png', 'Мерцающая Нави', 'odoroj/456.png'],
        ['odoroj/403.png', 'Мерцающая Шедар', 'odoroj/456.png'],
        ['odoroj/403.png', 'Мерцающая Каф', 'odoroj/456.png'],
        ['odoroj/403.png', 'Мерцающая Сегин', 'odoroj/456.png'],
        ['odoroj/403.png', 'Мерцающая Рукбах', 'odoroj/456.png'],

        // ХРАМ ЯО-ХУ
        ['odoroj/403.png', 'Созерцатель душ', 'odoroj/352.png'],
        ['odoroj/403.png', 'Созерцательница душ', 'odoroj/352.png'],
        ['odoroj/403.png', 'Изучающий Души', 'odoroj/352.png'],
        ['odoroj/403.png', 'Изучающая Души', 'odoroj/352.png'],
        ['odoroj/403.png', 'Послушник', 'odoroj/352.png'],
        ['odoroj/403.png', 'Послушница', 'odoroj/352.png'],
        ['odoroj/403.png', 'Адепт', 'odoroj/352.png'],
        ['odoroj/403.png', 'Глава ветви Фэн', 'odoroj/352.png'],
        ['odoroj/403.png', 'Глава ветви Пэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Глава ветви Вэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Глава ветви Цао', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первый ученик Фэн', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первая ученица Фэн', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первый ученик Вэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первая ученица Вэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первый ученик Пэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первая ученица Пэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первый ученик Цао', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первая ученица Цао', 'odoroj/352.png'],

        // мои тесты
        ['odoroj/403.png', 'Гильотина', 'https://raw.githubusercontent.com/Achterstem/host/refs/heads/main/img/zpkh.png'],
        ['odoroj/403.png', 'Чёрт, Фраудхарт', 'https://raw.githubusercontent.com/Achterstem/host/refs/heads/main/img/zpkh.png']
    ];

    // Оптимизированная структура данных для быстрого поиска
    class SmellRuleEngine {
        constructor(rules) {
            this.rules = rules;
            this.cache = new Map();
            this.customToBaseMap = new Map();
            this.smellIndex = new Map(); // Индекс для быстрого поиска по запаху
            this.phraseIndex = new Map(); // Индекс для быстрого поиска по фразе
            this.buildIndexes();
        }

        buildIndexes() {
            // Очищаем индексы
            this.smellIndex.clear();
            this.phraseIndex.clear();
            this.customToBaseMap.clear();

            this.rules.forEach(([oldSmell, phrase, newSmell]) => {
                if (oldSmell && newSmell) {
                    const canonicalBaseSmell = oldSmell.split('/').slice(-2).join('/');
                    
                    // Индекс по запаху
                    if (!this.smellIndex.has(canonicalBaseSmell)) {
                        this.smellIndex.set(canonicalBaseSmell, []);
                    }
                    this.smellIndex.get(canonicalBaseSmell).push({ phrase, newSmell, oldSmell });

                    // Индекс по фразе (для быстрого поиска)
                    const normalizedPhrase = phrase.toLowerCase().trim();
                    if (!this.phraseIndex.has(normalizedPhrase)) {
                        this.phraseIndex.set(normalizedPhrase, []);
                    }
                    this.phraseIndex.get(normalizedPhrase).push({ oldSmell, newSmell });

                    this.customToBaseMap.set(newSmell, oldSmell);
                }
            });
        }

        getMatchingImage(text, canonicalBaseSmell) {
            // Проверка кэша
            const cacheKey = `${canonicalBaseSmell}|${text}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const normalizedText = text.toLowerCase().replace(/\s+/g, ' ').trim();
            
            // Ищем только правила для этого запаха
            const rulesForSmell = this.smellIndex.get(canonicalBaseSmell);
            if (!rulesForSmell) {
                return { newSmell: null, originalBase: null };
            }

            // Быстрый поиск по точному совпадению фразы
            for (const rule of rulesForSmell) {
                const normalizedPhrase = rule.phrase.toLowerCase().trim();
                if (normalizedText.includes(normalizedPhrase)) {
                    const result = { 
                        newSmell: rule.newSmell, 
                        originalBase: rule.oldSmell 
                    };
                    this.cache.set(cacheKey, result);
                    return result;
                }
            }

            const result = { newSmell: null, originalBase: null };
            this.cache.set(cacheKey, result);
            return result;
        }

        getOriginalBaseForCustom(customSmell) {
            return this.customToBaseMap.get(customSmell) || null;
        }

        clearCache() {
            this.cache.clear();
        }
    }

    let ruleEngine = null;
    let updateTimeout = null;
    let pendingUpdates = new Set();

    const loadData = () => {
        let storedData = gmGetValueSync(STORAGE_KEY, null);
        let rules;

        try {
            rules = storedData ? JSON.parse(storedData) : DEFAULT_RULES;
        } catch (e) {
            console.error("Возврат дефолта.", e);
            rules = DEFAULT_RULES;
        }

        ruleEngine = new SmellRuleEngine(rules);
        return rules;
    };

    const saveData = (data) => {
        if (confirm("Сохранить запахи?")) {
            gmSetValueSync(STORAGE_KEY, JSON.stringify(data));
            ruleEngine = new SmellRuleEngine(data);
            ruleEngine.clearCache();
            // Обновляем все клетки после сохранения
            document.querySelectorAll('.cage').forEach(cage => {
                applySmellsToCage(cage);
            });
        }
    };

    const resetData = () => {
        gmDeleteValueSync(STORAGE_KEY);
        ruleEngine = new SmellRuleEngine(DEFAULT_RULES);
        ruleEngine.clearCache();
        document.querySelectorAll('.cage').forEach(cage => {
            applySmellsToCage(cage);
        });
    };

    const ORIGINAL_SRC_ATTRIBUTE = 'data-original-smell';
    const CURRENT_CAT_ID_ATTRIBUTE = 'data-cat-id';
    const PROCESSED_ATTRIBUTE = 'data-smell-processed';

    const applySmellsToCage = (cage) => {
        if (!cage || cage.closest('.invisible')) return;

        const img = cage.querySelector('img[src*="odoroj/"], img[data-original-smell]');
        const catNameElement = cage.querySelector('a.cat_link');
        
        if (!img || !catNameElement) return;

        const textContent = (cage.querySelector('span') || { innerText: '' }).innerText + ' ' + catNameElement.textContent.trim();

        const catUrl = catNameElement.href;
        const match = catUrl.match(/cat(\d+)/);
        const currentCatId = match ? match[1] : null;
        const cachedCatId = img.getAttribute(CURRENT_CAT_ID_ATTRIBUTE);

        // Получаем текущий src
        let currentFullRelativeSrc = img.getAttribute('src');
        const hasCustomSrc = ruleEngine.customToBaseMap.has(currentFullRelativeSrc);
        
        let originalSrc = img.getAttribute(ORIGINAL_SRC_ATTRIBUTE);

        // Проверяем, нужно ли обрабатывать эту клетку
        if (!originalSrc) {
            originalSrc = currentFullRelativeSrc;
            img.setAttribute(ORIGINAL_SRC_ATTRIBUTE, originalSrc);
            img.setAttribute(CURRENT_CAT_ID_ATTRIBUTE, currentCatId);
            img.setAttribute(PROCESSED_ATTRIBUTE, 'true');
        } else if (currentCatId !== cachedCatId) {
            // Клетка изменилась - сбрасываем состояние
            if (hasCustomSrc) {
                img.src = originalSrc;
                currentFullRelativeSrc = originalSrc;
            }
            img.removeAttribute(ORIGINAL_SRC_ATTRIBUTE);
            img.removeAttribute(PROCESSED_ATTRIBUTE);
            img.setAttribute(CURRENT_CAT_ID_ATTRIBUTE, currentCatId);
            return applySmellsToCage(cage);
        } else if (hasCustomSrc) {
            // Проверяем, не изменился ли текст или статус
            const baseSmellForCustom = ruleEngine.getOriginalBaseForCustom(currentFullRelativeSrc);
            if (baseSmellForCustom) {
                const canonicalBaseSmell = baseSmellForCustom.split('/').slice(-2).join('/');
                const matchingResult = ruleEngine.getMatchingImage(textContent, canonicalBaseSmell);
                
                if (!matchingResult.newSmell || matchingResult.newSmell !== currentFullRelativeSrc) {
                    img.src = originalSrc;
                    currentFullRelativeSrc = originalSrc;
                    img.removeAttribute(PROCESSED_ATTRIBUTE);
                }
            }
        }

        originalSrc = img.getAttribute(ORIGINAL_SRC_ATTRIBUTE) || currentFullRelativeSrc;
        const originalSrcPart = originalSrc.split('/').slice(-2).join('/');

        const matchingResult = ruleEngine.getMatchingImage(textContent, originalSrcPart);
        
        let targetSrc = originalSrc;
        if (matchingResult.newSmell) {
            targetSrc = matchingResult.newSmell;
        }

        if (targetSrc && targetSrc !== img.src) {
            img.src = targetSrc;
            img.setAttribute(PROCESSED_ATTRIBUTE, 'true');
        }
    };

    // Пакетная обработка клеток
    const processBatch = (cages) => {
        const batch = Array.from(cages);
        for (let i = 0; i < batch.length; i += BATCH_SIZE) {
            const chunk = batch.slice(i, i + BATCH_SIZE);
            chunk.forEach(cage => {
                if (!cage.getAttribute('data-smell-updated')) {
                    applySmellsToCage(cage);
                    cage.setAttribute('data-smell-updated', 'true');
                }
            });
        }
    };

    // Дебаунс для обновлений
    const scheduleUpdate = (cage) => {
        if (cage) {
            pendingUpdates.add(cage);
            cage.removeAttribute('data-smell-updated');
        }

        if (updateTimeout) {
            clearTimeout(updateTimeout);
        }

        updateTimeout = setTimeout(() => {
            if (pendingUpdates.size > 0) {
                processBatch(pendingUpdates);
                pendingUpdates.clear();
            }
            updateTimeout = null;
        }, UPDATE_DELAY);
    };

    const initSmellObservers = () => {
        loadData();

        const mapContainer = document.querySelector('#ist, #cages_div');
        if (!mapContainer) {
            return;
        }

        // Первоначальная обработка всех клеток пакетами
        const allCages = document.querySelectorAll('.cage');
        processBatch(allCages);

        // Оптимизированный MutationObserver
        let observerTimeout = null;
        const observer = new MutationObserver((mutationsList) => {
            let hasChanges = false;
            const changedCages = new Set();

            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('cage')) {
                                changedCages.add(node);
                            }
                            // Поиск .cage внутри добавленного узла
                            const nestedCages = node.querySelectorAll ? node.querySelectorAll('.cage') : [];
                            nestedCages.forEach(cage => changedCages.add(cage));
                        }
                    });

                    // Проверяем обновленные клетки
                    document.querySelectorAll('.cage').forEach(cage => {
                        if (!cage.getAttribute('data-smell-processed')) {
                            changedCages.add(cage);
                        }
                    });
                }

                if (mutation.type === 'attributes' && mutation.target.closest) {
                    const cage = mutation.target.closest('.cage');
                    if (cage && mutation.attributeName === 'href') {
                        changedCages.add(cage);
                        cage.removeAttribute('data-smell-updated');
                    }
                }

                if (mutation.type === 'characterData' && mutation.target.parentElement) {
                    const cage = mutation.target.closest('.cage');
                    if (cage) {
                        changedCages.add(cage);
                        cage.removeAttribute('data-smell-updated');
                    }
                }
            }

            if (changedCages.size > 0) {
                if (observerTimeout) {
                    clearTimeout(observerTimeout);
                }
                observerTimeout = setTimeout(() => {
                    processBatch(changedCages);
                    observerTimeout = null;
                }, 50);
            }
        });

        observer.observe(mapContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
            attributeFilter: ['href']
        });

        window.smellObserver = observer;
    };

    // --- НАСТРОЙКИ ---
    const createSettingsInterface = () => {
        const currentData = loadData();
        const siteTable = document.querySelector("#site_table");
        if (!siteTable) return;

        const settingsContainer = siteTable.getAttribute("data-mobile") === "0"
            ? document.querySelector("#branch")
            : siteTable;
        if (!settingsContainer) return;

        const style = document.createElement('style');
        style.innerHTML = `
            #smell-settings-panel {
                max-width: 800px; margin: 20px auto; padding: 15px; border: 1px solid #000000;
                color: #c9c9c9; background: rgb(35 33 33 / 83%); border-radius: 20px;
            }
            #smell-settings-panel h3 { color: #ffffff; border-bottom: 1px solid #ffffff; padding-bottom: 5px; }
            #smell-settings-panel #toggle-rules-btn {
                background: #232020;
                padding: 5px 10px;
                margin-top: 5px;
                margin-bottom: 5px;
                border-radius: 10px;
                font-size: 0.9em;
            }
            #smell-settings-panel .rule-item { display: flex; gap: 10px; margin-bottom: 8px; align-items: center; }
            #smell-settings-panel .column-headers {
                display: flex; gap: 10px; margin-bottom: 5px; padding: 0 5px; font-weight: bold; color: #afafaf;
            }
            #smell-settings-panel .column-headers div:first-child { width: 150px; text-align: left; }
            #smell-settings-panel .column-headers div:nth-child(2) { flex-grow: 1; text-align: left; }
            #smell-settings-panel .column-headers div:nth-child(3) { width: 290px; text-align: left; }
            #smell-settings-panel .column-headers div:last-child { width: 90px; }
            #smell-settings-panel input { padding: 5px; border: 1px solid #000000; background: #1a1818bf; color: #e3e3e3; }
            #smell-settings-panel button { padding: 6px 8px; cursor: pointer; border: none; color: white; margin-right: 10px; border-radius: 20px; }
            #smell-settings-panel button#save-settings-btn { background: #646464; }
            #smell-settings-panel button.remove { background: #613737; }
            #smell-settings-panel button#delete-all-btn { background: #7c3d3d; }
            #smell-settings-panel button.add { background: #646464; }
            #smell-list-content.hidden {
                display: none;
            }
        `;
        document.head.appendChild(style);

        const panel = document.createElement('div');
        panel.id = 'smell-settings-panel';
        panel.innerHTML = `
            <h3>Настройка Запахов</h3>
            <button id="toggle-rules-btn">Развернуть</button>
            <div id="smell-list-content" class="hidden">
                <div class="column-headers">
                    <div>Исходный Запах</div>
                    <div>Должность</div>
                    <div>Нужный запах</div>
                    <div></div>
                </div>
                <div id="rule-list"></div>
                <button id="add-rule-btn" class="add">Добавить запах</button>
            </div>
            <hr style="margin-top: 15px;">
            <button id="save-settings-btn">Сохранить</button>
            <button id="reset-settings-btn" class="remove">Сбросить</button>
            <button id="delete-all-btn" class="remove">Удалить все запахи</button>
            <p style="font-size: 0.8em; margin-top: 10px;">
                * Можно вводить как и должности, так и имена.
            </p>
        `;

        const targetElement = document.querySelector('a[href="del"]');
        if (targetElement) {
            targetElement.insertAdjacentElement('afterend', panel);
        } else {
            settingsContainer.appendChild(panel);
        }

        const toggleBtn = panel.querySelector('#toggle-rules-btn');
        const listContent = panel.querySelector('#smell-list-content');
        const ruleList = panel.querySelector('#rule-list');
        const saveBtn = panel.querySelector('#save-settings-btn');
        const resetBtn = panel.querySelector('#reset-settings-btn');
        const deleteAllBtn = panel.querySelector('#delete-all-btn');
        const addBtn = panel.querySelector('#add-rule-btn');

        toggleBtn.onclick = () => {
            listContent.classList.toggle('hidden');
            toggleBtn.textContent = listContent.classList.contains('hidden') ? 'Развернуть' : 'Свернуть';
        };

        const renderRules = (data) => {
            ruleList.innerHTML = '';
            data.forEach(([oldSmell, phrase, image]) => {
                const item = document.createElement('div');
                item.className = 'rule-item';
                item.innerHTML = `
                    <input type="text" class="old-smell" value="${oldSmell}" placeholder="odoroj/403.png" style="width: 150px;">
                    <input type="text" class="phrase" value="${phrase}" placeholder="Название должности" style="flex-grow: 1;">
                    <input type="text" class="image" value="${image}" placeholder="Ссылка на картинку" style="width: 290px;">
                    <button class="remove">Удалить</button>
                `;
                ruleList.appendChild(item);
            });
        };

        const collectData = () => {
            const data = [];
            panel.querySelectorAll('.rule-item').forEach(item => {
                const oldSmell = item.querySelector('.old-smell').value.trim();
                const phrase = item.querySelector('.phrase').value.trim();
                const image = item.querySelector('.image').value.trim();
                if (oldSmell && phrase && image) data.push([oldSmell, phrase, image]);
            });
            return data;
        };

        addBtn.onclick = () => {
            const newData = collectData();
            newData.push(["", "", ""]);
            renderRules(newData);
        };

        ruleList.onclick = (e) => {
            if (e.target.classList.contains('remove') && e.target.id !== 'reset-settings-btn' && e.target.id !== 'delete-all-btn') {
                e.target.closest('.rule-item').remove();
            }
        };

        saveBtn.onclick = () => {
            const dataToSave = collectData();
            if (dataToSave.length > 0) {
                saveData(dataToSave);
                alert("Запахи сохранены!");
            } else if (confirm("Список пуст. Сбросить запахи на дефолтные?")) {
                resetData();
                renderRules(DEFAULT_RULES);
                alert("Запахи сброшены.");
            } else {
                alert("Сохранение отменено.");
            }
        };

        resetBtn.onclick = () => {
            if (confirm("Сбросить запахи на дефолтные?")) {
                resetData();
                renderRules(DEFAULT_RULES);
                alert("Запахи сброшены.");
            }
        };

        deleteAllBtn.onclick = () => {
            if (confirm("Удалить все запахи?")) {
                renderRules([]);
                gmSetValueSync(STORAGE_KEY, "[]");
                ruleEngine = new SmellRuleEngine([]);
                ruleEngine.clearCache();
                document.querySelectorAll('.cage').forEach(cage => {
                    const img = cage.querySelector('img[data-original-smell]');
                    if (img) {
                        const originalSrc = img.getAttribute('data-original-smell');
                        if (originalSrc) {
                            img.src = originalSrc;
                            img.removeAttribute('data-original-smell');
                            img.removeAttribute('data-smell-processed');
                        }
                    }
                });
                alert("Все запахи удалены.");
            }
        };

        renderRules(currentData);
    };

    const waitForElement = (selector) => new Promise(resolve => {
        const element = document.querySelector(selector);
        if (element) return resolve(element);
        const observer = new MutationObserver((_, obs) => {
            const el = document.querySelector(selector);
            if (el) {
                obs.disconnect();
                resolve(el);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });

    if (window.location.pathname.endsWith('/settings')) {
        waitForElement('#site_table').then(createSettingsInterface);
    } else if (document.querySelector('#main_table')) {
        waitForElement('#ist, #cages_div').then(initSmellObservers);
    }
})();

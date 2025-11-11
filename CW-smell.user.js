// ==UserScript==
// @name CW smell
// @namespace http://tampermonkey.net/
// @version 1.0.0
// @description Меняет запахи по исходному запаху + по имени/статусу/должности. Связь https://catwar.su/cat1600314
// @author achterstem
// @match http*://*.catwar.net/*
// @match http*://*.catwar.su/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=catwar.su
// @license MIT
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue
// @grant GM_listValues
// @run-at document-idle
// @homepageURL https://openuserjs.org/scripts/Achterstem/CW-smell
// @downloadURL https://github.com/Achterstem/CW-smell/raw/refs/heads/main/CW-smell.user.js
// @updateURL https://github.com/Achterstem/CW-smell/raw/refs/heads/main/CW-smell.user.js
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'CUSTOM_SMELLS_DATA';

    const DEFAULT_RULES = [
        // ЗАСТЫВШАЯ ЭПОХА
        ['odoroj/232.png', 'Провидец времени', 'odoroj/432.png'],
        ['odoroj/232.png', 'Провидица Времени', 'odoroj/432.png'],
        ['odoroj/232.png', 'Наследник', 'odoroj/432.png'],
        ['odoroj/232.png', 'Наследница', 'odoroj/432.png'],
        ['odoroj/232.png', 'Верховодец', 'odoroj/432.png'],
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

        // ВЕЛИКОКНЯЖЕСТВО
        ['odoroj/232.png', 'Чадо', 'odoroj/421.png'],
        ['odoroj/232.png', 'Отрок', 'odoroj/421.png'],
        ['odoroj/232.png', 'Пахоликъ', 'odoroj/421.png'],
        ['odoroj/232.png', 'Кормилица', 'odoroj/421.png'],
        ['odoroj/232.png', 'Лежебока', 'odoroj/421.png'],
        ['odoroj/232.png', 'Положникъ', 'odoroj/421.png'],
        ['odoroj/232.png', 'Казатель', 'odoroj/421.png'],
        ['odoroj/232.png', 'Усердник', 'odoroj/421.png'],
        ['odoroj/232.png', 'Радетель', 'odoroj/421.png'],
        ['odoroj/232.png', 'Храбрецъ', 'odoroj/421.png'],
        ['odoroj/232.png', 'Борецъ', 'odoroj/421.png'],
        ['odoroj/232.png', 'Гридъ', 'odoroj/421.png'],
        ['odoroj/232.png', 'Боярин', 'odoroj/421.png'],
        ['odoroj/232.png', 'Ученик Знахаря', 'odoroj/421.png'],
        ['odoroj/232.png', 'Княжич', 'odoroj/421.png'],
        ['odoroj/232.png', 'Князь', 'odoroj/421.png'],

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
        ['odoroj/150.png', 'Голос Исины', 'odoroj/452.png'],
        ['odoroj/150.png', 'Голос Калао', 'odoroj/452.png'],
        ['odoroj/150.png', 'Шёпот Мару', 'odoroj/452.png'],
        ['odoroj/150.png', 'Шёпот Исины', 'odoroj/452.png'],
        ['odoroj/150.png', 'Шёпот Калао', 'odoroj/452.png'],
        ['odoroj/150.png', 'Благословенный Мару', 'odoroj/452.png'],
        ['odoroj/150.png', 'Благословенный Исины', 'odoroj/452.png'],
        ['odoroj/150.png', 'Благословенный Калао', 'odoroj/452.png'],
        ['odoroj/150.png', 'Благословенная Мару', 'odoroj/452.png'],
        ['odoroj/150.png', 'Благословенная Исины', 'odoroj/452.png'],
        ['odoroj/150.png', 'Благословенная Калао', 'odoroj/452.png'],
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

        // НЕБОЖИТЕЛИ
        ['odoroj/403.png', 'Небожитель', 'odoroj/448.png'],
        ['odoroj/403.png', 'Даочжан', 'odoroj/448.png'],
        ['odoroj/403.png', 'Владыка', 'odoroj/448.png'],
        ['odoroj/403.png', 'Этот Достопочтенный', 'odoroj/448.png'],
        ['odoroj/403.png', 'Несущий Бедствия', 'odoroj/448.png'],
        ['odoroj/403.png', 'Наступающий На Бессмертных', 'odoroj/448.png'],
        ['odoroj/403.png', 'Бог Войны Юго-Востока', 'odoroj/448.png'],
        ['odoroj/403.png', 'Дух Созвездия Хуагай', 'odoroj/448.png'],
        ['odoroj/403.png', 'Забытая Госпожа', 'odoroj/448.png'],
        ['odoroj/403.png', 'Повелитель Воды', 'odoroj/448.png'],
        ['odoroj/403.png', 'Молодой Господин Проливший Вино', 'odoroj/448.png'],
        ['odoroj/403.png', 'Змей-Лун', 'odoroj/448.png'],
        ['odoroj/403.png', 'Танцующий Среди Ликорисов', 'odoroj/448.png'],
        ['odoroj/403.png', 'Скрывающийся в Сумерках Охотник', 'odoroj/448.png'],
        ['odoroj/403.png', 'Дух поветрия', 'odoroj/448.png'],
        ['odoroj/403.png', 'Междумирец', 'odoroj/448.png'],
        ['odoroj/403.png', 'Созерцающий пустоту', 'odoroj/448.png'],
        ['odoroj/403.png', 'Упрямый Юноша', 'odoroj/448.png'],
        ['odoroj/403.png', 'Дитя пустоты', 'odoroj/448.png'],
        ['odoroj/403.png', 'Посмешище трех миров', 'odoroj/448.png'],

        // ХРАМ ЯО-ХУ
        ['odoroj/403.png', 'Постигший Души', 'odoroj/352.png'],
        ['odoroj/403.png', 'Постигшая Души', 'odoroj/352.png'],
        ['odoroj/403.png', 'Изучающий Души', 'odoroj/352.png'],
        ['odoroj/403.png', 'Изучающая Души', 'odoroj/352.png'],
        ['odoroj/403.png', 'Глава пика Фэн', 'odoroj/352.png'],
        ['odoroj/403.png', 'Глава пика Цао', 'odoroj/352.png'],
        ['odoroj/403.png', 'Глава пика Пэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Глава пика Вэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первый ученик Фэн', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первая ученица Фэн', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первый ученик Цао', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первая ученица Цао', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первый ученик Пэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первая ученица Пэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первый ученик Вэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Первая ученица Вэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Лаоши', 'odoroj/352.png'],
        ['odoroj/403.png', 'Адепт Фэн', 'odoroj/352.png'],
        ['odoroj/403.png', 'Адепт Цао', 'odoroj/352.png'],
        ['odoroj/403.png', 'Адепт Пэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Адепт Вэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Старший ученик Фэн', 'odoroj/352.png'],
        ['odoroj/403.png', 'Старшая ученица Фэн', 'odoroj/352.png'],
        ['odoroj/403.png', 'Старший ученик Пэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Старшая ученица Пэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Старший ученик Вэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Старшая ученица Вэй', 'odoroj/352.png'],
        ['odoroj/403.png', 'Младший ученик', 'odoroj/352.png'],
        ['odoroj/403.png', 'Младшая ученица', 'odoroj/352.png'],
        ['odoroj/403.png', 'Создание Яо-ху', 'odoroj/352.png'],

        // мои тесты
        ['odoroj/403.png', 'Гильотина', 'https://e.radikal.host/2025/11/11/ZPK27fc936d42ab4cef.png'],
        ['odoroj/403.png', 'Чёрт, Фраудхарт', 'https://e.radikal.host/2025/11/11/ZPK27fc936d42ab4cef.png']
    ];

    let ALL_ORIGINAL_SMELLS = [];

    const loadData = async () => {
    const storedData = await GM_getValue(STORAGE_KEY);
    const rules = storedData ? JSON.parse(storedData) : DEFAULT_RULES;

    const originalSmellsSet = new Set();
    rules.forEach(([oldSmell]) => {
        if (oldSmell) {
            originalSmellsSet.add(oldSmell);
        }
    });

    ALL_ORIGINAL_SMELLS = Array.from(originalSmellsSet);

    return rules;
    };

    const saveData = async (data) => {
        if (confirm("Запахи сохранены!")) {
        await GM_setValue(STORAGE_KEY, JSON.stringify(data));
        }
    };


    const phraseInText = (text, phrase) => {
        const normalizedText = text.toLowerCase().replace(/\s+/g, ' ').trim();
        const normalizedPhrase = phrase.toLowerCase().trim();

        return normalizedText.includes(normalizedPhrase);
    };

    const getMatchingImage = (text, canonicalBaseSmell, rules) => {
        for (const [oldSmell, phrase, newImg] of rules) {
            if (canonicalBaseSmell === oldSmell) {
                if (phraseInText(text, phrase)) {
                    return { newSmell: newImg };
                }
            }
        }
        return { newSmell: null };
    };

    const applySmellsToCage = (cage, rules) => {
        const img = cage.querySelector('img[src*="odoroj/"]');
        const catNameElement = cage.querySelector('a');

        if (!img || !catNameElement) return;

        const catName = catNameElement.textContent.trim();
        const CURRENT_CACHED_NAME_ATTRIBUTE = 'data-cached-name';
        const ORIGINAL_SRC_ATTRIBUTE = 'data-original-smell';

        let originalSrc = img.getAttribute(ORIGINAL_SRC_ATTRIBUTE);
        const currentFullRelativeSrc = img.getAttribute('src');
        const cachedName = img.getAttribute(CURRENT_CACHED_NAME_ATTRIBUTE);

        if (cachedName !== catName) {
            originalSrc = null;
            img.removeAttribute(ORIGINAL_SRC_ATTRIBUTE);
            img.setAttribute(CURRENT_CACHED_NAME_ATTRIBUTE, catName);
        }

        if (!originalSrc) {
            originalSrc = currentFullRelativeSrc;
            img.setAttribute(ORIGINAL_SRC_ATTRIBUTE, originalSrc);
        }

        const originalSrcPart = originalSrc.split('/').pop();
        const canonicalBaseSmell = ALL_ORIGINAL_SMELLS.find(s => s.endsWith(originalSrcPart));

        let targetSrc = originalSrc;

        if (canonicalBaseSmell) {
            const textContent = cage.querySelector('span') ? cage.querySelector('span').innerText : cage.innerText;
            const matchingResult = getMatchingImage(textContent, canonicalBaseSmell, rules);

            if (matchingResult.newSmell) {
                targetSrc = matchingResult.newSmell;
            }
        }

        if (targetSrc && targetSrc !== currentFullRelativeSrc) {
            img.src = targetSrc;
        }
    };

    const initSmellObservers = async () => {
        const rules = await loadData();
        const mapContainer = document.querySelector('#ist, #cages_div');

        if (!mapContainer) return;

        const observers = [];

        const setupCageObserver = (cage) => {
            const targetSpan = cage.querySelector('span');
            if (!targetSpan) return;

            applySmellsToCage(cage, rules);

            const cageObserver = new MutationObserver(() => {
                applySmellsToCage(cage, rules);
            });

            cageObserver.observe(targetSpan, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true
            });

            observers.push(cageObserver);
        };

        document.querySelectorAll('.cage').forEach(setupCageObserver);

        const mapChangeObserver = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.classList.contains('cage')) {
                            setupCageObserver(node);
                        }
                    });
                }
            }

            document.querySelectorAll('.cage').forEach(cage => applySmellsToCage(cage, rules));
        });

        mapChangeObserver.observe(mapContainer, {
            childList: true,
            subtree: true
        });

        window.smellObservers = observers;
    };


    // --- НАСТРОЙКИ ---
    const createSettingsInterface = async () => {
    const currentData = await loadData();
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
        <p style="font-size: 0.8em; margin-top: 10px;">
            <br>* Можно вводить как и должности, так и имена.
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
    const addBtn = panel.querySelector('#add-rule-btn');

    toggleBtn.onclick = () => {
        listContent.classList.toggle('hidden');
        if (listContent.classList.contains('hidden')) {
            toggleBtn.textContent = 'Развернуть';
        } else {
            toggleBtn.textContent = 'Свернуть';
        }
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
        if (e.target.classList.contains('remove') && e.target.id !== 'reset-settings-btn') {
            e.target.closest('.rule-item').remove();
        }
    };

    saveBtn.onclick = () => {
        const dataToSave = collectData();
        if (dataToSave.length > 0) {
            saveData(dataToSave);
        } else if (confirm("Список пуст, настройки сброшены на дефолтные.")) {
            GM_deleteValue(STORAGE_KEY).then(() => {
                renderRules(DEFAULT_RULES);
            });
        } else {
            alert("Сохранение отменено.");
        }
    };

    resetBtn.onclick = () => {
        if (confirm("Настройки сброшены на дефолтные.")) {
            GM_deleteValue(STORAGE_KEY).then(() => {
                renderRules(DEFAULT_RULES);
            });
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
    waitForElement('#ist').then(initSmellObservers);
}

})();

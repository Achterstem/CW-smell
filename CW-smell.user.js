// ==UserScript==
// @name CW-smell
// @namespace http://tampermonkey.net/
// @version 1.0.0
// @description Меняет запахи.
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
// @downloadURL https://github.com/Achterstem/CW-smell
// @downloadURL https://greasyfork.org/ru/scripts/555104-cw-smell
// @updateURL https://github.com/Achterstem/CW-smell/raw/refs/heads/main/CW-smell.user.js
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'CUSTOM_ODORS_DATA';
    const OLD_ODOR = 'odoroj/403.png';
    const OLD_ODOR_NAME = OLD_ODOR.split('/').pop();

    const DEFAULT_PHRASES_TO_IMAGES = [
        ['Последователь-идальго', 'https://i.yapx.ru/cEnIO.png'],
    ];

    const loadData = async () => {
        const storedData = await GM_getValue(STORAGE_KEY);
        return storedData ? JSON.parse(storedData) : DEFAULT_PHRASES_TO_IMAGES;
    };

    const saveData = async (data) => {
        await GM_setValue(STORAGE_KEY, JSON.stringify(data));
        alert("Запахи сохранены!");
    };

    const getCustomOdorNames = (phrasesToImages) => {
        const names = new Set(
            phrasesToImages.map(([, img]) => img.split('/').pop())
        );
        names.add(OLD_ODOR_NAME);
        return names;
    };

    const getTokens = t => t.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];

    const phraseInText = (tokens, phrase) => {
        const phraseTokens = getTokens(phrase);
        const pLen = phraseTokens.length;
        const tLen = tokens.length;

        for (let i = 0; i <= tLen - pLen; i++) {
            let match = true;
            for (let j = 0; j < pLen; j++) {
                if (tokens[i + j] !== phraseTokens[j]) {
                    match = false;
                    break;
                }
            }
            if (match && tokens[i + pLen - 1] === phraseTokens[pLen - 1]) return true;
        }
        return false;
    };

    const getMatchingImage = (text, phrasesToImages) => {
        const tokens = getTokens(text);
        for (const [phrase, img] of phrasesToImages) {
            if (phraseInText(tokens, phrase)) return img;
        }
        return null;
    };

    const runOdorLogic = async () => {
        const phrasesToImages = await loadData();
        const customOdorNames = getCustomOdorNames(phrasesToImages);

        const update = () => {
            document.querySelectorAll('.cage').forEach(cage => {
                const newImgSrc = getMatchingImage(cage.textContent, phrasesToImages);
                const img = cage.querySelector('img[src*="odoroj/"]');

                if (img) {
                    const currentImgSrcFileName = img.src.split('/').pop();
                    const isCustomOdor = customOdorNames.has(currentImgSrcFileName);

                    const targetSrc = newImgSrc
                        ? newImgSrc
                        : (isCustomOdor ? OLD_ODOR : null);

                    if (targetSrc && targetSrc.split('/').pop() !== currentImgSrcFileName) {
                        img.src = targetSrc;
                    }
                }
            });
        };

        update();

        new MutationObserver(update).observe(
            document.body,
            { childList: true, subtree: true, characterData: true, attributes: true }
        );
    };

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
            #odor-settings-panel {
                max-width: 800px; margin: 20px auto; padding: 15px; border: 1px solid #444;
                color: #ddd; background: rgba(34, 34, 34, 0.70); border-radius: 20px;
            }
            #odor-settings-panel h3 { color: #fff; border-bottom: 1px solid #555; padding-bottom: 5px; }
            #odor-settings-panel .rule-item { display: flex; gap: 10px; margin-bottom: 8px; align-items: center; }

            #odor-settings-panel .column-headers {
                display: flex; gap: 10px; margin-bottom: 5px; padding: 0 5px; font-weight: bold; color: #aaa;
            }
            #odor-settings-panel .column-headers div:first-child { flex-grow: 1; text-align: left; }
            #odor-settings-panel .column-headers div:nth-child(2) { width: 290px; text-align: left; }
            #odor-settings-panel .column-headers div:last-child { width: 90px; }

            #odor-settings-panel input { padding: 5px; border: 1px solid #555; background: #333; color: #eee; }
            #odor-settings-panel button { padding: 8px 15px; cursor: pointer; border: none; color: white; margin-right: 10px; }
            #odor-settings-panel button#save-settings-btn { background: #5b6f5b; }
            #odor-settings-panel button.remove { background: #5d3b3b; }
            #odor-settings-panel button.add { background: #40404857; }
        `;
        document.head.appendChild(style);

        const panel = document.createElement('div');
        panel.id = 'odor-settings-panel';
        panel.innerHTML = `
            <h3>Настройка Запахов</h3>
            <div class="column-headers"><div>Должность</div><div>Запах</div><div></div></div>
            <div id="rule-list"></div>
            <button id="add-rule-btn" class="add">Добавить запах</button>
            <hr style="margin-top: 15px;">
            <button id="save-settings-btn">Сохранить</button>
            <button id="reset-settings-btn" class="remove">Сбросить</button>
            <p style="font-size: 0.8em; margin-top: 10px;">
                * Чем больше фраза - тем выше поставьте её.
                <br>* Можно вписывать и свои имена/статусы. Реагирует на весь текст в плашке кота.</p>
        `;

        const targetElement = document.querySelector('a[href="del"]');
        if (targetElement) {
            targetElement.insertAdjacentElement('afterend', panel);
        } else {
            settingsContainer.appendChild(panel);
        }

        const ruleList = panel.querySelector('#rule-list');
        const saveBtn = panel.querySelector('#save-settings-btn');
        const resetBtn = panel.querySelector('#reset-settings-btn');
        const addBtn = panel.querySelector('#add-rule-btn');

        const renderRules = (data) => {
            ruleList.innerHTML = '';
            data.forEach(([phrase, image]) => {
                const item = document.createElement('div');
                item.className = 'rule-item';
                item.innerHTML = `
                    <input type="text" class="phrase" value="${phrase}" placeholder="Название должности" style="flex-grow: 2;">
                    <input type="text" class="image" value="${image}" placeholder="Ссылка на картинку" style="flex-grow: 1;">
                    <button class="remove">Удалить</button>
                `;
                ruleList.appendChild(item);
            });
        };

        const collectData = () => {
            const data = [];
            panel.querySelectorAll('.rule-item').forEach(item => {
                const phrase = item.querySelector('.phrase').value.trim();
                const image = item.querySelector('.image').value.trim();
                if (phrase && image) data.push([phrase, image]);
            });
            return data;
        };

        addBtn.onclick = () => {
            const newData = collectData();
            newData.push(["", ""]);
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
            } else if (confirm("Список пуст. Сбросить настройки на дефолтные?")) {
                     GM_deleteValue(STORAGE_KEY).then(() => {
                    renderRules(DEFAULT_PHRASES_TO_IMAGES);
                    alert("Настройки сброшены!");
                });
            } else {
                alert("Сохранение отменено.");
            }
        };

        resetBtn.onclick = () => {
            if (confirm("Сбросить настройки на дефолтные?")) {
                GM_deleteValue(STORAGE_KEY).then(() => {
                    renderRules(DEFAULT_PHRASES_TO_IMAGES);
                    alert("Настройки сброшены!");
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
        runOdorLogic();
    }

})();

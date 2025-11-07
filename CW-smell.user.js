// ==UserScript==
// @name         CW-smell
// @namespace    http://tampermonkey.net/
// @version      2025-11-06
// @description  try to take over the world!
// @author       Fraudhart
// @match        http*://*.catwar.net/*
// @match        http*://*.catwar.su/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=catwar.su
// @license      MIT
// @grant        none
// ==/UserScript==


(() => {
    // ССЫЛКА НА ЗАПАХ ЭПОХИ
    const OLD_ODOR = 'odoroj/403.png';

    // Должность -> картинка. Лучше всего, чтобы более длинные должности были выше по списку.
    const PHRASES_TO_IMAGES = [
        ['Ученица последователя', 'odoroj/399.png'],
        ['наследница слышащего', 'odoroj/402.png'],
        ['последователь-идальго', 'odoroj/401.png'],
        ['Последовательница', 'odoroj/370.png'],
        ['Последователь', 'odoroj/400.png'],
        ['Малыш', 'odoroj/398.png']
    ];

    const CUSTOM_ODOR_NAMES = new Set(
        PHRASES_TO_IMAGES.map(([, img]) => img.split('/').pop())
    );
    const OLD_ODOR_NAME = OLD_ODOR.split('/').pop();
    CUSTOM_ODOR_NAMES.add(OLD_ODOR_NAME);

    const getTokens = t => (
        t.normalize('NFC')
         .replace(/\p{C}/gu, '')
         .replace(/\s+/g, ' ')
         .toLowerCase()
         .match(/[\p{L}\p{N}-]+/gu) || []
    );

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
            if (match && tokens[i + pLen - 1] === phraseTokens[pLen - 1]) {
                return true;
            }
        }
        return false;
    };

    const getMatchingImage = text => {
        const tokens = getTokens(text);
        for (const [phrase, img] of PHRASES_TO_IMAGES) {
            if (phraseInText(tokens, phrase)) return img;
        }
        return null;
    };

    const update = () => {
        document.querySelectorAll('.cage').forEach(cage => {
            const newImgSrc = getMatchingImage(cage.textContent);
            const img = cage.querySelector('img[src*="odoroj/"]');

            if (img) {
                const currentImgSrcFileName = img.src.split('/').pop();
                const isCustomOdor = CUSTOM_ODOR_NAMES.has(currentImgSrcFileName);

                if (newImgSrc) {
                    const newImgSrcFileName = newImgSrc.split('/').pop();
                    if (currentImgSrcFileName !== newImgSrcFileName) {
                        img.src = newImgSrc;
                    }
                } else if (isCustomOdor && currentImgSrcFileName !== OLD_ODOR_NAME) {
                    img.src = OLD_ODOR;
                }
            }
        });
    };

    update();

    new MutationObserver(update).observe(
        document.body,
        {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        }
    );
})();

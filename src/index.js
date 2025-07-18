import { Picker } from 'emoji-mart';
import data from '@emoji-mart/data';
import { createPopper } from '@popperjs/core';
import './style.css';

const textarea = document.getElementById('send_textarea');

if (!(textarea instanceof HTMLTextAreaElement)) {
    throw new Error('Element with id "send_textarea" is not a textarea.');
}

const CUSTOM_EMOJI_CATEGORY = 'custom';
const CUSTOM_EMOJI_STORAGE_KEY = 'custom_emojis';

/**
 * Load custom emojis from storage
 * @returns {Array}
 */
function loadCustomEmojis() {
    try {
        const stored = localStorage.getItem(CUSTOM_EMOJI_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading custom emojis:', error);
        return [];
    }
}

/**
 * Save custom emojis to storage
 * @param {Array} emojis
 */
function saveCustomEmojis(emojis) {
    try {
        localStorage.setItem(CUSTOM_EMOJI_STORAGE_KEY, JSON.stringify(emojis));
    } catch (error) {
        console.error('Error saving custom emojis:', error);
    }
}

/**
 * Add a custom emoji
 * @param {string} id - Unique identifier for the emoji
 * @param {string} name - Display name
 * @param {string} url - URL to the emoji image
 * @param {Array} keywords - Search keywords
 */
function addCustomEmoji(id, name, url, keywords = []) {

    const customEmojis = loadCustomEmojis();
    const newEmoji = {
        id,
        name,
        src: url,
        keywords: [name, ...keywords],
        skins: [{ src: url }]
    };

    // Check if emoji already exists
    const existingIndex = customEmojis.findIndex(emoji => emoji.id === id);
    if (existingIndex !== -1) {
        customEmojis[existingIndex] = newEmoji;
    } else {
        customEmojis.push(newEmoji);
    }

    saveCustomEmojis(customEmojis);
    return true;
}

/**
 * Remove a custom emoji
 * @param {string} id
 */
function removeCustomEmoji(id) {

    const customEmojis = loadCustomEmojis();
    const filteredEmojis = customEmojis.filter(emoji => emoji.id !== id);
    saveCustomEmojis(filteredEmojis);
    return true;
}

/**
 * Create custom emoji data structure for emoji-mart
 * @returns {Object}
 */
function createCustomEmojiData() {
    const customEmojis = loadCustomEmojis();
    
    if (customEmojis.length === 0) {
        return data;
    }

    // Create a custom category
    const customCategory = {
        id: CUSTOM_EMOJI_CATEGORY,
        name: 'Custom',
        emojis: customEmojis.map(emoji => emoji.id)
    };

    // Create the enhanced data structure
    const enhancedData = {
        ...data,
        categories: [...data.categories, customCategory],
        emojis: {
            ...data.emojis,
            ...customEmojis.reduce((acc, emoji) => {
                acc[emoji.id] = emoji;
                return acc;
            }, {})
        }
    };

    return enhancedData;
}

/**
 * Insert text at the current cursor position in a textarea or input field.
 * @param {string} newText The text to insert
 * @param {HTMLTextAreaElement|HTMLInputElement} el The textarea or input element
 */
function typeInTextarea(newText, el = document.activeElement) {
    const [start, end] = [el.selectionStart, el.selectionEnd];

    if (start === null || end === null) {
        el.value += newText;
        return;
    }

    el.setRangeText(newText, start, end, 'end');
}

/**
 * Insert an emoji into the textarea.
 * @param {{native: string, id: string, src?: string}} inputEmoji Emoji object
 * @returns
 */
function insertEmoji(inputEmoji) {
    let emojiText;
    
    // Check if it's a custom emoji
    if (inputEmoji.src && !inputEmoji.native) {
        // For custom emojis, insert as markdown image
        emojiText = `![${inputEmoji.id}](${inputEmoji.src})`;
    } else {
        // For standard emojis, use native unicode
        emojiText = inputEmoji.native;
    }
    
    typeInTextarea(emojiText, textarea);
    textarea.focus();
    picker.classList.add('displayNone');
    popper.update();
    
    const event = new Event('input', {
        bubbles: true,
        cancelable: true,
    });
    textarea.dispatchEvent(event);
}

/**
 * Gets the language code from the local storage.
 * @returns {string} Language code
 */
function getLanguageCode() {
    const language = localStorage.getItem('language');
    const languageCode = language ? String(language.split('-')[0]).trim().toLowerCase() : 'en';
    return languageCode;
}

/**
 * Get locale data based on the language code.
 * @returns {Promise<any>} Locale data
 */
async function getLocaleData() {
    const languageCode = getLanguageCode();

    switch (languageCode) {
        case 'ar':
            return await import('@emoji-mart/data/i18n/ar.json');
        case 'be':
            return await import('@emoji-mart/data/i18n/be.json');
        case 'cs':
            return await import('@emoji-mart/data/i18n/cs.json');
        case 'de':
            return await import('@emoji-mart/data/i18n/de.json');
        case 'en':
            return await import('@emoji-mart/data/i18n/en.json');
        case 'es':
            return await import('@emoji-mart/data/i18n/es.json');
        case 'fa':
            return await import('@emoji-mart/data/i18n/fa.json');
        case 'fi':
            return await import('@emoji-mart/data/i18n/fi.json');
        case 'fr':
            return await import('@emoji-mart/data/i18n/fr.json');
        case 'hi':
            return await import('@emoji-mart/data/i18n/hi.json');
        case 'it':
            return await import('@emoji-mart/data/i18n/it.json');
        case 'ja':
            return await import('@emoji-mart/data/i18n/ja.json');
        case 'ko':
            return await import('@emoji-mart/data/i18n/ko.json');
        case 'nl':
            return await import('@emoji-mart/data/i18n/nl.json');
        case 'pl':
            return await import('@emoji-mart/data/i18n/pl.json');
        case 'pt':
            return await import('@emoji-mart/data/i18n/pt.json');
        case 'ru':
            return await import('@emoji-mart/data/i18n/ru.json');
        case 'sa':
            return await import('@emoji-mart/data/i18n/sa.json');
        case 'tr':
            return await import('@emoji-mart/data/i18n/tr.json');
        case 'uk':
            return await import('@emoji-mart/data/i18n/uk.json');
        case 'vi':
            return await import('@emoji-mart/data/i18n/vi.json');
        case 'zh':
            return await import('@emoji-mart/data/i18n/zh.json');
        default:
            return await import('@emoji-mart/data/i18n/en.json');
    }
}

/**
 * Create custom emoji management UI
 */
function createCustomEmojiManager() {

    const manager = document.createElement('div');
    manager.id = 'customEmojiManager';
    manager.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--SmartThemeBodyColor, #222);
        border: 1px solid var(--SmartThemeBorderColor, #444);
        border-radius: 8px;
        padding: 20px;
        z-index: 2000;
        max-width: 500px;
        width: 90%;
        max-height: 70vh;
        overflow-y: auto;
        display: none;
    `;

    manager.innerHTML = `
        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: var(--SmartThemeQuoteColor, #fff);">Custom Emoji Manager</h3>
            <button id="closeManager" style="background: none; border: none; color: var(--SmartThemeQuoteColor, #fff); cursor: pointer; font-size: 18px;">&times;</button>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h4 style="color: var(--SmartThemeQuoteColor, #fff);">Add New Emoji</h4>
            <input type="text" id="emojiId" placeholder="Emoji ID (e.g., my_emoji)" style="width: 100%; margin-bottom: 10px; padding: 8px; border: 1px solid var(--SmartThemeBorderColor, #444); background: var(--SmartThemeBlurTintColor, #333); color: var(--SmartThemeQuoteColor, #fff); border-radius: 4px;">
            <input type="text" id="emojiName" placeholder="Display Name" style="width: 100%; margin-bottom: 10px; padding: 8px; border: 1px solid var(--SmartThemeBorderColor, #444); background: var(--SmartThemeBlurTintColor, #333); color: var(--SmartThemeQuoteColor, #fff); border-radius: 4px;">
            <input type="url" id="emojiUrl" placeholder="Image URL" style="width: 100%; margin-bottom: 10px; padding: 8px; border: 1px solid var(--SmartThemeBorderColor, #444); background: var(--SmartThemeBlurTintColor, #333); color: var(--SmartThemeQuoteColor, #fff); border-radius: 4px;">
            <input type="text" id="emojiKeywords" placeholder="Keywords (comma-separated)" style="width: 100%; margin-bottom: 10px; padding: 8px; border: 1px solid var(--SmartThemeBorderColor, #444); background: var(--SmartThemeBlurTintColor, #333); color: var(--SmartThemeQuoteColor, #fff); border-radius: 4px;">
            <button id="addEmoji" style="background: var(--SmartThemeEmColor, #007bff); color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Add Emoji</button>
        </div>
        
        <div>
            <h4 style="color: var(--SmartThemeQuoteColor, #fff);">Current Custom Emojis</h4>
            <div id="customEmojiList"></div>
        </div>
    `;

    document.body.appendChild(manager);

    // Event listeners
    manager.querySelector('#closeManager').addEventListener('click', () => {
        manager.style.display = 'none';
    });

    manager.querySelector('#addEmoji').addEventListener('click', () => {
        const id = manager.querySelector('#emojiId').value.trim();
        const name = manager.querySelector('#emojiName').value.trim();
        const url = manager.querySelector('#emojiUrl').value.trim();
        const keywords = manager.querySelector('#emojiKeywords').value.trim().split(',').map(k => k.trim()).filter(k => k);

        if (!id || !name || !url) {
            alert('Please fill in all required fields');
            return;
        }

        if (addCustomEmoji(id, name, url, keywords)) {
            // Clear form
            manager.querySelector('#emojiId').value = '';
            manager.querySelector('#emojiName').value = '';
            manager.querySelector('#emojiUrl').value = '';
            manager.querySelector('#emojiKeywords').value = '';
            
            // Refresh the picker
            refreshEmojiPicker();
            updateCustomEmojiList();
        }
    });

    return manager;
}

/**
 * Update the custom emoji list in the manager
 */
function updateCustomEmojiList() {
    const listContainer = document.querySelector('#customEmojiList');
    if (!listContainer) return;

    const customEmojis = loadCustomEmojis();
    listContainer.innerHTML = '';

    customEmojis.forEach(emoji => {
        const item = document.createElement('div');
        item.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
            margin-bottom: 5px;
            background: var(--SmartThemeBlurTintColor, #333);
            border-radius: 4px;
        `;

        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${emoji.src}" alt="${emoji.name}" style="width: 24px; height: 24px; object-fit: contain;">
                <span style="color: var(--SmartThemeQuoteColor, #fff);">${emoji.name} (${emoji.id})</span>
            </div>
            <button class="removeEmoji" data-id="${emoji.id}" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Remove</button>
        `;

        listContainer.appendChild(item);
    });

    // Add event listeners for remove buttons
    listContainer.querySelectorAll('.removeEmoji').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (confirm(`Are you sure you want to remove the emoji "${id}"?`)) {
                removeCustomEmoji(id);
                refreshEmojiPicker();
                updateCustomEmojiList();
            }
        });
    });
}

/**
 * Refresh the emoji picker with updated data
 */
function refreshEmojiPicker() {
    // Remove old picker
    picker.remove();
    
    // Create new picker with updated data
    const newPickerOptions = {
        ...pickerOptions,
        data: createCustomEmojiData()
    };
    
    window.picker = new Picker(newPickerOptions);
    picker.classList.add('displayNone');
    document.body.appendChild(picker);
    
    // Update popper reference
    popper.destroy();
    window.popper = createPopper(addEmojiButton, picker, {
        placement: 'top-end',
        modifiers: [],
    });
}

// Initialize
const i18n = await getLocaleData();
const pickerOptions = {
    onEmojiSelect: insertEmoji,
    i18n: i18n,
    locale: getLanguageCode(),
    data: createCustomEmojiData(),
    previewPosition: 'none',
    skinTonePosition: 'search',
};

const picker = new Picker(pickerOptions);
const buttonContainer = document.getElementById('rightSendForm');
const addEmojiButton = document.createElement('div');
addEmojiButton.id = 'addEmojiButton';
addEmojiButton.title = 'Insert emoji';
addEmojiButton.classList.add('fa-solid', 'fa-icons', 'interactable');
addEmojiButton.tabIndex = 0;

    const manageButton = document.createElement('div');
    manageButton.id = 'manageCustomEmojis';
    manageButton.title = 'Manage custom emojis';
    manageButton.classList.add('fa-solid', 'fa-cog', 'interactable');
    manageButton.tabIndex = 0;
    manageButton.style.marginRight = '5px';
    
    const manager = createCustomEmojiManager();
    
    manageButton.addEventListener('click', (e) => {
        e.stopPropagation();
        manager.style.display = 'block';
        updateCustomEmojiList();
    });
    
    buttonContainer.insertAdjacentElement('afterbegin', manageButton);

const popper = createPopper(addEmojiButton, picker, {
    placement: 'top-end',
    modifiers: [],
});

picker.classList.add('displayNone');
buttonContainer.insertAdjacentElement('afterbegin', addEmojiButton);

buttonContainer.addEventListener('click', (e) => {
    if (e.target === addEmojiButton) {
        picker.classList.toggle('displayNone');
        popper.update();

        if (!picker.classList.contains('displayNone')) {
            const search = picker.shadowRoot?.querySelector('input[type="search"]');
            if (search instanceof HTMLInputElement) {
                search.value = '';
                search.dispatchEvent(new Event('input'));
                search.focus();
            }
        } else {
            textarea.focus();
        }
    }
});

document.body.appendChild(picker);

document.body.addEventListener('click', (event) => {
    if (!picker.classList.contains('displayNone') && !picker.contains(event.target) && !addEmojiButton.contains(event.target)) {
        picker.classList.add('displayNone');
        popper.update();
    }
});

document.body.addEventListener('keyup', (event) => {
    if (!picker.classList.contains('displayNone') && event.key === 'Escape') {
        picker.classList.add('displayNone');
        popper.update();
    }
});

// Export functions for external use
window.EmojiPickerExtension = {
    addCustomEmoji,
    removeCustomEmoji,
    loadCustomEmojis,
};
/*global chrome*/

const ACTIONS = {
    ENABLE_SELECTION_MODE: 'enableSelectionMode',
    DISABLE_SELECTION_MODE: 'disableSelectionMode'
};


let activeTabs = new Set(); // Stocke les ID des onglets actifs
let onClickListener; // stocke la fonction d'événement de clic

chrome.runtime.onMessage.addListener((message) => {
    switch (message.action) {
        case ACTIONS.ENABLE_SELECTION_MODE:
            chrome.storage.local.set({ selectionModeActive: true }, activateSelectionMode);
            break;

        case ACTIONS.DISABLE_SELECTION_MODE:
            chrome.storage.local.set({ selectionModeActive: false }, deactivateSelectionMode);
            break;

        default:
            console.error('Action non reconnue:', message.action);
    }
});


chrome.runtime.onStartup.addListener(() => {
    restoreSelectionMode();
});

/**
 * @description Réactive le mode de sélection sur tous les onglets lors du redémarrage de Chrome.
 */
function restoreSelectionMode() {
    chrome.storage.local.get('selectionModeActive', (result) => {

        console.log('Restoring selection mode:', result.selectionModeActive);

        if (result.selectionModeActive) {
            activateSelectionMode()
        } else {
            deactivateSelectionMode()
        }
    });
}

/**
 * @description Éxécute un script sur tous les onglets actifs pour permettre la sélection d'éléments sur chaque page web.
 */
function activateSelectionMode() {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {

            if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://') && tab.id && Number.isInteger(tab.id)) {

                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: enableSelectionMode
                });
                activeTabs.add(tab.id);
            }
        });
    });

    // Ajouter un écouteur pour les nouveaux onglets
    chrome.tabs.onCreated.addListener(onTabCreated);
    chrome.tabs.onUpdated.addListener(onTabUpdated);
}

/**
 * @description Retire le script de sélection d'éléments de chaque onglet actif.
 * @returns {void}
 */
function deactivateSelectionMode() {
    activeTabs.forEach(tabId => {

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: disableSelectionMode
        });
    });
    activeTabs.clear();
    chrome.tabs.onCreated.removeListener(onTabCreated);
    chrome.tabs.onUpdated.removeListener(onTabUpdated);
}

/**
 * @description Ajout de l'écouteur d'événement pour les nouveaux onglets créés.
 * @function onTabCreated
 * @param {Object} tab - L'onglet qui vient d'être créé.
 * @returns {void}
 */
function onTabCreated(tab) {
    chrome.storage.local.get('selectionModeActive', (result) => {

        if (result.selectionModeActive) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: enableSelectionMode
            });
            activeTabs.add(tab.id);
        }
    });
}

/**
 * @description Ajout de l'écouteur d'événement pour les onglets mis à jour.
 * @param {number} tabId - L'ID de l'onglet mis à jour.
 * @param {Object} changeInfo - Informations sur les changements dans l'onglet (ex: statut).
 * @returns {void}
 */
function onTabUpdated(tabId, changeInfo, tab) {
    chrome.storage.local.get('selectionModeActive', (result) => {
        if (result.selectionModeActive && changeInfo.status === 'complete') {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                function: enableSelectionMode
            });
            activeTabs.add(tabId);
        }
    });
}

/**
 * @description Active un écouteur d'événement de clic pour modifier la couleur de fond des éléments cliqués.
 * @returns {void}
 */
function enableSelectionMode() {
    let previousElement = null;
    const tooltip = document.createElement('div');
    tooltip.id = 'selectionModeTooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'darkgray';
    tooltip.style.background = 'darkgray';
    tooltip.style.border = '1px solid #000';
    tooltip.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.3)';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '12px';
    tooltip.style.borderRadius = '3px';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '99999';
    tooltip.style.pointerEvents = 'none';
    document.body.appendChild(tooltip);

    onClickListener = (event) => {

        event.stopImmediatePropagation();
        event.preventDefault();

        const element = event.target;

        // Réinitialisez le style de l'élément précédent
        if (previousElement && previousElement !== element) {
            previousElement.style.backgroundColor = '';
        }

        // Changez la couleur de fond de l'élément sélectionné
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        element.style.backgroundColor = randomColor;

        // Mettez à jour le tooltip
        const tooltipText = `Background: ${randomColor}`;
        tooltip.innerText = tooltipText;
        tooltip.style.display = 'block';
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;

        // Mémorisez l'élément actuellement sélectionné
        previousElement = element;
    };

    document.addEventListener('click', onClickListener, { capture: true });
}

/**
 * @description Réinitialise les styles des éléments et retire les écouteurs d'événements ajoutés pendant le mode de sélection.
 * @returns {void}
 */
function disableSelectionMode() {

    // Supprimer l'écouteur d'événement de clic selectionModeClickListener
    if (onClickListener) {
        document.removeEventListener('click', onClickListener, { capture: true });
    }

    // Réinitialiser la couleur de fond
    document.querySelectorAll('*').forEach(element => {
        element.style.backgroundColor = '';
    });

    // Supprimer le tooltip
    const tooltip = document.getElementById('selectionModeTooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

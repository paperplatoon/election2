// eventHandlers.js
// Corrected imports:
import { findStateById, gainMoney } from './state.js'; // These are correctly in state.js
import { showClickEffect, toggleDropdownMenu } from './ui.js';
// These are now correctly imported from mechanics.js
import {
    canPurchaseItem,
    createItem,
    calculateMoneyFromClick,
    assignWorkerToState
} from './mechanics.js';

// Handle state click (earn money)
export function handleStateClick(event, gameState) {
    const stateId = parseInt(event.currentTarget.dataset.stateId);
    const state = findStateById(gameState, stateId);

    if (state && state.workers.length > 0) {
        let moneyEarned = calculateMoneyFromClick(gameState, stateId);

        if (moneyEarned > 0) {
            moneyEarned = Math.round(moneyEarned * 100) / 100
            gainMoney(gameState, moneyEarned);
            showClickEffect(event.clientX, event.clientY, `$${moneyEarned}`);
        }
    }
}

// Set up resource hover events for dropdown menus
export function setupResourceHoverEvents(gameState) {
    const moneyResource = document.getElementById('resource-money');
    const dropdown = document.getElementById('money-dropdown');

    if (moneyResource && dropdown) {
        moneyResource.addEventListener('mouseenter', () => {
            if (canPurchaseItem(gameState, 'worker')) {
                toggleDropdownMenu('money-dropdown', true);
            }
        });

        moneyResource.addEventListener('mouseleave', () => {
            toggleDropdownMenu('money-dropdown', false);
        });

        const createWorkerButton = document.getElementById('create-worker');
        if (createWorkerButton) {
            // Remove existing listener to prevent duplicates if this function is called multiple times
            // A more robust solution is to ensure setupResourceHoverEvents is called only once,
            // or manage listeners more carefully.
            const newButton = createWorkerButton.cloneNode(true);
            createWorkerButton.parentNode.replaceChild(newButton, createWorkerButton);
            newButton.addEventListener('click', (e) => {
                handleCreateWorker(e, gameState);
            });
        }
    }

    // Update "Hire Worker" button opacity based on affordability
    const moneyValueElement = document.querySelector('#resource-money .resource-value');
    const volunteersValueElement = document.querySelector('#resource-volunteers .resource-value');

    if (moneyValueElement && volunteersValueElement) {
        const observer = new MutationObserver(() => {
            const moneyValue = parseFloat(moneyValueElement.textContent);
            const volunteersValue = parseFloat(volunteersValueElement.textContent);
            const createButton = document.getElementById('create-worker'); // Re-query in case it was cloned
            const cost = gameState.config.workerCost;

            if (createButton) {
                const canAfford = moneyValue >= cost.money && volunteersValue >= cost.volunteers;
                createButton.style.opacity = canAfford ? '1' : '0.5';
                createButton.style.pointerEvents = canAfford ? 'auto' : 'none';
            }
        });

        observer.observe(moneyValueElement, { childList: true, characterData: true, subtree: true });
        observer.observe(volunteersValueElement, { childList: true, characterData: true, subtree: true });
    }
}

// Handle worker creation
function handleCreateWorker(event, gameState) {
    const newCard = createItem(gameState, 'worker');
    if (newCard) {
        console.log('Created new worker card:', newCard);
        // UI updates in gameLoop, but for responsiveness, hide dropdown immediately
        toggleDropdownMenu('money-dropdown', false);
    }
}

// Set up draggable events for worker cards
export function setupDraggableEvents(gameState) {
    const workerCards = document.querySelectorAll('.worker-card:not(.placed)');
    workerCards.forEach(card => {
        // Simple flag to avoid re-attaching listeners if setupDraggableEvents is called multiple times on same elements
        if (!card.dataset.dragSetup) {
            setupDragForWorkerCard(card, gameState);
            card.dataset.dragSetup = "true";
        }
    });
}

// Setup drag functionality for a worker card
function setupDragForWorkerCard(element, gameState) {
    let isDragging = false;
    let offsetX, offsetY;

    element.addEventListener('mousedown', (e) => {
        const cardId = parseInt(element.dataset.cardId);
        const cardData = gameState.workerCards.find(c => c.id === cardId);
        if (cardData && cardData.isPlaced) return; // Don't drag placed cards

        isDragging = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;

        // Apply dragging styles
        element.style.position = 'fixed'; // Use fixed position for dragging overlay
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
        element.style.zIndex = '1000';
        element.classList.add('dragging');

        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;

        element.classList.remove('dragging');
        element.style.zIndex = '100'; // Reset z-index

        // Check drop target
        // Temporarily hide the dragged element to correctly identify the element underneath
        element.style.display = 'none';
        const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
        element.style.display = ''; // Make it visible again

        const cardId = parseInt(element.dataset.cardId);
        checkDropOnState(elementUnderMouse, cardId, gameState);

        // Reset styles if not successfully placed. The main UI update loop in game.js
        // will re-render cards in their correct places (either in the pool or visually on a state if logic were added).
        // For now, if not dropped on a state, it remains 'unplaced' in data.
        // The UI update will put it back in the worker pool visually.
        element.style.position = 'relative'; // Revert to original flow
        element.style.left = '';
        element.style.top = '';
    });
}

// Check if a worker card is dropped on a state
function checkDropOnState(droppedOnElement, cardId, gameState) {
    if (!droppedOnElement) return;

    const stateElement = droppedOnElement.closest('.state');

    if (stateElement) {
        const stateId = parseInt(stateElement.dataset.stateId);
        if (assignWorkerToState(gameState, cardId, stateId)) {
            console.log(`Assigned worker card ${cardId} to state ${stateId}`);
            // The UI will be updated in the main game loop.
        }
    }
}

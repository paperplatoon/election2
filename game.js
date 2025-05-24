// game.js - Core game logic
import { createGameState } from './state.js';
import { renderUI, setStateBackgroundColor } from './ui.js';
import { 
    handleStateClick, 
    setupResourceHoverEvents, 
    setupDraggableEvents 
} from './eventHandlers.js';
import { 
    updateSupportValues, 
    calculateStatesWon,
    generateVolunteersOverTime
} from './mechanics.js';

// Game variables
let gameState;
let lastTimestamp = 0;
let appElement;

// Initialize the game
export function initializeGame() {
    // Get the app element
    appElement = document.getElementById('app');
    
    // Create initial game state
    gameState = createGameState();
    
    // Store gameState globally for access from event handlers
    window.gameState = gameState;
    
    // Initial render
    renderUI(appElement, gameState);
    
    // Set up event listeners
    setupEventListeners();
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Set up all event listeners
function setupEventListeners() {
    // Add click listeners to states
    const states = document.querySelectorAll('.state');
    states.forEach(state => {
        state.addEventListener('click', (e) => {
            handleStateClick(e, gameState);
        });
    });
    
    // Setup resource hover events for dropdown menus
    setupResourceHoverEvents(gameState);
    
    // Setup draggable events for worker cards
    setupDraggableEvents(gameState);
}

// Main game loop
function gameLoop(timestamp) {
    // Calculate time delta in seconds
    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    
    // Skip first frame
    if (deltaTime > 0) {
        // Update game state
        updateGameState(deltaTime);
        
        // Update UI
        updateUI();
    }
    
    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Update game state based on time passed
function updateGameState(deltaTime) {
    // Update support values based on workers
    updateSupportValues(gameState, deltaTime);
    generateVolunteersOverTime(gameState, deltaTime);
}

// Update the UI to reflect current game state
function updateUI() {
    // Update state displays
    gameState.states.forEach(state => {
        const stateElement = document.getElementById(`state-${state.id}`);
        if (stateElement) {
            // Update background color based on support percentage
            setStateBackgroundColor(stateElement, state.type, state.supportPercentage);
            
            // Update support percentage display - Enhanced to show 2 decimal places
            const supportElement = stateElement.querySelector('.state-support');
            if (supportElement) {
                supportElement.textContent = `${state.supportPercentage.toFixed(2)}%`;
            }
            
            // Update worker count display
            const existingWorkersElement = stateElement.querySelector('.state-workers');
            if (existingWorkersElement) {
                existingWorkersElement.remove();
            }
            
            if (state.workers.length > 0) {
                const workersElement = document.createElement('div');
                workersElement.className = 'state-workers';
                workersElement.textContent = `${state.workers.length} worker${state.workers.length !== 1 ? 's' : ''}`;
                stateElement.appendChild(workersElement);
            }
            
            // Update money per click display
            const existingMoneyElement = stateElement.querySelector('.state-money');
            if (existingMoneyElement) {
                existingMoneyElement.remove();
            }
            
            if (state.workers.length > 0) {
                const moneyElement = document.createElement('div');
                moneyElement.className = 'state-money';
                const moneyPerClick = Math.floor(state.supportPercentage * gameState.config.moneyPerSupportPercent);
                moneyElement.textContent = `${moneyPerClick}/click`;
                stateElement.appendChild(moneyElement);
            }
        }
    });
    
    // Update resource displays
    for (const [resourceType, value] of Object.entries(gameState.resources)) {
        const resourceElement = document.getElementById(`resource-${resourceType}`);
        if (resourceElement) {
            const valueElement = resourceElement.querySelector('.resource-value');
            if (valueElement) {
                valueElement.textContent = Math.floor(value);
            }
        }
    }
    
    // Update states won display
    const statesWonElement = document.getElementById('states-won');
    if (statesWonElement) {
        statesWonElement.textContent = `${calculateStatesWon(gameState)}/${gameState.states.length}`;
    }
    
    // Update worker cards section
    updateWorkerCardsSection();
    
    // Re-setup event listeners for new elements
    setupNewEventListeners();
}

// Update worker cards section
function updateWorkerCardsSection() {
    const cardsContainer = document.querySelector('.worker-cards-container');
    if (cardsContainer) {
        // Clear existing cards
        cardsContainer.innerHTML = '';
        
        // Add unplaced worker cards
        gameState.workerCards.forEach(card => {
            if (!card.isPlaced) {
                const cardElement = createWorkerCardElement(card);
                cardsContainer.appendChild(cardElement);
            }
        });
    }
}

// Create worker card element (helper function)
function createWorkerCardElement(card) {
    const cardElement = document.createElement('div');
    cardElement.className = 'worker-card';
    cardElement.dataset.cardId = card.id;
    
    const name = document.createElement('div');
    name.className = 'worker-card-name';
    name.textContent = card.name;
    
    const effect = document.createElement('div');
    effect.className = 'worker-card-effect';
    effect.textContent = `+${(card.supportRate).toFixed(2)}% support/s`;
    
    cardElement.appendChild(name);
    cardElement.appendChild(effect);
    
    return cardElement;
}

// Setup event listeners for newly created elements
function setupNewEventListeners() {
    // Setup draggable events for new worker cards
    setupDraggableEvents(gameState);
}
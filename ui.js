// ui.js - UI rendering and updates
import { calculateStatesWon } from './mechanics.js';

// Export helper functions for other modules
export function setStateBackgroundColor(element, type, supportPercentage) {
    let baseColor;
    switch (type) {
        case 'urban':
            baseColor = '90, 156, 248'; // Blue
            break;
        case 'rural':
            baseColor = '102, 187, 106'; // Green
            break;
        case 'mixed':
            baseColor = '240, 71, 71'; // Red
            break;
        default:
            baseColor = '128, 128, 128'; // Gray
    }
    
    // Calculate opacity based on support percentage (0-100%)
    const opacity = Math.min(1, supportPercentage / 100);
    element.style.backgroundColor = `rgba(${baseColor}, ${0.3 + (opacity * 0.5)})`;
    
    // Add winning state indicator with enhanced golden glow
    if (supportPercentage >= 50) {
        element.style.border = '4px solid #ffcc00';
        element.style.boxShadow = `
            0 0 20px rgba(255, 204, 0, 0.6),
            0 0 40px rgba(255, 204, 0, 0.4),
            0 8px 32px rgba(31, 38, 135, 0.37)
        `;
    } else {
        // Reset to default enhanced styling
        element.style.border = '3px solid rgba(255, 255, 255, 0.3)';
        element.style.boxShadow = `
            0 8px 32px rgba(31, 38, 135, 0.37),
            0 2px 8px rgba(0, 0, 0, 0.1)
        `;
    }
}

// Capitalize first letter helper
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Render the entire UI
export function renderUI(appElement, gameState) {
    // Clear existing content
    appElement.innerHTML = '';
    
    // Create resource bar
    const resourceBar = createResourceBar(gameState);
    appElement.appendChild(resourceBar);
    
    // Create worker cards section
    const workerCardsSection = createWorkerCardsSection(gameState);
    appElement.appendChild(workerCardsSection);
    
    // Create state grid
    const gridContainer = createStateGrid(gameState);
    appElement.appendChild(gridContainer);
}

// Create the resource bar
function createResourceBar(gameState) {
    const resourceBar = document.createElement('div');
    resourceBar.className = 'resource-bar';
    
    // Create states won display
    const statesWonContainer = document.createElement('div');
    statesWonContainer.className = 'states-won-container';
    
    const statesWonLabel = document.createElement('div');
    statesWonLabel.className = 'states-won-label';
    statesWonLabel.textContent = 'States Won:';
    
    const statesWonValue = document.createElement('div');
    statesWonValue.className = 'states-won-value';
    statesWonValue.id = 'states-won';
    statesWonValue.textContent = `${calculateStatesWon(gameState)}/${gameState.states.length}`;
    
    statesWonContainer.appendChild(statesWonLabel);
    statesWonContainer.appendChild(statesWonValue);
    resourceBar.appendChild(statesWonContainer);
    
    // Create resource displays
    const resourceTypes = [
        { type: 'money', label: 'Money' },
        { type: 'volunteers', label: 'Volunteers' }
    ];
    
    resourceTypes.forEach(({ type, label }) => {
        const resource = createResourceDisplay(type, label, gameState.resources[type], gameState);
        resourceBar.appendChild(resource);
    });
    
    return resourceBar;
}

// Create a resource display element
function createResourceDisplay(type, label, value, gameState) {
    const resource = document.createElement('div');
    resource.className = 'resource';
    resource.id = `resource-${type}`;
    
    const labelElement = document.createElement('div');
    labelElement.className = 'resource-label';
    labelElement.textContent = label;
    
    const valueElement = document.createElement('div');
    valueElement.className = 'resource-value';
    valueElement.textContent = Math.floor(value);
    
    resource.appendChild(labelElement);
    resource.appendChild(valueElement);
    
    // Add dropdown menu for money resource
    if (type === 'money') {
        const dropdownMenu = createDropdownMenu(gameState);
        resource.appendChild(dropdownMenu);
    }
    
    return resource;
}

// Create dropdown menu for resources
function createDropdownMenu(gameState) {
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'dropdown-menu';
    dropdownMenu.id = 'money-dropdown';
    
    const cost = gameState.config.workerCost;
    const workerOption = document.createElement('div');
    workerOption.className = 'dropdown-item';
    workerOption.id = 'create-worker';
    workerOption.textContent = `Hire Worker ($${cost.money}, ${cost.volunteers}v)`;
    
    dropdownMenu.appendChild(workerOption);
    
    return dropdownMenu;
}

// Create worker cards section
function createWorkerCardsSection(gameState) {
    const section = document.createElement('div');
    section.className = 'worker-cards-section';
    section.id = 'worker-cards';
    
    const title = document.createElement('div');
    title.className = 'worker-cards-title';
    title.textContent = 'Campaign Workers:';
    section.appendChild(title);
    
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'worker-cards-container';
    
    // Render unplaced worker cards
    gameState.workerCards.forEach(card => {
        if (!card.isPlaced) {
            const cardElement = createWorkerCardElement(card);
            cardsContainer.appendChild(cardElement);
        }
    });
    
    section.appendChild(cardsContainer);
    return section;
}

// Create worker card element
function createWorkerCardElement(card) {
    const cardElement = document.createElement('div');
    cardElement.className = 'worker-card';
    cardElement.dataset.cardId = card.id;
    
    const name = document.createElement('div');
    name.className = 'worker-card-name';
    name.textContent = card.name;
    
    const effect = document.createElement('div');
    effect.className = 'worker-card-effect';
    effect.textContent = `+${(card.supportRate * 100).toFixed(2)}% support/s`;
    
    cardElement.appendChild(name);
    cardElement.appendChild(effect);
    
    return cardElement;
}

// Create the state grid
function createStateGrid(gameState) {
    const gridContainer = document.createElement('div');
    gridContainer.className = 'states-container';
    
    // Create states with flexible positioning
    gameState.states.forEach(state => {
        const stateElement = createStateElement(state, gameState);
        gridContainer.appendChild(stateElement);
    });
    
    return gridContainer;
}

// Create a state element
function createStateElement(state, gameState) {
    const stateElement = document.createElement('div');
    stateElement.className = `state ${state.size} ${state.type}`;
    stateElement.id = `state-${state.id}`;
    stateElement.dataset.stateId = state.id;
    
    // Set background color based on support
    setStateBackgroundColor(stateElement, state.type, state.supportPercentage);
    
    // State name
    const nameElement = document.createElement('div');
    nameElement.className = 'state-name';
    nameElement.textContent = state.name;
    stateElement.appendChild(nameElement);
    
    // Support percentage - Updated to show 2 decimal places
    const supportElement = document.createElement('div');
    supportElement.className = 'state-support';
    supportElement.textContent = `${state.supportPercentage.toFixed(2)}%`;
    stateElement.appendChild(supportElement);
    
    // Worker count
    if (state.workers.length > 0) {
        const workersElement = document.createElement('div');
        workersElement.className = 'state-workers';
        workersElement.textContent = `${state.workers.length} worker${state.workers.length !== 1 ? 's' : ''}`;
        stateElement.appendChild(workersElement);
    }
    
    // Money per click (if has workers)
    if (state.workers.length > 0) {
        const moneyElement = document.createElement('div');
        moneyElement.className = 'state-money';
        const moneyPerClick = Math.floor(state.supportPercentage * gameState.config.moneyPerSupportPercent);
        moneyElement.textContent = `$${moneyPerClick}/click`;
        stateElement.appendChild(moneyElement);
    }
    
    return stateElement;
}

// Show click effect animation
export function showClickEffect(x, y, value) {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = value;
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    
    document.body.appendChild(effect);
    
    // Remove after animation completes
    setTimeout(() => {
        effect.remove();
    }, 1000);
}

// Toggle dropdown menu
export function toggleDropdownMenu(menuId, show) {
    const menu = document.getElementById(menuId);
    if (menu) {
        if (show) {
            menu.classList.add('active');
        } else {
            menu.classList.remove('active');
        }
    }
}
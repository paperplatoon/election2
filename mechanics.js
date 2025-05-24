// mechanics.js - Game mechanics and calculations

// Update support values for all states based on assigned workers and deltaTime
export function updateSupportValues(gameState, deltaTime) {
    gameState.states.forEach(state => {
        if (state.workers.length === 0) return;

        let totalSupportRate = 0;
        state.workers.forEach(workerId => {
            const worker = gameState.workers.find(w => w.id === workerId);
            if (worker) {
                totalSupportRate += worker.supportRate;
            }
        });

        const supportGain = totalSupportRate * deltaTime;

        if (supportGain > 0) {
            const oldSupport = state.supportPercentage;
            state.supportPercentage = Math.min(100, state.supportPercentage + supportGain);
            const actualGain = state.supportPercentage - oldSupport;

            if (actualGain > 0) {
                generateVolunteersFromSupport(gameState, actualGain);
            }
        }
    });
}

// Generates volunteers based on the amount of support gained
function generateVolunteersFromSupport(gameState, supportGain) {
    const volunteersGained = Math.floor(supportGain * gameState.config.volunteersPerSupportGain);
    if (volunteersGained > 0) {
        gameState.resources.volunteers += volunteersGained;
    }
}

// Calculates money earned from clicking a state, based on its support percentage
export function calculateMoneyFromClick(gameState, stateId) {
    const state = gameState.states.find(s => s.id === stateId);

    return state.supportPercentage * gameState.config.moneyPerSupportPercent;
}

// Checks if the player has enough resources to purchase a given item type
export function canPurchaseItem(gameState, itemType) {
    switch (itemType) {
        case 'worker':
            const cost = gameState.config.workerCost;
            return gameState.resources.money >= cost.money &&
                   gameState.resources.volunteers >= cost.volunteers;
        default:
            return false;
    }
}

// Creates a new item (e.g., a worker) if affordable
export function createItem(gameState, itemType) {
    switch (itemType) {
        case 'worker':
            if (canPurchaseItem(gameState, 'worker')) {
                const cost = gameState.config.workerCost;
                gameState.resources.money -= cost.money;
                gameState.resources.volunteers -= cost.volunteers;

                const newUnitId = gameState.nextCardId; // Use a single ID source
                const workerName = `Campaign Volunteer ${newUnitId}`; // Use newUnitId for name

                // Create the worker card object (for UI)
                const newCard = {
                    id: newUnitId, // Use newUnitId
                    type: "volunteer",
                    name: workerName, // Use consistent name
                    supportRate: gameState.config.baseSupportRate,
                    isPlaced: false,
                    cost: cost
                };
                gameState.workerCards.push(newCard);

                // ALSO CREATE THE WORKER DATA OBJECT
                const newWorkerData = {
                    id: newUnitId, // Use newUnitId
                    name: workerName, // Use consistent name
                    supportRate: gameState.config.baseSupportRate
                };
                gameState.workers.push(newWorkerData);

                // Increment the ID counters for the next unit
                gameState.nextCardId++;
                gameState.nextWorkerId = gameState.nextCardId; // Keep them in sync

                return newCard;
            }
            break;
        default:
            return null;
    }
    return null;
}

// Assigns a worker (identified by cardId) to a state (identified by stateId)
export function assignWorkerToState(gameState, cardId, stateId) {
    const card = gameState.workerCards.find(c => c.id === cardId);
    const state = gameState.states.find(s => s.id === stateId);
    const workerData = gameState.workers.find(w => w.id === cardId);

    if (card && !card.isPlaced && state && workerData) {
        card.isPlaced = true;
        state.workers.push(workerData.id);

        console.log(`Assigned worker ${workerData.name} (Card ID: ${cardId}) to state ${state.name}`);
        return true;
    } else {
        console.error('Failed to assign worker to state:', { cardId, stateId, cardExists: !!card, cardPlaced: card?.isPlaced, stateExists: !!state, workerDataExists: !!workerData });
        if (card && card.isPlaced) {
            console.warn(`Worker card ${cardId} is already placed.`);
        }
        return false;
    }
}

// Gets a worker data object by its ID
export function getWorkerById(gameState, workerId) {
    return gameState.workers.find(w => w.id === workerId);
}

// Gets a worker card object by its ID
export function getWorkerCardById(gameState, cardId) {
    return gameState.workerCards.find(c => c.id === cardId);
}

// Calculates the total number of states "won" (support >= threshold)
export function calculateStatesWon(gameState) {
    let statesWon = 0;
    gameState.states.forEach(state => {
        if (state.supportPercentage >= gameState.config.supportWinThreshold) {
            statesWon++;
        }
    });
    return statesWon;
}

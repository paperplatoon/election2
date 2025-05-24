// state.js - Game state management

// Helper to generate initial states based on game configuration
function generateInitialStates(config) {
    const states = [];
    const types = ['urban', 'rural', 'mixed']; // Possible state types
    const sizes = ['small', 'medium', 'large']; // Possible state sizes
    for (let i = 1; i <= config.numberOfStates; i++) {
        states.push({
            id: i,
            name: `State ${String.fromCharCode(64 + i)}`, // Names states A, B, C...
            type: types[Math.floor(Math.random() * types.length)],
            size: sizes[Math.floor(Math.random() * sizes.length)],
            supportPercentage: 0, // Initial support is 0
            workers: [], // Array to store IDs of workers assigned to this state
        });
    }
    return states;
}

// Helper to generate initial worker cards AND their corresponding data objects
function generateInitialWorkersAndCards(config, nextIdStart) {
    const workerCards = []; // For UI representation (draggable cards)
    const workers = [];     // For game logic (data like support rate)
    let currentId = nextIdStart;

    for (let i = 0; i < config.startingWorkers; i++) {
        const workerId = currentId++; // Use a consistent ID for the card and its data
        const workerName = `Volunteer Mk.${workerId}`;

        // Create the worker card object
        workerCards.push({
            id: workerId,
            type: "volunteer", // Type of worker
            name: workerName,
            supportRate: config.baseSupportRate,
            isPlaced: false, // Initially, workers are not assigned to a state
            cost: { money: 0, volunteers: 0 } // Starting workers are typically free
        });

        // Create the corresponding worker data object
        workers.push({
            id: workerId,
            name: workerName,
            supportRate: config.baseSupportRate
        });
    }
    // Return the created arrays and the next available ID for future workers/cards
    return { workerCards, workers, nextAvailableId: currentId };
}

// Creates the initial game state object
export function createGameState() {
    // Centralized game configuration
    const config = {
        numberOfStates: 5,
        supportWinThreshold: 50,
        baseSupportRate: 0.01,
        startingWorkers: 3,
        workerCost: { money: 100, volunteers: 1 },
        moneyPerSupportPercent: 1,
        volunteersPerSupportGain: 10,
    };

    // Generate initial workers and cards, starting IDs from 1
    const initialWorkerData = generateInitialWorkersAndCards(config, 1);

    return {
        config: config,
        states: generateInitialStates(config), // Initialize states using the helper
        resources: {
            money: 0,
            volunteers: 0
        },
        workers: initialWorkerData.workers,         // Populate with initial worker data objects
        workerCards: initialWorkerData.workerCards, // Populate with initial worker card objects
        // Set the next available IDs for creating new workers/cards.
        // If startingWorkers is 3, IDs 1,2,3 are used. Next available is 4.
        nextWorkerId: initialWorkerData.nextAvailableId,
        nextCardId: initialWorkerData.nextAvailableId
    };
}

// Finds a state by its ID within the game state
export function findStateById(gameState, stateId) {
    return gameState.states.find(s => s.id === stateId);
}

// Adds a specified amount of money to the player's resources
export function gainMoney(gameState, amount) {
    if (amount > 0) {
        gameState.resources.money += amount;
    }
}

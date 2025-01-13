import { intro, outro, select, text, spinner, multiselect } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs';

// Game State aka PORT DATA
let ports = [
  {
    name: 'Athens',
    goods: { wheat: 5, OliveOil: 10, wine: 8, pottery: 6 },
    prices: { wheat: 5, OliveOil: 10, wine: 8, pottery: 6 },
    npcs: ['Sophia the Merchant', 'Nikolas the Philosopher'],
    uniqueLocations: ['Agora', 'Temple of Athena'],
  },
  {
    name: 'Carthage',
    goods: { spices: 15, textiles: 12, metals: 20 },
    prices: { spices: 15, textiles: 12, metals: 20 },
    npcs: ['Hanno the Navigator'],
    uniqueLocations: ['Bazaar', 'Harbor'],
  },
  {
    name: 'Alexandria',
    goods: { wheat: 7, OliveOil: 9, spices: 18 },
    prices: { wheat: 7, OliveOil: 9, spices: 18 },
    npcs: ['Cleon the Scholar'],
    uniqueLocations: ['Library', 'Lighthouse'],
  },
  {
    name: 'Tyre',
    goods: { textiles: 14, pottery: 6, wine: 10 },
    prices: { textiles: 14, pottery: 6, wine: 10 },
    npcs: ['Phoenicia the Trader'],
    uniqueLocations: ['Dye Works', 'Market Square'],
  },
  {
    name: 'Rhodes',
    goods: { metals: 17, OliveOil: 11, wine: 9 },
    prices: { metals: 17, OliveOil: 11, wine: 9 },
    npcs: ['Artemis the Shipwright'],
    uniqueLocations: ['Shipyard', 'Colossus Viewpoint'],
  },
  {
    name: 'Syracuse',
    goods: { pottery: 5, wheat: 6, OliveOil: 8 },
    prices: { pottery: 5, wheat: 6, OliveOil: 8 },
    npcs: ['Dionysius the Guard'],
    uniqueLocations: ['Fortress', 'Dock'],
  },
  {
    name: 'Knossos',
    goods: { OliveOil: 10, wine: 7, spices: 16 },
    prices: { OliveOil: 10, wine: 7, spices: 16 },
    npcs: ['Minos the Captain'],
    uniqueLocations: ['Palace', 'Marketplace'],
  },
];

//starting player components; add lore later
let player = {
  name: '',
  drachmas: 100,
  fleet: 3,
  crew: 10,
  inventory: {},
  supplies: { food: 20, water: 20 },
  currentPort: 'Athens',
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//linear function for now
function calculateSupplyConsumption(distance) {
    const foodConsumptionMultiplier = 0.5;
    const waterConsumptionMultiplier = 1;
    const foodConsumed = Math.max(0, Math.floor(distance * foodConsumptionMultiplier));
    const waterConsumed = Math.max(0, Math.floor(distance * waterConsumptionMultiplier));
    return { foodConsumed, waterConsumed };
  }

  //WORK IN PROGRESS
  function saveGame() {
    const gameState = { player, ports };
    const gameStateJson = JSON.stringify(gameState, null, 2);
    fs.writeFileSync('savegame.json', gameStateJson);
    console.log(chalk.green('Game saved successfully!'));
  }
  
  //very very sketchy, do not change
  function loadGame() {
    if (fs.existsSync('savegame.json')) {
      const gameStateJson = fs.readFileSync('savegame.json', 'utf-8');
      const gameState = JSON.parse(gameStateJson);
      player = gameState.player;
      ports = gameState.ports;
      console.log(chalk.green('Game loaded successfully!'));
    } else {
      console.log(chalk.yellow('No save file found.'));
    }
  }
  

  //landing page logic
  async function startGame() {
    const loadOption = await select({
      message: 'Do you want to load a saved game?',
      options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
    });
  
    if (loadOption === 'yes') {
      loadGame();
      if (player.name) { // Check if player name is loaded
        intro(chalk.green(`Welcome back, ${player.name}!`));
        await mainMenu();
      } else {
        console.log(chalk.red("Error loading game. Starting a new game."));
        await newGame();
      }
    } else {
      await newGame();
    }
  }

async function newGame() {
  intro(chalk.green('Welcome to Tradewinds!'));
  player.name = await text({
    message: 'What is your name, captain?',
    validate: (value) => (value ? undefined : 'Please enter a name.'),
  });

  outro(
    `Greetings, ${player.name}! You have inherited a small fleet and 100 drachmas. Your journey begins at ${player.currentPort}.`
  );

  await mainMenu();
}

//extremely unstable switchcase, port to better logic later
async function mainMenu() {
  const action = await multiselect({
    message: 'Choose your actions:',
    options: [
      { value: 'trade', label: 'Trade goods' },
      { value: 'travel', label: 'Travel to another port' },
      { value: 'marketplace', label: 'Visit the marketplace' },
      { value: 'locations', label: 'Explore unique locations' },
      { value: 'manage', label: 'Manage crew and supplies' },
      { value: 'inventory', label: 'Check Inventory' },
      { value: 'pray', label: 'Pray to the gods' },
      { value: 'save', label: 'Save Game' },
    ],
    required: true,
  });

  for (const act of action) {
    switch (act) {
      case 'trade':
        await tradeGoods();
        break;
      case 'travel':
        await travel();
        break;
      case 'marketplace':
        await visitMarketplace();
        break;
      case 'locations':
        await exploreLocations();
        break;
      case 'manage':
        await manageCrew();
        break;
      case 'inventory':
        await checkInventory();
        break;
      case 'pray':
        await prayToGods();
        break;
      case 'save':
        saveGame();
        break;
    }
  }
  await mainMenu();
}

async function tradeGoods() {
  const port = ports.find((p) => p.name === player.currentPort);
  console.log(chalk.yellow(`You are at ${player.currentPort}. Available goods:`));

  for (const [good, price] of Object.entries(port.goods)) {
    console.log(`${good}: ${price} drachmas`);
  }

  const buyOrSell = await select({
    message: 'Buy or Sell?',
    options: [{ value: 'buy', label: 'Buy' }, { value: 'sell', label: 'Sell' }],
  });

  const goodToTrade = await select({
    message: 'What good would you like to trade?',
    options: Object.keys(port.goods).map((good) => ({ value: good, label: good })),
  });

  const amount = await text({
    message: `How much ${goodToTrade} do you want to ${buyOrSell}?`,
    validate: (value) =>
      isNaN(value) || value <= 0 ? 'Please enter a valid amount.' : undefined,
  });

  const cost = port.prices[goodToTrade] * amount;

  if (buyOrSell === 'buy') {
    if (player.drachmas >= cost) {
      player.drachmas -= cost;
      player.inventory[goodToTrade] = (player.inventory[goodToTrade] || 0) + parseInt(amount);
      outro(`You bought ${amount} ${goodToTrade} for ${cost} drachmas.`);
    } else {
      outro(chalk.red('You do not have enough drachmas.'));
    }
  } else { 
    if (player.inventory[goodToTrade] >= amount) {
      player.drachmas += cost;
      player.inventory[goodToTrade] -= parseInt(amount);
      outro(`You sold ${amount} ${goodToTrade} for ${cost} drachmas.`);
    } else {
      outro(chalk.red(`You do not have enough ${goodToTrade} to sell.`));
    }
  }
}

async function visitMarketplace() {
  const port = ports.find((p) => p.name === player.currentPort);
  console.log(chalk.cyan(`You enter the bustling marketplace of ${port.name}.`));
  console.log('You see the following people:');

  port.npcs.forEach((npc, index) => {
    console.log(`${index + 1}. ${npc}`);
  });

  const npcChoice = await text({
    message: 'Who would you like to talk to? (type the number or "back" to return)',
  });

  if (npcChoice === 'back') {
    return;
  }

  const npcIndex = parseInt(npcChoice) - 1;

  if (npcIndex >= 0 && npcIndex < port.npcs.length) {
    console.log(chalk.magenta(`You talk to ${port.npcs[npcIndex]}.`));
    console.log('They share stories of distant lands, rare goods, and dangerous waters.');
  } else {
    console.log(chalk.red('Invalid choice.'));
  }
}

async function exploreLocations() {
  const port = ports.find((p) => p.name === player.currentPort);
  console.log(chalk.green(`You explore the unique locations in ${port.name}:`));
  port.uniqueLocations.forEach((location, index) => {
    console.log(`${index + 1}. ${location}`);
  });

  await text({ message: 'Press enter to return to the main menu.' });
}

//widely inaccurate, DISTANCES NEED REWORK AND SWITCH TO COORDINATE PLANE SYSTEM
const distanceMatrix = {
    Athens: { Carthage: 20, Alexandria: 15, Tyre: 12, Rhodes: 18, Syracuse: 25, Knossos: 10 },
    Carthage: { Athens: 20, Alexandria: 22, Tyre: 8, Rhodes: 25, Syracuse: 12, Knossos: 30 },
    Alexandria: { Athens: 15, Carthage: 22, Tyre: 15, Rhodes: 20, Syracuse: 28, Knossos: 25 },
    Tyre: { Athens: 12, Carthage: 8, Alexandria: 15, Rhodes: 10, Syracuse: 18, Knossos: 22 },
    Rhodes: { Athens: 18, Carthage: 25, Alexandria: 20, Tyre: 10, Syracuse: 22, Knossos: 28 },
    Syracuse: { Athens: 25, Carthage: 12, Alexandria: 28, Tyre: 18, Rhodes: 22, Knossos: 35 },
    Knossos: { Athens: 10, Carthage: 30, Alexandria: 25, Tyre: 22, Rhodes: 28, Syracuse: 35 },
  };

  function calculateDistance(origin, destination) {
    return distanceMatrix[origin][destination]
  };


  async function travel() {
    const portOptions = ports
      .filter((p) => p.name !== player.currentPort)
      .map((p) => ({ value: p.name, label: p.name }));
  
    const destination = await select({
      message: 'Where would you like to travel?',
      options: portOptions,
    });
  
    const distance = calculateDistance(player.currentPort, destination);
    const supplyConsumption = calculateSupplyConsumption(distance);
  
    player.supplies.food -= supplyConsumption.foodConsumed;
    player.supplies.water -= supplyConsumption.waterConsumed;
  
    const travelSpinner = spinner();
    travelSpinner.start(`Traveling to ${destination}...`);
  
    await delay(2000);
  
    player.currentPort = destination;
    handleRandomEvents();
    handleStarvation();
    travelSpinner.stop(chalk.green(`You have arrived at ${destination}.`));

  handleStarvation(); //idk, remember to pull handle in other functions
}

//fix this horrendous nesting later 
function handleStarvation() {
    if (player.supplies.food <= 0 || player.supplies.water <= 0) {
      const starvationEvents = [
        'Your crew mutinies due to starvation!',
        'Half your crew dies from starvation...',
        'Your crew is too weak to sail further!',
      ];
      const event = starvationEvents[Math.floor(Math.random() * starvationEvents.length)];
      console.log(chalk.red(`Starvation Event: ${event}`));
  
      if (event.includes('mutinies')) {
        player.crew = 0;
        console.log(chalk.red("You have been overthrown! You are now standed at sea."));
        process.exit();
      } else if (event.includes('Half your crew dies')) {
        player.crew = Math.floor(player.crew / 2);
      } else {
        console.log(chalk.red("Game Over"));
        process.exit();
      }
    }
  }

function handleRandomEvents() {
  const eventChance = Math.random();

  if (eventChance < 0.3) {
    const events = [
      'A storm damages one of your ships.',
      'Pirates raid your fleet and steal some goods.',
      'Your crew falls ill due to spoiled food.',
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    console.log(chalk.red(`Random event: ${event}`));
    player.fleet = Math.max(player.fleet - 1, 1);
  } else {
    console.log(chalk.blue('The journey was smooth, and you encountered no trouble.'));
  }
}

async function prayToGods() {
  const result = Math.random();
  if (result < 0.3) {
    outro(chalk.red('Poseidon is displeased! A storm damages your fleet.'));
    player.fleet -= 1;
  } else {
    outro(chalk.blue('The gods smile upon you. Safe travels ahead.'));
  }
}

async function manageCrew() {
  outro(
    `You have ${player.crew} crew members, ${player.supplies.food} food, and ${player.supplies.water} water.`
  );
}

async function checkInventory() {
  console.log(chalk.yellow('Your Inventory:'));
  if (Object.keys(player.inventory).length === 0) {
    console.log('Your inventory is empty.');
  } else {
    for (const [item, quantity] of Object.entries(player.inventory)) {
      console.log(`${item}: ${quantity}`);
    }
  }
  await text({ message: 'Press Enter to continue' });
}

startGame();
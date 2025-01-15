//imports
import { intro, outro, select, text, spinner, multiselect } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs';
import { stdin} from 'process';
import { exit } from 'process';


// Game State aka PORT DATA
let ports = [
  {
    name: 'Athens',
    goods: { Wheat: 5, 'Olive Oil': 10, Wine: 8, Pottery: 6, Food: 2, Water: 1 },
    prices: { Wheat: 5, 'Olive Oil': 10, Wine: 8, Pottery: 6, Food: 2, Water: 1 },
    npcs: ['Sophia the Merchant', 'Nikolas the Philosopher'],
    uniqueLocations: [
      { name: 'Agora', description: 'The bustling marketplace of Athens, the heart of Athenian trade and commerce.' },
      { name: 'Temple of Athena', description: 'The magnificent Temple of Athena, where offerings are made and fortunes can be told.' },
    ],
  },
  {
    name: 'Carthage',
    goods: { Spices: 15, Textiles: 12, Metals: 20, Food: 2, Water: 1 },
    prices: { Spices: 15, Textiles: 12, Metals: 20, Food: 2, Water: 1 },
    npcs: ['Hanno the Navigator'],
    uniqueLocations: [
      { name: 'Bazaar', description: 'A vibrant marketplace filled with exotic goods from across the Mediterranean.' },
      { name: 'Harbor', description: 'The bustling harbor of Carthage, where ships arrive and depart daily.' },
    ],
  },
  {
    name: 'Alexandria',
    goods: { Wheat: 7, 'Olive Oil': 9, Spices: 18, Food: 2, Water: 1 },
    prices: { Wheat: 7, 'Olive Oil': 9, Spices: 18, Food: 2, Water: 1 },
    npcs: ['Cleon the Scholar'],
    uniqueLocations: [
      { name: 'Library', description: 'The legendary Library of Alexandria, where knowledge is power.' },
      { name: 'Lighthouse', description: 'The towering Lighthouse of Alexandria, guiding ships safely to port.' },
    ],
  },
  {
    name: 'Tyre',
    goods: { Textiles: 14, Pottery: 6, Wine: 10, Food: 2, Water: 1 },
    prices: { Textiles: 14, Pottery: 6, Wine: 10, Food: 2, Water: 1 },
    npcs: ['Phoenicia the Trader'],
    uniqueLocations: [
      { name: 'Dye Works', description: 'The vibrant dye works of Tyre, producing the finest purple dye in the known world.' },
      { name: 'Market Square', description: 'A large open-air market filled with the sounds and smells of Tyre.' },
    ],
  },
  {
    name: 'Rhodes',
    goods: { Metals: 17, 'Olive Oil': 11, Wine: 9, Food: 2, Water: 1 },
    prices: { Metals: 17, 'Olive Oil': 11, Wine: 9, Food: 2, Water: 1 },
    npcs: ['Artemis the Shipwright'],
    uniqueLocations: [
      { name: 'Shipyard', description: 'The busy shipyard of Rhodes, home to skilled shipwrights and the latest in shipbuilding technology.' },
      { name: 'Colossus Viewpoint', description: 'A breathtaking viewpoint offering stunning views of the Colossus of Rhodes.' },
    ],
  },
  {
    name: 'Syracuse',
    goods: { Pottery: 5, Wheat: 6, 'Olive Oil': 8, Food: 2, Water: 1 },
    prices: { Pottery: 5, Wheat: 6, 'Olive Oil': 8, Food: 2, Water: 1 },
    npcs: ['Dionysius the Guard'],
    uniqueLocations: [
      { name: 'Fortress', description: 'A mighty fortress overlooking the city of Syracuse, offering a glimpse into its military might.' },
      { name: 'Dock', description: 'The docks of Syracuse, a hive of activity where ships come and go.' },
    ],
  },
  {
    name: 'Knossos',
    goods: { 'Olive Oil': 10, Wine: 7, Spices: 16, Food: 2, Water: 1 },
    prices: { 'Olive Oil': 10, Wine: 7, Spices: 16, Food: 2, Water: 1 },
    npcs: ['Minos the Captain'],
    uniqueLocations: [
      { name: 'Palace', description: 'The magnificent Palace of Knossos, a testament to Minoan civilization and power.' },
      { name: 'Marketplace', description: 'The sprawling marketplace of Knossos, where traders from across Crete gather.' },
    ],
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
    if (player.name) { 
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

  if (buyOrSell === 'buy') {
    const goodToTrade = await select({
      message: 'What good would you like to buy?',
      options: Object.keys(port.goods).map((good) => ({ value: good, label: good })),
    });
    const amount = await text({
      message: `How much ${goodToTrade} do you want to buy?`,
      validate: (value) => isNaN(value) || value <= 0 ? 'Please enter a valid amount.' : undefined,
    });
    const cost = port.prices[goodToTrade] * amount;
    if (player.drachmas >= cost) {
      player.drachmas -= cost;
      player.inventory[goodToTrade] = (player.inventory[goodToTrade] || 0) + parseInt(amount);
      outro(`You bought ${amount} ${goodToTrade} for ${cost} drachmas.`);
    } else {
      outro(chalk.red('You do not have enough drachmas.'));
    }
  } else { 
    const goodToTrade = await select({
      message: 'What good would you like to sell?',
      options: Object.keys(player.inventory).map((good) => ({ value: good, label: good })),
    });
    const amount = await text({
      message: `How much ${goodToTrade} do you want to sell?`,
      validate: (value) => isNaN(value) || value <= 0 ? 'Please enter a valid amount.' : undefined,
    });
    if (player.inventory[goodToTrade] >= amount) {
      const cost = port.prices[goodToTrade] * amount;
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
    console.log(`${index + 1}. ${location.name}: ${location.description}`);
  });

  await text({ message: 'Press enter to return to the main menu.' });
}

//widely inaccurate, DISTANCES NEED REWORK AND SWITCH TO COORDINATE PLANE SYSTEM
const distanceMatrix = {
  Athens: { Carthage: 15, Alexandria: 11, Tyre: 9, Rhodes: 13, Syracuse: 18, Knossos: 7 },
  Carthage: { Athens: 15, Alexandria: 16, Tyre: 6, Rhodes: 18, Syracuse: 9, Knossos: 22 },
  Alexandria: { Athens: 11, Carthage: 16, Tyre: 11, Rhodes: 15, Syracuse: 21, Knossos: 18 },
  Tyre: { Athens: 9, Carthage: 6, Alexandria: 11, Rhodes: 7, Syracuse: 13, Knossos: 16 },
  Rhodes: { Athens: 13, Carthage: 18, Alexandria: 15, Tyre: 7, Syracuse: 16, Knossos: 21 },
  Syracuse: { Athens: 18, Carthage: 9, Alexandria: 21, Tyre: 13, Rhodes: 16, Knossos: 26 },
  Knossos: { Athens: 7, Carthage: 22, Alexandria: 18, Tyre: 16, Rhodes: 21, Syracuse: 26 },
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

  handleStarvation(); 
}

//fix this horrendous nesting later 
function handleStarvation() {
  const baseMutinyChance = 0.5; // Base chance of mutiny
  const mutinyChance = Math.max(0, baseMutinyChance - (0.1 * (player.piety || 0))); // Reduce mutiny chance with piety

  if (player.supplies.food <= 0 || player.supplies.water <= 0) {
    const starvationEvents = [
      `Your crew mutinies due to starvation! (Chance: ${mutinyChance.toFixed(2)})`,
      'Half your crew dies from starvation...',
      'Your crew is too weak to sail further, but you drift ashore...',
    ];
    const event = starvationEvents[Math.floor(Math.random() * starvationEvents.length)];

    //Mutiny Chance
    if (event.includes('mutinies') && Math.random() < mutinyChance) {
      player.crew = 0;
      console.log(chalk.red("You have been overthrown! You are now standed at sea."));
      process.exit();
    } else if (event.includes('Half your crew dies')) {
      player.crew = Math.max(0, Math.floor(player.crew / 2));
    } else if (event.includes('drift ashore')) {
      console.log(chalk.yellow("You've drifted ashore, weak and depleted. Your journey continues, but you've lost some time and goods."));
      player.drachmas -= 20;
      player.crew -= 2;
    } else {
      console.log(chalk.red("Game Over"));
      process.exit();
    }
  }
}

function handleRandomEvents() {
  const eventChance = Math.random();

  if (eventChance < 0.3 - (0.2 * (player.piety || 0))) { // Incorporate piety for reduced chance
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
  if (player.supplies.food > 0) {
    player.supplies.food--; // Consume one food unit when praying
    player.piety = (player.piety || 0) + 1;
    const pietyLevel = player.piety;
    const luckModifier = 0.2 * pietyLevel;

    const reducedEventChance = Math.max(0, 0.3 - luckModifier);

    outro(
      chalk.blue(
        `You sacrificed food to the gods. They smile upon you.`
      )
    );
  } else {
    outro(chalk.red('You have nothing to offer to the gods.'));
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
import { intro, outro, select, text, spinner, multiselect } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs';
import { stdin } from 'process';
import { exit } from 'process';

// Game State aka PORT DATA
let ports = [
  {
    name: 'Athens',
    goods: { Wheat: 10, 'Olive Oil': 10, Wine: 8, Pottery: 6, Food: 2, Water: 1 },
    prices: { Wheat: 10, 'Olive Oil': 10, Wine: 8, Pottery: 6, Food: 2, Water: 1 },
    npcs: [
      {
        name: 'Sophia the Merchant',
        quote:
          '“They share stories of adventures and exploration.',
      },
      {
        name: 'Nikolas the Philosopher',
        quote: '“They share stories of adventures and exploration.',
      },
    ],
    uniqueLocations: [
      {
        name: 'Agora',
        description:
          'The bustling marketplace of Athens, the heart of Athenian trade and commerce.',
      },
      {
        name: 'Temple of Athena',
        description:
          'The magnificent Temple of Athena, where offerings are made and fortunes can be told.',
      },
    ],
    investors: [
      { name: 'Damon the Wise', loanAmount: 50, interestRate: 0.1 },
      { name: 'Kleitos the Bold', loanAmount: 100, interestRate: 0.15 },
    ],
  },
  {
    name: 'Carthage',
    goods: { Spices: 15, Textiles: 12, Metals: 20, Food: 2, Water: 1 },
    prices: { Spices: 15, Textiles: 12, Metals: 20, Food: 2, Water: 1 },
    npcs: ['Hanno the Navigator'],
    uniqueLocations: [
      {
        name: 'Bazaar',
        description:
          'A vibrant marketplace filled with exotic goods from across the Mediterranean.',
      },
      {
        name: 'Harbor',
        description: 'The bustling harbor of Carthage, where ships arrive and depart daily.',
      },
    ],
    investors: [
      { name: 'Hamilcar Barca', loanAmount: 75, interestRate: 0.12 },
      { name: 'Magon Barca', loanAmount: 150, interestRate: 0.18 },
    ],
  },
  {
    name: 'Alexandria',
    goods: { Wheat: 7, 'Olive Oil': 9, Spices: 18, Food: 2, Water: 1 },
    prices: { Wheat: 7, 'Olive Oil': 9, Spices: 18, Food: 2, Water: 1 },
    npcs: ['Cleon the Scholar'],
    uniqueLocations: [
      {
        name: 'Library',
        description: 'The legendary Library of Alexandria, where knowledge is power.',
      },
      {
        name: 'Lighthouse',
        description: 'The towering Lighthouse of Alexandria, guiding ships safely to port.',
      },
    ],
    investors: [
      { name: 'Sostratus of Cnidos', loanAmount: 100, interestRate: 0.15 },
      { name: 'Philo', loanAmount: 200, interestRate: 0.20 },
    ],
  },
  {
    name: 'Tyre',
    goods: { Textiles: 14, Pottery: 6, Wine: 10, Food: 2, Water: 1 },
    prices: { Textiles: 14, Pottery: 6, Wine: 10, Food: 2, Water: 1 },
    npcs: ['Phoenicia the Trader'],
    uniqueLocations: [
      {
        name: 'Dye Works',
        description:
          'The vibrant dye works of Tyre, producing the finest purple dye in the known world.',
      },
      {
        name: 'Market Square',
        description: 'A large open-air market filled with the sounds and smells of Tyre.',
      },
    ],
    investors: [
      { name: "Ethbaal II", loanAmount: 80, interestRate: 0.13 },
      { name: "Pygmalion", loanAmount: 120, interestRate: 0.17 },
    ],
  },
  {
    name: 'Rhodes',
    goods: { Metals: 17, 'Olive Oil': 11, Wine: 9, Food: 2, Water: 1 },
    prices: { Metals: 17, 'Olive Oil': 11, Wine: 9, Food: 2, Water: 1 },
    npcs: ['Artemis the Shipwright'],
    uniqueLocations: [
      {
        name: 'Shipyard',
        description:
          'The busy shipyard of Rhodes, home to skilled shipwrights and the latest in shipbuilding technology.',
      },
      {
        name: 'Colossus Viewpoint',
        description: 'A breathtaking viewpoint offering stunning views of the Colossus of Rhodes.',
      },
    ],
    investors: [
      { name: "Dorieus", loanAmount: 90, interestRate: 0.14 },
      { name: "Diagoras", loanAmount: 180, interestRate: 0.19 },
    ],
  },
  {
    name: 'Syracuse',
    goods: { Pottery: 5, Wheat: 6, 'Olive Oil': 8, Food: 2, Water: 1 },
    prices: { Pottery: 5, Wheat: 6, 'Olive Oil': 8, Food: 2, Water: 1 },
    npcs: ['Dionysius the Guard'],
    uniqueLocations: [
      {
        name: 'Fortress',
        description:
          'A mighty fortress overlooking the city of Syracuse, offering a glimpse into its military might.',
      },
      {
        name: 'Dock',
        description: 'The docks of Syracuse, a hive of activity where ships come and go.',
      },
    ],
    investors: [
      { name: "Gelon", loanAmount: 60, interestRate: 0.10 },
      { name: "Hieron I", loanAmount: 110, interestRate: 0.16 },
    ],
  },
  {
    name: 'Knossos',
    goods: { 'Olive Oil': 10, Wine: 7, Spices: 16, Food: 2, Water: 1 },
    prices: { 'Olive Oil': 10, Wine: 7, Spices: 16, Food: 2, Water: 1 },
    npcs: ['Minos the Captain'],
    uniqueLocations: [
      {
        name: 'Palace',
        description:
          'The magnificent Palace of Knossos, a testament to Minoan civilization and power.',
      },
      {
        name: 'Marketplace',
        description:
          'The sprawling marketplace of Knossos, where traders from across Crete gather.',
      },
    ],
    investors: [
      { name: "Minos", loanAmount: 70, interestRate: 0.11 },
      { name: "Pasiphae", loanAmount: 130, interestRate: 0.16 },
    ],
  },
];

//starting player components; add lore later
const player = {
  name: 'Leonidas the Steadfast', 
  backstory: `   Leonidas, son of Damon, a humble fisherman from the shores of Aegina, never dreamt of inheriting a trading fleet.\n   His father, a man of the sea, unexpectedly passed away, leaving Leonidas with three weathered ships, 100 drachmas, and a loyal crew of ten hardened sailors.\n   With a heavy heart but a determined spirit, Leonidas embarks on a journey to honor his father's memory and make his mark on the Aegean trade.\n   The weight of family responsibility now falls on his shoulders, and a successful business is the only way to provide for his family and ensure their survival \n   in these unpredictable times.`,
  drachmas: 100,
  fleet: 3,
  crew: 10,
  inventory: {},
  supplies: { food: 20, water: 20 },
  currentPort: 'Athens',
  piety: 0, 
  metSophia: false, 
  loans: [], 
};

async function meetSophia() {
  if (player.currentPort === 'Athens' && !player.metSophia) {
    console.log(
      chalk.cyan(
        '\n   As you step onto the Athenian Agora, a woman with sharp eyes and shrewd demeanor approaches you.'
      )
    );
    console.log(chalk.cyan('   It is Sophia, a renowned merchant.'));
    await delay(1000);

    console.log(
      chalk.magenta(
        '   "Welcome, Leonidas," she says, her voice low and steady. "I am Sophia, and I have watched your family for years. Your father, Damon, was a man of the sea, and \n   I know you will make your mark on trade.  But the Aegean is not kind to the unprepared. Allow me to assist." '
      )
    );
    await delay(2000);

    console.log(chalk.magenta('   "First, you can trade goods.  Visit the marketplace to buy or sell to other merchants and accumulate wealth."\n'));
    await delay(2000);

    console.log(chalk.magenta('   "Next, use your fleet to travel to other ports, but keep track of your supplies." \n'));
    await delay(2000);

    console.log(chalk.magenta('   "You can also explore unique locations in each port to learn about the region."\n'));
    await delay(2000);

    console.log(chalk.magenta('   "Remember, the Gods can be fickle. You can pray, but make sure to offer them gifts!"\n'));
    await delay(2000);
    player.metSophia = true;
    saveGame();

  }
}

const seasons = {
  spring: { multiplier: 0.75 }, 
  summer: { multiplier: 0.9 }, 
  autumn: { multiplier: 1.0 }, 
  winter: { multiplier: 1.5 }, 
};

function changeSeason() {
  const seasonOrder = ['spring', 'summer', 'autumn', 'winter'];
  const currentIndex = seasonOrder.indexOf(currentSeason);
  const nextIndex = (currentIndex + 1) % seasonOrder.length;
  currentSeason = seasonOrder[nextIndex];
  console.log(`The season has changed to ${currentSeason}.`);
}


let currentSeason = 'autumn';

function getSeasonalMultiplier(good) {
  const agriculturalGoods = ['Wheat', 'Food']; 
  return agriculturalGoods.includes(good) ? seasons[currentSeason].multiplier : 1;
}

function updateSeasonalPrices() {
  for (const port of ports) {
    for (const good in port.goods) {
      port.prices[good] = Math.round(port.goods[good] * getSeasonalMultiplier(good));
    }
  }
}

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

function displaySeason() {
  console.log(chalk.yellow(`\nThe season is now: ${currentSeason}\n`));
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
  await displayBackstory(player.backstory); 
  await meetSophia();
  await mainMenu();
}

async function displayBackstory(backstory) {
  const lines = backstory.split('\n'); 
  for (const line of lines) {
    const words = line.split(' ');
    for (const word of words) {
      process.stdout.write(`${word} `);
      await delay(50); 
    }
    console.log(''); 
  }
  console.log(''); 
  await delay(1000); 
}

//extremely unstable switchcase, port to better logic later
async function mainMenu() {
  updateSeasonalPrices();
  displaySeason();
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
      { value: 'borrow', label: 'Borrow Money' }, // Added borrow option
    ],
    required: true,
  });

  for (const act of action) {
    try {
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
          case 'manage':
            await manageCrew();
            break;
          case 'inventory':
            await checkInventory();
            break;
          case 'pray':
            await prayToGods();
            break;
          case 'borrow':
            await borrowMoney();
            break;
          case 'save':
            saveGame();
            break;
        }
    } catch (error) {
        if (error.message.includes('aborted')) {
            outro(chalk.yellow("Game exited."));
            exit();
        } else {
            console.error(chalk.red("An unexpected error occurred:", error));
            exit(); 
        }
    }
  }
  await mainMenu();
}

async function tradeGoods() {
  updateSeasonalPrices();
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
      options: Object.keys(port.goods)
        .filter((good) => good !== 'Wheat' || player.currentPort !== 'Athens') 
        .map((good) => ({ value: good, label: good })),
    });

    if (goodToTrade) { 
      const amount = await text({
        message: `How much ${goodToTrade} do you want to buy?`,
        validate: (value) =>
          isNaN(value) || value <= 0 ? 'Please enter a valid amount.' : undefined,
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
      outro(chalk.red('You cannot buy anything here.'));
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
    console.log(`${index + 1}. ${npc.name}`);
  });

  const npcChoice = await text({
    message: 'Who would you like to talk to? (type the number or "back" to return)',
  });

  if (npcChoice === 'back') {
    return;
  }

  const npcIndex = parseInt(npcChoice) - 1;

  if (npcIndex >= 0 && npcIndex < port.npcs.length) {
    console.log(chalk.magenta(`You talk to ${port.npcs[npcIndex].name}.`));
    console.log(chalk.magenta(`${port.npcs[npcIndex].quote}`)); 
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

async function borrowMoney() {
  const port = ports.find((p) => p.name === player.currentPort);
  if (port && port.investors && port.investors.length > 0) {
    port.investors.forEach((investor, index) => {
      console.log(
        `${index + 1}. ${investor.name} offers a loan of ${investor.loanAmount} drachmas with ${Math.floor(
          investor.interestRate * 100
        )}% interest.`
      );
    });

    const investorChoice = await text({
      message: 'Which investor would you like to borrow from? (Enter number or "back"):',
    });

    if (investorChoice !== 'back') {
      const investorIndex = parseInt(investorChoice) - 1;
      if (investorIndex >= 0 && investorIndex < port.investors.length) {
        const investor = port.investors[investorIndex];
        player.drachmas += investor.loanAmount;
        player.loans.push({
          investor: investor.name,
          amount: investor.loanAmount,
          interestRate: investor.interestRate,
        });
        console.log(`You received a loan of ${investor.loanAmount} drachmas from ${investor.name}.`);
      } else {
        console.log(chalk.red('Invalid investor choice.'));
      }
    }
  } else {
    console.log(chalk.red('No investors available at this port.'));
  }
  await text({ message: 'Press Enter to continue' });
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
    handleLoans();
    travelSpinner.stop(chalk.green(`You have arrived at ${destination}.`));

  handleStarvation(); 
  displaySeason();
}

//fix this horrendous nesting later 
function handleStarvation() {
  const baseMutinyChance = 0.5; 
  const mutinyChance = Math.max(0, baseMutinyChance - (0.1 * (player.piety || 0))); 

  if (player.supplies.food <= 0 || player.supplies.water <= 0) {
    const starvationEvents = [
      `Your crew mutinies due to starvation! (Chance: ${mutinyChance.toFixed(2)})`,
      'Half your crew dies from starvation...',
      'Your crew is too weak to sail further, but you drift ashore...',
    ];
    const event = starvationEvents[Math.floor(Math.random() * starvationEvents.length)];

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
  const baseEventChance = 0.3;
  const pietyModifier = 0.2 * (player.piety || 0);
  const modifiedEventChance = Math.max(0, baseEventChance - pietyModifier); 

  if (eventChance < modifiedEventChance) {
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
    player.supplies.food--; 
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

function handleLoans() {
  if (player.loans && player.loans.length > 0) {
    for (let i = 0; i < player.loans.length; i++) {
      const loan = player.loans[i];
      const interest = loan.amount * loan.interestRate;
      const totalOwed = loan.amount + interest;

      if (player.drachmas >= totalOwed) {
        player.drachmas -= totalOwed;
        player.loans.splice(i, 1);
        console.log(`You paid back ${totalOwed} drachmas to ${loan.investor}.`);
        i--;
      } else {
        if (player.fleet > 1) {
          console.log(
            chalk.red(`You did not pay back loan from ${loan.investor}! You lost a ship!`)
          );
          player.fleet--;
          player.loans.splice(i, 1);
          i--;
          console.log(`You now have ${player.fleet} ships left.`);
        } else {
          console.log(
            chalk.red(
              `You did not pay back loan from ${loan.investor}! All your ships have been seized! Game Over.`
            )
          );
          process.exit();
        }
      }
    }
  }
}

changeSeason();

startGame();
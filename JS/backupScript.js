window.onload = function () {
  const message = document.getElementById("message");
  const itemsList = document.getElementById("itemsList");
  const mineButton = document.getElementById("mineButton");
  const upgradePickaxeButton = document.getElementById("upgradePickaxe");
  const autoMineButton = document.getElementById("autoMineButton");
  const tntPowerup = document.getElementById("tntPowerup");
  const mineralImage = document.getElementById("mineralImage");
  const upgradeAutoMineButton = document.getElementById("upgradeAutoMineButton");

  let currentClicks = 0;
  let maxClicks = 5;
  let mineralsMined = 0;
  let nextTNTTrigger = getRandomInt(10, 100);
  let inventory = {};
  let autoMineUnlocked = false;
  let autoMineInterval = null;
  let autoMineSpeed = 1000; //automine speed for when you first buy it
  let autoMineLevel = 1;
  let autoMineMaxLevel = 5;

  //images for the ores
  const minerals = [
      { name: "Stone", img: "../Images/ores/stone.png", rarity: "1/3" },
      { name: "Coal", img: "../Images/ores/coal.png", rarity: "1/4.5" },
      { name: "Iron", img: "../Images/ores/iron.png", rarity: "1/10" },
      { name: "Gold", img: "../Images/ores/gold.png", rarity: "1/20" },
      { name: "Diamond", img: "../Images/ores/diamond.png", rarity: "1/100" },
      { name: "Ruby", img: "../Images/ores/ruby.png", rarity: "1/250" },
      { name: "Sapphire", img: "../Images/ores/sapphire.png", rarity: "1/250" },
      { name: "Viridian", img: "../Images/ores/viridian.png", rarity: "1/500" },
      { name: "Amethyst", img: "../Images/ores/amethyst.png", rarity: "1/750" },
      { name: "Firesteel", img: "../Images/ores/firesteel.png", rarity: "1/2500" },
      { name: "Dragonsteel", img: "../Images/ores/dragonsteel.png", rarity: "1/10000" }
    ];
    
  //pickaxe luck
  const PICKAXE_LUCK_MULTIPLIER = {
    "Wood": 1.0,
    "Stone": 1.5,
    "Iron": 2.0,
    "Diamond": 3.0,
    "Viridian": 5.0,
    "FireIce": 10.0,
    "Draconic": 20.0
  };

  //automine upgrade costs
  const autoMineUpgradeCosts = [
    { Iron: 25, Gold: 10 },  // Tier 1 Automine
    { Iron: 35, Gold: 20, Diamond: 5 },  // Tier 2 Automine
    { Iron: 50, Gold: 30, Diamond: 10, Sapphire: 1, Ruby: 1 },  // Tier 3 Automine
    { Iron: 70, Gold: 45, Diamond: 20, Sapphire: 5, Ruby: 5, Viridian: 1 },  // Tier 4 Automine
    { Iron: 100, Gold: 60, Diamond: 50, Sapphire: 15, Ruby: 15, Viridian: 7, Amethyst: 5 }  // Tier 5 Automine
  ];    

  function updateLuckDisplay() {
      const pickaxe = window.pickaxeSystem.getCurrentPickaxe();
      const luckMultiplier = PICKAXE_LUCK_MULTIPLIER[pickaxe] || 1;
      const luckDisplay = document.getElementById("luckDisplay");
    
      //calculate the average base and boosted chances
      const relevantMinerals = minerals.filter(m => m.name !== "Stone");
    
      let totalBaseChance = 0;
      let totalBoostedChance = 0;
    
      for (const mineral of relevantMinerals) {
        const [num, denom] = mineral.rarity.split("/").map(Number);
        const baseChance = num / denom;
        const boostedChance = Math.min(1, baseChance * luckMultiplier);
        totalBaseChance += baseChance;
        totalBoostedChance += boostedChance;
        window.updateLuckDisplay = updateLuckDisplay;
      }
    
      const avgBase = totalBaseChance / relevantMinerals.length;
      const avgBoosted = totalBoostedChance / relevantMinerals.length;
    
      const multiplier = (avgBoosted / avgBase).toFixed(2);
    
      if (luckDisplay) {
          luckDisplay.textContent = `Luck Multiplier: ${luckMultiplier.toFixed(2)}x (${pickaxe} Pickaxe)`;
      }
    }       

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  } 

  //pickaxe progression
  function getNextPickaxe(current) {
    switch (current) {
      case "Wood": return "Stone";
      case "Stone": return "Iron";
      case "Iron": return "Diamond";
      case "Diamond": return "Viridian";
      case "Viridian": return "FireIce";
      case "FireIce": return "Draconic";
      default: return null;
    }
  }

  //clicks needed to break a mineral
  function getClicksRequired() {
    switch (window.pickaxeSystem.getCurrentPickaxe()) {
      case "Wood": return 5;
      case "Stone": return 3;
      case "Iron": return 2;
      case "Diamond": return 1;
      case "Viridian": return 0;
      case "FireIce": return 0;
      case "Draconic": return 0;
      default: return 5;
    }
  }

  //updates your inventory for when you get the ores
  function updateInventory() {
    itemsList.innerHTML = "";
  
    // Map mineral names to their numeric rarity (lower means more common)
    const rarityMap = {};
    for (const mineral of minerals) {
      const [num, denom] = mineral.rarity.split("/").map(Number);
      rarityMap[mineral.name] = num / denom;
    }
  
    // Sort inventory by rarity (descending = rarest first)
    const sortedInventory = Object.entries(inventory).sort((a, b) => {
      return rarityMap[a[0]] - rarityMap[b[0]]; // ascending rarity (common to rare)
    });
  
    for (let [mineralName, count] of sortedInventory) {
      const mineral = minerals.find(m => m.name === mineralName);
      if (mineral) {
        const li = document.createElement("li");
        li.innerHTML = `<img src="${mineral.img}" alt="${mineral.name}" class="icon"> ${mineral.name}: ${count}`;
        itemsList.appendChild(li);
      }
    }
  }    

  //shows how much minerals you have mined
  function updateMineralsMinedCounter() {
      const counter = document.getElementById("mineralsMinedCounter");
      if (counter) {
        counter.textContent = `Total Minerals Mined: ${mineralsMined}`;
      }
    }      

    //upgrades pickaxes
  function updateUpgradeButton() {
    const next = getNextPickaxe(window.pickaxeSystem.getCurrentPickaxe());

    if (!next) {
      upgradePickaxeButton.textContent = "Max Pickaxe Reached";
      upgradePickaxeButton.disabled = true;
      return;
    }

    const needed = window.UPGRADE_REQUIREMENTS[next];
    const requirementText = Object.entries(needed)
      .map(([mineral, amount]) => `${mineral}: ${amount}`)
      .join(", ");

    upgradePickaxeButton.textContent = `Upgrade to ${next} Pickaxe (${requirementText})`;
    upgradePickaxeButton.disabled = false;
  }

  window.updatePickaxeDropdown?.();
  window.updatePickaxeStatus();

  const pickaxePreview = document.getElementById("pickaxePreview");
  
  //pickaxe images
  const pickaxeImages = {
    "Wood": "../Images/pickaxes/woodPickaxe.png",
    "Stone": "../Images/pickaxes/stonePickaxe.png",
    "Iron": "../Images/pickaxes/ironPickaxe.png",
    "Diamond": "../Images/pickaxes/diamondPickaxe.png",
    "Viridian": "../Images/pickaxes/viridianPickaxe.png",
    "FireIce": "../Images/pickaxes/fireIcePickaxe.png",
    "Draconic": "../Images/pickaxes/draconicPickaxe.png"
  };

  document.querySelectorAll("#pickaxeMenu li").forEach(li => {
    const type = li.getAttribute("data-pickaxe");

    //The pickaxe hovering menu
    li.addEventListener("mouseover", (e) => {
      if (pickaxeImages[type]) {
        pickaxePreview.src = pickaxeImages[type];
        pickaxePreview.style.display = "block";
      }
    });

    li.addEventListener("mousemove", (e) => {
      pickaxePreview.style.left = (e.pageX + 15) + "px";
      pickaxePreview.style.top = (e.pageY + 15) + "px";
    });

    li.addEventListener("mouseout", () => {
      pickaxePreview.style.display = "none";
    });
  });

  //shows the TNT powerup and puts it on the screen
  function showTntPowerup() {
    const safeMargin = 100;
    const randX = getRandomInt(safeMargin, window.innerWidth - safeMargin);
    const randY = getRandomInt(safeMargin, window.innerHeight - safeMargin);

    tntPowerup.style.left = `${randX}px`;
    tntPowerup.style.top = `${randY}px`;
    tntPowerup.style.display = "block";

    setTimeout(() => {
      tntPowerup.style.display = "none";
    }, 10000);
  }

  function getEffectiveChance(mineral) {
      let [numerator, denominator] = mineral.rarity.split("/").map(Number);
      let baseChance = numerator / denominator;
      const pickaxe = window.pickaxeSystem.getCurrentPickaxe();
  
      if (mineral.name === "Stone" && ["Diamond", "Viridian", "FireIce", "Draconic"].includes(pickaxe)) {
          baseChance = 1 / 10;
      }
  
      const luckMultiplier = PICKAXE_LUCK_MULTIPLIER[pickaxe] || 1;
      const boosted = mineral.name === "Stone" ? baseChance : Math.min(1, baseChance * luckMultiplier);
      const inverse = 1 / boosted;
      const rounded = Math.round(inverse);
  
      return `1/${rounded}`;
  }    
  
  function getOreProbability(rarity, mineralName) {
      let [numerator, denominator] = rarity.split("/").map(Number);
      let baseChance = numerator / denominator;
  
      const pickaxe = window.pickaxeSystem.getCurrentPickaxe();
      const luckMultiplier = PICKAXE_LUCK_MULTIPLIER[pickaxe] || 1;
  
      // Modify Stone rarity to 1/10 if pickaxe is Diamond or better
      if (mineralName === "Stone" && ["Diamond", "Viridian", "FireIce", "Draconic"].includes(pickaxe)) {
          baseChance = 1 / 10;
      }
  
      // Apply nerfing to basic minerals
      const nerfFactors = {
          "Stone": {
              "Iron": 0.75,
              "Diamond": 0.5,
              "Viridian": 0.25,
              "FireIce": 0.1,
              "Draconic": 0.05
          },
          "Coal": {
              "Iron": 0.9,
              "Diamond": 0.7,
              "Viridian": 0.5,
              "FireIce": 0.3,
              "Draconic": 0.1
          },
          "Iron": {
              "Diamond": 0.8,
              "Viridian": 0.6,
              "FireIce": 0.4,
              "Draconic": 0.2
          },
          "Gold": {
              "Viridian": 0.7,
              "FireIce": 0.4,
              "Draconic": 0.2
          }
      };
  
      if (nerfFactors[mineralName] && nerfFactors[mineralName][pickaxe]) {
          baseChance *= nerfFactors[mineralName][pickaxe];
      } else if (mineralName !== "Stone") {
          baseChance = Math.min(1, baseChance * luckMultiplier);
      }
  
      return Math.random() < baseChance;
  }    
   
    
    //THE MAIN MINE FUNCTION. THIS SCRIPT IS THE THING THAT MAKES THE GAME MINE
    function mine() {
      if (!window.currentMineral) {
          let chosenMineral = null;
          for (let mineral of minerals) {
              if (getOreProbability(mineral.rarity, mineral.name)) {
                  chosenMineral = mineral;
                  break;
              }
          }
      
          if (!chosenMineral) {
              console.warn("No mineral selected, defaulting to Coal.");
              chosenMineral = minerals[0];
          }
      
          window.currentMineral = chosenMineral;
          currentClicks = 0;
          maxClicks = getClicksRequired();
      
          mineralImage.src = window.currentMineral.img;
          mineralImage.alt = window.currentMineral.name;
          mineralImage.style.display = "block";
      
          const effectiveChance = getEffectiveChance(window.currentMineral);
          const remaining = maxClicks - currentClicks;
          message.innerHTML = `Breaking ${window.currentMineral.name}... (${remaining} hits left)<br><span style="color:gray;">(Chance: ${effectiveChance})</span>`;
          return;
      }
      
  
      currentClicks++;
      const remaining = maxClicks - currentClicks;
  
      //this script calculates the odds in fractions and puts it below for when you mine
      if (remaining > 0) {
          // Get the 1/x formatted chance for remaining hits
          const effectiveChance = getEffectiveChance(window.currentMineral);
          message.innerHTML = `Breaking ${window.currentMineral.name}... (${remaining} hits left)<br><span style="color:gray;">(Chance: ${effectiveChance})</span>`;
      } else {
          inventory[window.currentMineral.name] = (inventory[window.currentMineral.name] || 0) + 1;
          mineralsMined++;
          updateMineralsMinedCounter();

          const effectiveChance = getEffectiveChance(window.currentMineral);
          message.innerHTML = `You collected ${window.currentMineral.name}!<br><span style="color:gray;">(Chance: ${effectiveChance})</span>`;        
          updateInventory();
          window.currentMineral = null;
      }
  }    

  //TNT powerup minigame thing
  tntPowerup.addEventListener("click", () => {
    tntPowerup.style.display = "none";
    let bonusCollected = "";
    for (let i = 0; i < 10; i++) {
      let selected = null;
      for (let attempt = 0; attempt < 100; attempt++) {
        const candidate = minerals[Math.floor(Math.random() * minerals.length)];
        if (getOreProbability(candidate.rarity, candidate.name)) {
          selected = candidate;
          break;
        }
      }
      selected = selected || minerals.find(m => m.name === "Coal");
      inventory[selected.name] = (inventory[selected.name] || 0) + 1;
      bonusCollected += `${selected.name}, `;
    }
    message.innerHTML = `💥 TNT Bonus! You collected: ${bonusCollected}`;
    updateInventory();
  });

  mineButton.addEventListener("click", mine);

  autoMineButton.addEventListener("click", () => {
    if (autoMineLevel > autoMineMaxLevel) {
      message.innerHTML = "Auto-Mine is already at max level!";
      return;
    }
  
    const cost = autoMineUpgradeCosts[autoMineLevel - 1];
    const canAfford = Object.entries(cost).every(([item, amt]) => (inventory[item] || 0) >= amt);
  
    if (!canAfford) {
      const costText = Object.entries(cost).map(([item, amt]) => `${item}: ${amt}`).join(", ");
      message.innerHTML = `❌ Not enough resources! Need: ${costText}`;
      return;
    }
  
    // Deduct resources
    for (let [item, amt] of Object.entries(cost)) {
      inventory[item] -= amt;
    }
  
    // Upgrade logic
    if (!autoMineUnlocked) {
      autoMineUnlocked = true;
      autoMineInterval = setInterval(mine, autoMineSpeed);
      message.innerHTML = `Auto-Mine Tier 1 Unlocked!`;
    } else {
      autoMineSpeed = Math.max(50, autoMineSpeed - 210); // Faster each tier
      clearInterval(autoMineInterval);
      autoMineInterval = setInterval(mine, autoMineSpeed);
      message.innerHTML = `Auto-Mine Upgraded to Tier ${autoMineLevel}!`;
    }
  
    autoMineLevel++;
    updateInventory();
    updateAutoMineButton();
  });

  function updateAutoMineButton() {
    if (autoMineLevel > autoMineMaxLevel) {
      autoMineButton.textContent = "Auto-Mine Maxed Out";
      autoMineButton.disabled = true;
      return;
    }
  
    const cost = autoMineUpgradeCosts[autoMineLevel - 1];
    const costText = Object.entries(cost).map(([item, amt]) => `${item}: ${amt}`).join(", ");
    autoMineButton.textContent = autoMineUnlocked
      ? `Upgrade Auto-Mine (Tier ${autoMineLevel}) – ${costText}`
      : `Unlock Auto-Mine (${costText})`;
  }
  

  //Upgrade pickaxe thingy
  upgradePickaxeButton.addEventListener("click", () => {
    const current = window.pickaxeSystem.getCurrentPickaxe();
    const next = getNextPickaxe(current);

    if (!next) {
      message.innerHTML = "You already have the best pickaxe!";
      return;
    }

    const needed = window.UPGRADE_REQUIREMENTS[next];
    const hasAll = Object.entries(needed).every(([item, amt]) => (inventory[item] || 0) >= amt);

    if (hasAll) {
      for (let [item, amt] of Object.entries(needed)) {
        inventory[item] -= amt;
      }

      window.pickaxeSystem.upgradePickaxe();
      
      message.innerHTML = `Pickaxe upgraded to ${next}!`;
      updateUpgradeButton();
      updateInventory();
      updateLuckDisplay();
    } else {
      message.innerHTML = `Not enough resources to upgrade to ${next}!`;
    }
  });

  // Cheats
  window.giveOre = function (name, amount) {
    inventory[name] = (inventory[name] || 0) + amount;
    updateInventory();
    console.log(`Gave ${amount} ${name}`);
  };

  window.breakMineralInstantly = function () {
    if (window.currentMineral) {
      message.innerHTML = `Instantly mined: <img src="${window.currentMineral.img}" alt="${window.currentMineral.name}" class="icon"> ${window.currentMineral.name}`;
      inventory[window.currentMineral.name] = (inventory[window.currentMineral.name] || 0) + 1;
      updateInventory();
      window.currentMineral = null;
    }
  };

  window.spawnOre = function (name) {
    const mineral = minerals.find(m => m.name === name);
    if (!mineral) {
      console.warn(`❌ Invalid mineral name: "${name}"`);
      return;
    }

    window.currentMineral = mineral;
    currentClicks = 0;
    maxClicks = getClicksRequired();

    mineralImage.src = mineral.img;
    mineralImage.alt = mineral.name;
    mineralImage.style.display = "block";
    message.innerHTML = `You found ${window.currentMineral.name}!<br>Click to break it (${maxClicks} hits)`;

    console.log(`🪨 Spawned ${mineral.name} for mining`);
  };

  function startGame() {
    message.textContent = "Click the 'Mine!' button to start mining.";
    updateUpgradeButton();
    updateInventory();
    updateAutoMineButton();
    window.updatePickaxeStatus = updatePickaxeStatus;
    window.updatePickaxeStatus?.();
    updateLuckDisplay();
  }

  startGame();
};

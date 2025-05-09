//the first pickaxe you get
window.pickaxeSystem = {
    currentPickaxe: "Wood",
  
    getCurrentPickaxe() {
      return this.currentPickaxe;
    },
  
    //upgrades your pickaxe
    upgradePickaxe() {
      if (this.currentPickaxe === "Wood") this.currentPickaxe = "Stone";
      else if (this.currentPickaxe === "Stone") this.currentPickaxe = "Iron";
      else if (this.currentPickaxe === "Iron") this.currentPickaxe = "Diamond";
      else if (this.currentPickaxe === "Diamond") this.currentPickaxe = "Viridian";
      else if (this.currentPickaxe === "Viridian") this.currentPickaxe = "FireIce";
      else if (this.currentPickaxe === "FireIce") this.currentPickaxe = "Draconic";
    }
  };
  
  //the amount of minerals you need to buy for each pickaxe
  window.UPGRADE_REQUIREMENTS = {
    "Stone": { Coal: 7, Stone: 30 },
    "Iron": { Iron: 10, Coal: 15, Stone: 60 },
    "Diamond": { Gold: 15, Diamond: 10, Iron: 30, Stone: 100 },
    "Viridian": { Gold: 35, Diamond: 20, Viridian: 5, Stone: 165 },
    "FireIce": { Ruby: 15, Sapphire: 15, Amethyst: 5, Obsidian: 1, Stone: 320 },
    "Draconic": { Ruby: 50, Sapphire: 50, Obsidian: 7, Firesteel: 3, Dragonsteel: 1, Stone: 1000 },
  };
  
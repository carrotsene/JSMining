document.addEventListener("DOMContentLoaded", () => {
  const pickaxeStatus = document.getElementById("pickaxeStatus");
  const pickaxeMenu = document.getElementById("pickaxeMenu");
  const pickaxeMenuMessage = document.getElementById("pickaxeMenuMessage");

  //says that you start with wood and that you have to unlock the rest
  const pickaxeOwnership = {
    Wood: true,
    Stone: false,
    Iron: false,
    Diamond: false,
    Viridian: false,
    FireIce: false,
    Draconic: false
  };

  //updates your pickaxe
  function updatePickaxeStatus() {
    pickaxeStatus.textContent = `Current Pickaxe: ${window.pickaxeSystem.getCurrentPickaxe()}`;
  }

  window.updatePickaxeStatus = updatePickaxeStatus;

  //updates the pickaxe menu to your right, showing the ones that you have unlocked.
  function updatePickaxeMenuVisuals() {
    const listItems = pickaxeMenu.querySelectorAll("li");
    listItems.forEach(li => {
      const type = li.getAttribute("data-pickaxe");
      li.classList.remove("locked", "owned");
      if (pickaxeOwnership[type]) {
        li.classList.add("owned");
      } else {
        li.classList.add("locked");
      }
    });
  }

  //extension of the original upgradePickaxe
  const originalUpgradePickaxe = window.pickaxeSystem.upgradePickaxe;
  window.pickaxeSystem.upgradePickaxe = function () {
    const prev = this.getCurrentPickaxe();
    originalUpgradePickaxe.call(this); //this code upgrades the pickaxe
    const current = this.getCurrentPickaxe();
    if (current !== prev) {
      pickaxeOwnership[current] = true;
      updatePickaxeMenuVisuals();
    }
  };

  pickaxeMenu.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") {
        const selected = e.target.getAttribute("data-pickaxe");
        if (pickaxeOwnership[selected]) {
          window.pickaxeSystem.currentPickaxe = selected;
          updatePickaxeStatus();

          if (pickaxeOwnership[selected]) {
              window.pickaxeSystem.currentPickaxe = selected;
              updatePickaxeStatus();
              window.updateLuckDisplay?.(); //updates the luck text with the corresponding pickaxe
              pickaxeMenuMessage.textContent = `Switched to ${selected} pickaxe.`;
            }              
          pickaxeMenuMessage.textContent = `Switched to ${selected} pickaxe.`;
    

          window.updateLuckDisplay?.();
    
        } else {
          pickaxeMenuMessage.textContent = `You don't own the ${selected} pickaxe yet.`;
        }
      }
    });      

  updatePickaxeMenuVisuals();
  updatePickaxeStatus();
});

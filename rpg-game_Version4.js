// =====================
// Simple Web RPG Game
// =====================

const weapons = [
    { name: "Fists", bonus: 0, cost: 0 },
    { name: "Dagger", bonus: 3, cost: 15 },
    { name: "Sword", bonus: 6, cost: 35 },
    { name: "Great Axe", bonus: 10, cost: 70 }
];

const spells = [
    { name: "Fireball", manaCost: 15, effect: () => fireball() },
    { name: "Heal", manaCost: 12, effect: () => magicHeal() }
];

const player = {
    name: "Hero",
    health: 100,
    maxHealth: 100,
    mana: 30,
    maxMana: 30,
    attack: 12,
    heal: 10,
    xp: 0,
    level: 1,
    xpToNext: 20,
    gold: 20,
    inventory: {
        potion: 2,
        manaPotion: 1
    },
    weapon: weapons[0]
};

const enemyTypes = [
    { name: "Goblin", maxHealth: 50, attack: 8, xp: 10, gold: 7 },
    { name: "Orc", maxHealth: 80, attack: 12, xp: 18, gold: 15 },
    { name: "Slime", maxHealth: 30, attack: 6, xp: 6, gold: 4 },
    { name: "Wolf", maxHealth: 60, attack: 10, xp: 14, gold: 10 },
    { name: "Bandit", maxHealth: 70, attack: 11, xp: 16, gold: 13 }
];

let enemy = {};
let gameOver = false;

const playerStatsDiv = document.getElementById("player-stats");
const enemyStatsDiv = document.getElementById("enemy-stats");
const inventoryDiv = document.getElementById("inventory");
const actionsDiv = document.getElementById("actions");
const shopDiv = document.getElementById("shop");
const logDiv = document.getElementById("log");

function randomEnemy() {
    const template = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    return {
        name: template.name,
        health: template.maxHealth,
        maxHealth: template.maxHealth,
        attack: template.attack,
        xp: template.xp,
        gold: template.gold
    };
}

function updateStats() {
    playerStatsDiv.innerHTML =
        `<strong>${player.name} (Lv.${player.level})</strong> ` +
        `HP: ${player.health}/${player.maxHealth} ` +
        `MP: ${player.mana}/${player.maxMana} ` +
        `| XP: ${player.xp}/${player.xpToNext} ` +
        `| Gold: ${player.gold} ` +
        `| Weapon: ${player.weapon.name} (+${player.weapon.bonus})`;
    if (!gameOver) {
        enemyStatsDiv.innerHTML =
            `<strong>${enemy.name}</strong> HP: ${enemy.health}/${enemy.maxHealth}`;
    } else {
        enemyStatsDiv.innerHTML = "";
    }
    updateInventory();
}

function updateInventory() {
    inventoryDiv.innerHTML =
        `<strong>Inventory:</strong> ` +
        `Potion x${player.inventory.potion} ` +
        `<button onclick="usePotion()" ${player.inventory.potion === 0 || gameOver ? "disabled" : ""}>Use Potion</button> ` +
        `| Mana Potion x${player.inventory.manaPotion} ` +
        `<button onclick="useManaPotion()" ${player.inventory.manaPotion === 0 || gameOver ? "disabled" : ""}>Use Mana Potion</button>`;
}

function logMessage(msg) {
    logDiv.innerHTML += msg + "<br>";
    logDiv.scrollTop = logDiv.scrollHeight;
}

function checkGameOver() {
    if (player.health <= 0) {
        logMessage("<span style='color:red'>You have been defeated!</span>");
        disableActions();
        gameOver = true;
        updateStats();
        showShop();
        return true;
    }
    if (enemy.health <= 0) {
        logMessage(`<span style='color:lime'>You defeated the ${enemy.name}!</span> Gained ${enemy.xp} XP and ${enemy.gold} gold.`);
        player.xp += enemy.xp;
        player.gold += enemy.gold;
        if (Math.random() < 0.3) {
            player.inventory.potion++;
            logMessage("<span style='color:orange'>You found a potion!</span>");
        }
        if (Math.random() < 0.15) {
            player.inventory.manaPotion++;
            logMessage("<span style='color:cyan'>You found a mana potion!</span>");
        }
        levelUpCheck();
        disableActions();
        setTimeout(() => {
            if (!gameOver) {
                nextEnemy();
                showShop();
            }
        }, 1400);
        return true;
    }
    return false;
}

function disableActions() {
    actionsDiv.innerHTML = "";
    updateInventory();
}

function levelUpCheck() {
    while (player.xp >= player.xpToNext) {
        player.xp -= player.xpToNext;
        player.level++;
        player.maxHealth += 20;
        player.maxMana += 8;
        player.attack += 3;
        player.heal += 2;
        player.health = player.maxHealth;
        player.mana = player.maxMana;
        player.xpToNext = Math.floor(player.xpToNext * 1.5);
        logMessage(`<span style='color:aqua'>Level up! You are now level ${player.level}!</span>`);
    }
}

function enemyTurn() {
    if (enemy.health > 0 && !gameOver) {
        const damage = Math.floor(Math.random() * enemy.attack) + 1;
        player.health -= damage;
        if (player.health < 0) player.health = 0;
        logMessage(`${enemy.name} attacks for ${damage} damage!`);
        updateStats();
        checkGameOver();
    }
}

function attack() {
    if (gameOver) return;
    const base = player.attack + player.weapon.bonus;
    const damage = Math.floor(Math.random() * base) + 1;
    enemy.health -= damage;
    if (enemy.health < 0) enemy.health = 0;
    logMessage(`${player.name} attacks with ${player.weapon.name} for ${damage} damage!`);
    updateStats();
    if (!checkGameOver()) {
        setTimeout(enemyTurn, 700);
    }
}

function heal() {
    if (gameOver) return;
    if (player.health < player.maxHealth) {
        player.health += player.heal;
        if (player.health > player.maxHealth) player.health = player.maxHealth;
        logMessage(`${player.name} heals for ${player.heal} HP.`);
        updateStats();
    } else {
        logMessage("You're already at full health!");
    }
    setTimeout(enemyTurn, 700);
}

function usePotion() {
    if (gameOver) return;
    if (player.inventory.potion > 0) {
        player.inventory.potion--;
        const healAmount = 30 + player.level * 5;
        player.health += healAmount;
        if (player.health > player.maxHealth) player.health = player.maxHealth;
        logMessage(`You used a potion and healed ${healAmount} HP!`);
        updateStats();
        setTimeout(enemyTurn, 700);
    } else {
        logMessage("No potions left!");
    }
}

function useManaPotion() {
    if (gameOver) return;
    if (player.inventory.manaPotion > 0) {
        player.inventory.manaPotion--;
        const manaAmount = 20 + player.level * 2;
        player.mana += manaAmount;
        if (player.mana > player.maxMana) player.mana = player.maxMana;
        logMessage(`You used a mana potion and restored ${manaAmount} MP!`);
        updateStats();
        setTimeout(enemyTurn, 700);
    } else {
        logMessage("No mana potions left!");
    }
}

// === Magic Spells ===
function fireball() {
    if (player.mana < 15) {
        logMessage("Not enough mana to cast Fireball!");
        return;
    }
    player.mana -= 15;
    const damage = 25 + Math.floor(Math.random() * (5 + player.level * 2));
    enemy.health -= damage;
    if (enemy.health < 0) enemy.health = 0;
    logMessage(`${player.name} casts Fireball! Deals ${damage} magic damage!`);
    updateStats();
    if (!checkGameOver()) {
        setTimeout(enemyTurn, 700);
    }
}

function magicHeal() {
    if (player.mana < 12) {
        logMessage("Not enough mana to cast Heal!");
        return;
    }
    player.mana -= 12;
    const healAmount = 20 + player.level * 3;
    player.health += healAmount;
    if (player.health > player.maxHealth) player.health = player.maxHealth;
    logMessage(`${player.name} casts Heal! Restores ${healAmount} HP!`);
    updateStats();
    setTimeout(enemyTurn, 700);
}

function castSpell(index) {
    spells[index].effect();
}

function setupActions() {
    let html = `
        <button onclick="attack()">Attack</button>
        <button onclick="heal()">Heal</button>
    `;
    html += `<div><strong>Magic:</strong> `;
    spells.forEach((spell, idx) => {
        html += `<button onclick="castSpell(${idx})" ${player.mana < spell.manaCost || gameOver ? "disabled" : ""}>${spell.name} (${spell.manaCost} MP)</button> `;
    });
    html += `</div>`;
    actionsDiv.innerHTML = html;
    updateInventory();
}

function showShop() {
    let html = `<strong>Shop:</strong> `;
    html += `<button onclick="buyPotion()" ${player.gold < 12 ? "disabled" : ""}>Buy Potion (12 gold)</button> `;
    html += `<button onclick="buyManaPotion()" ${player.gold < 16 ? "disabled" : ""}>Buy Mana Potion (16 gold)</button> `;
    weapons.forEach((w, i) => {
        if (i === 0 || w.name === player.weapon.name) return;
        html += `<button onclick="buyWeapon(${i})" ${player.gold < w.cost ? "disabled" : ""}>Buy ${w.name} (+${w.bonus}) (${w.cost} gold)</button> `;
    });
    shopDiv.innerHTML = html;
}

function buyPotion() {
    if (player.gold >= 12) {
        player.gold -= 12;
        player.inventory.potion++;
        logMessage("You bought a potion!");
        updateStats();
        showShop();
    }
}

function buyManaPotion() {
    if (player.gold >= 16) {
        player.gold -= 16;
        player.inventory.manaPotion++;
        logMessage("You bought a mana potion!");
        updateStats();
        showShop();
    }
}

function buyWeapon(index) {
    const weapon = weapons[index];
    if (player.gold >= weapon.cost && weapon.name !== player.weapon.name) {
        player.gold -= weapon.cost;
        player.weapon = weapon;
        logMessage(`You bought and equipped a ${weapon.name}!`);
        updateStats();
        showShop();
    }
}

function nextEnemy() {
    enemy = randomEnemy();
    gameOver = false;
    updateStats();
    logMessage(`<span style='color:yellow'>A wild ${enemy.name} appears!</span>`);
    setupActions();
    showShop();
}

window.attack = attack;
window.heal = heal;
window.usePotion = usePotion;
window.useManaPotion = useManaPotion;
window.castSpell = castSpell;
window.buyPotion = buyPotion;
window.buyManaPotion = buyManaPotion;
window.buyWeapon = buyWeapon;

function startGame() {
    logDiv.innerHTML = "";
    player.health = player.maxHealth;
    player.mana = player.maxMana;
    player.xp = 0;
    player.level = 1;
    player.xpToNext = 20;
    player.attack = 12;
    player.heal = 10;
    player.gold = 20;
    player.weapon = weapons[0];
    player.inventory = { potion: 2, manaPotion: 1 };
    gameOver = false;
    nextEnemy();
}

startGame();
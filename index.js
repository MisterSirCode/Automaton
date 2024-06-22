
const { Client, Events, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const term = require('terminal-kit').terminal;
const fs = require('fs');
const path = require('path');
const commandsPath = path.join(__dirname, 'commands');
const dot = require('dotenv');
dot.config();
const TOKEN = process.env.TOKEN;
const package = require('./package.json');
const ver = package.version;

// Utilities and Functions

let client,
    isRunning = false,
    runningUpdater,
    configExists = false,
    commands;

function rectifyConsole() {
    term.clear();
    term.hideCursor(false);
}

function hideMenu() {
    term.eraseArea(1, 6, 50, 2);
}

function startBot() {
    hideMenu();
    if (isRunning) {
        updateInfo(true);
        return;
    };
    term.moveTo(5, 6);
    try {
        client = new Client({ intents: [GatewayIntentBits.Guilds] });
        client.once(Events.ClientReady, response => {
            isRunning = true;
            runningUpdater = setInterval(() => updateInfo(), 2500);
        });
        client.login(TOKEN);
        term.green('Bot Loaded Successfully');
        setTimeout(() => { reloadBot(); }, 1000);
    } catch(e) {
        term.moveTo(1, 10);
        term(e);
        term.red('Bot Loading Failed');
        setTimeout(() => { updateInfo(true) }, 1000);
    }
}

function stopBot(end) {
    hideMenu();
    if (isRunning) {
        client.destroy();
        isRunning = false;
        clearInterval(runningUpdater);
    }
    updateInfo();
    term.moveTo(5, 6);
    if (end) {
        term.green('Bot Destroyed and Shutting Down Process...');
        setTimeout(() => {
            rectifyConsole();
            process.exit(); 
        }, 1000);
    } else {
        term.green('Bot Destroyed and Logged Out');
        setTimeout(() => { updateInfo(true); }, 1000);
    }
}

async function reloadBot() {
    hideMenu();
    commands = new Collection();
    let jsoncmds = [];
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.set(command.data.name, command);
            jsoncmds.push(command.data.toJSON());
		}
	}
    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const command = commands.get(interaction.commandName);
        if (!command) return;
        try { await command.execute(interaction); } catch(e) {
            term.moveTo(1, 10);
            term(e);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    });
    const rest = new REST().setToken(TOKEN);
    (async () => {
        try {
            term.moveTo(1, 10);
            const data = await rest.put(Routes.applicationGuildCommands(client.user.id, global.config.main_guild), { body: jsoncmds });
            term.moveTo(5, 6);
            term.green('Bot Commands Reloaded');
        } catch(e) {
            term.moveTo(1, 10);
            term(e);
        }
        setTimeout(() => { updateInfo(true); }, 1000);
    })();
}

function formatTime(duration) {
    let milliseconds = Math.floor((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / 60000) % 60),
        hours = Math.floor((duration / 3600000) % 24);
        days = Math.floor((duration / 86400000) % 365);
    let tdays = (days < 10) ? "0" + days : days;
    days = (days < 365) ? "0" + tdays : tdays;
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    return days + ":" + hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

// Preload, Events and Setup

try { global.config = require('./config.json'); configExists = true; } catch(e) { configExists = false; }

term.grabInput();
term.on('key', (name, matches, data) => {
    if (name === 'CTRL_C') {
        rectifyConsole();
        process.exit(); 
    }
});

process.on('uncaughtException', (e) => { 
    term.moveTo(1, 10);
    term(e); 
    resetMenu(); 
});

// Console Renderer and Functionality

term.clear();

term('\n');
term(`    Automaton v${ver}`);
term('\n\n');

const runningItems = ['Stop', 'Reload Commands', 'Shutdown'];
const stoppedItems = ['Start', 'Shutdown'];

function resetMenu() {
    term.eraseArea(1, 6, 50, 2);
    term.hideCursor();
    let items;
    if (isRunning) items = runningItems;
    else items = stoppedItems;
    term.singleLineMenu(items, { y: 6, selectedStyle: term.black.bgGreen }, (error, response) => {
        term.moveTo(5, 7);
        switch (response.selectedText) {
            case 'Start':
                startBot();
                break;
            case 'Stop':
                stopBot();
                break;
            case 'Reload Commands':
                reloadBot();
                break;
            case 'Shutdown':
                stopBot(true);
                break;
            default: return;
        }
    });
}

function updateInfo(menu) {
    global.client = client; // Give access to the whole process
    term.eraseArea(5, 4, 100, 1);
    term.moveTo(5, 4);
    if (isRunning) {
        term.yellow('Status: ').green('Online').yellow('  Uptime: ').white(formatTime(client.uptime)).yellow('  API Ping: ');
        let ping = client.ws.ping || 0;
        if (ping <= 10) term.green(ping + "ms");
        else if (ping <= 30) term.yellow(ping + "ms");
        else term.red(ping + "ms");
        term.yellow('  Bot Account: ').white(`"${client.user.username}`).brightGreen("#" + client.user.discriminator).white(`"`);
    } else term.yellow('Status: ').red('Offline');
    if (menu) resetMenu(); // Resetting the menu constantly would make it useless
}

// Start

updateInfo(true);
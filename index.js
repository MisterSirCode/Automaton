const dot = require('dotenv');
dot.config();
const { Client, Events, GatewayIntentBits } = require('discord.js');
const term = require('terminal-kit').terminal;
const conf = require('./package.json');
const ver = conf.version;

// Utilities and Functions

let client,
    curClient,
    isRunning = false,
    runningUpdater;

function rectifyConsole() {
    term.clear();
    term.hideCursor(false);
}

function startBot() {
    term.moveTo(4, 7);
    try {
        client = new Client({ intents: [GatewayIntentBits.Guilds] });
        client.once(Events.ClientReady, readyClient => {
            curClient = readyClient;
            isRunning = true;
            runningUpdater = setInterval(() => updateInfo(), 2500);
        });
        client.login(process.env.TOKEN);
        term.green('Bot Loaded Successfully! ');
        setTimeout(() => { updateInfo(true) }, 1000);
    } catch(e) {
        term.red('Bot failed to start with error:').white(e);
    }
}

function stopBot(end) {
    if (isRunning) {
        client.destroy();
        isRunning = false;
        clearInterval(runningUpdater);
    }
    updateInfo();
    term.moveTo(5, 7);
    if (end) {
        term.green('Bot Destroyed and Shutting Down Process...');
        setTimeout(() => {
            rectifyConsole();
            process.exit(); 
        }, 1000);
    } else {
        term.green('Bot Destroyed and Logged Out');
        setTimeout(() => { updateInfo(true) }, 1000);
    }
}

function formatTime(duration) {
    let milliseconds = Math.floor((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (60000)) % 60),
        hours = Math.floor((duration / (3600000)) % 24);
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

// Preload, Events and Setup

term.grabInput();
term.on('key', (name, matches, data) => {
    if (name === 'CTRL_C') {
        rectifyConsole();
        process.exit(); 
    }
});

// Console Renderer and Functionality

term.clear();

term('\n');
term(`    Automaton v${ver}`);
term('\n\n');
term.move(4, 0);
term.yellow(`Status: `).red('Offline');

let items = ['Start', 'Stop', 'Reload Commands', 'Shutdown'];

function resetMenu() {
    term.eraseArea(1, 6, 50, 2);
    term.hideCursor();
    term.singleLineMenu(items, { y: 6, selectedStyle: term.black.bgGreen }, (error, response) => {
        term.moveTo(5, 7);
        switch (response.selectedIndex) {
            case 0:
                startBot();
                break;
            case 1:
                stopBot();
                break;
            case 2:
                reloadBot();
                break;
            case 3:
                stopBot(true);
                break;
            default: return;
        }
    });
}

resetMenu(); // Initialization / Start the interactive console

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
        term.yellow('  Bot Account: ').white(client.user.username).brightGreen("#" + client.user.discriminator);
    } else term.yellow('Status: ').red('Offline');
    if (menu) resetMenu(); // Resetting the menu constantly would make it useless
}
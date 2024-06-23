# Automaton
A simple bot boilerplate + general utility bot. Ive built this one to allow primitive interaction and status visualization within the console directly, as I find it far more useful then having debug commands or custom instructions within the bot itself.

Create a `.env` file and include your token in this format: `TOKEN=YourTokenHere`

Use `run_unix.sh` or `run_win.bat` accordingly.

You may need to run `chmod 755 run_unix.sh` on first initialization for MacOS.

Also, if you want certain debug / dev commands to be registered, set a "main_guild" property in a `config.json` file, as such:

```json
{
    "main_guild": "guild_id_here"
}
```

Once your config and main guild are registered, you'll be able to adjust the config as needed using commands.

### Things to be aware of

This bot, while a boilerplate, is still configured to my likings and usage. It should work fine as is for everyone, but feel free to configure it and adjust commands as needed.

Also, the "Reload Commands" option within the bot is NOT designed to completely republish the edited command files. For specific reasons I have had issues getting that working... So please fully shutdown the bot (Kill the process) and restart it to gaurantee updated command files are used.

I always reccomend having two bot instances... One for deployments, and one for development. Test commands on the development instance and not the deployment instance.

Also, this bot runs a bit differently from others. The way I built the interactive terminal, running the startup file does NOT start the bot, it simply opens the instance. You must hit enter with the "Start" option to actually run the bot. This system is designed so you can start and stop it dynamically without needing to fully shutdown the bot. In the future I plan to make an interactive "error counter" so you can use this start / stopping feature to dig through errors while turning off the bot, without shutting things down and losing the error logs..
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
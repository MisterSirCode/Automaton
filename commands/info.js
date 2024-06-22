const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Get information about the bot and its status'),
	async execute(interaction) {
		await interaction.reply('Test');
	},
};

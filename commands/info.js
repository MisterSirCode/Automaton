const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Get information about online activity'),
	async execute(interaction) {
		await interaction.reply('Test');
	},
};

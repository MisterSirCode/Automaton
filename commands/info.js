const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Get information for the bot, the current server, or a user')
        .addSubcommand(botInfo => botInfo
            .setName('bot')
            .setDescription('Get information about this bot'))
        .addSubcommand(serverInfo => serverInfo
            .setName('server')
            .setDescription('Get information about this server'))
        .addSubcommand(userInfo => userInfo
            .setName('user')
            .setDescription('Get information about a user')
            .addUserOption(userOption => userOption
                .setName('target')
                .setDescription('User you want to inquire about'))),
	async execute(interaction) {
        const mainOptionSelected = interaction.options.getSubcommand();
        const currentYear = (new Date(Date.now())).getYear();
		const pingEmbed = new EmbedBuilder();
        if (mainOptionSelected == 'bot') {
		    const bot = global.client.user;
            const cretDate = bot.createdAt;
            const ageDiff = currentYear - cretDate.getYear();
			pingEmbed.setAuthor({ 
				name: `${bot.username}#${bot.discriminator}`, 
				iconURL: bot.avatarURL()
			}).setDescription(`Process Identifier: ${process.pid}`)
			.addFields({
				name: 'Ping',
				value: `${Math.round(Math.abs((Date.now() - interaction.createdTimestamp)) / 100.0)}ms (Server) ${Math.round(global.client.ws.ping)}ms (API)`
			}, {
				name: 'Version',
				value: `${global.version}`
			}, {
                name: 'Creation Date',
                value: `${cretDate.toDateString()}${ageDiff > 0 ? ', ' + ageDiff + ' years ago' : ''}`
            }).setColor(global.config.color || "#ffffff");
        } else if (mainOptionSelected == 'server') {
            if (interaction.inGuild()) {
                const server = interaction.guild;
                const cretDate = server.createdAt;
                const ageDiff = currentYear - cretDate.getYear();
                pingEmbed.setAuthor({ 
                    name: server.name, 
                    iconURL: server.iconURL()
                }).setDescription(server.description)
                .addFields({
                    name: 'Creation Date',
                    value: `${cretDate.toDateString()}${ageDiff > 0 ? ', ' + ageDiff + ' years ago' : ''}`
                }, {
                    name: 'Member Count',
                    value: `${server.memberCount} Users`
                }).setColor(global.config.color || "#ffffff");
            } else {
                interaction.reply('You must be in a guild to use this command');
                return;
            }
        } else if (mainOptionSelected == 'user') {
            let userOption = interaction.options.getUser('target');
            let memberOption = interaction.options.getMember('target') || userOption;
            const user = userOption ? userOption : interaction.user;
            const member = memberOption ? memberOption : (interaction.member || user);
            const cretDate = user.createdAt;
            const cretDiff = currentYear - cretDate.getYear();
            pingEmbed.setAuthor({ 
                name: user.displayName === user.username ? user.displayName : `${user.displayName} (${user.username})`, 
                iconURL: user.avatarURL()
            });
            let fields = [{
                name: 'Creation Date',
                value: `${cretDate.toDateString()}${cretDiff > 0 ? ', ' + cretDiff + ' years ago' : ''}`
            }];
            let additionals = [];
            if (interaction.inGuild()) {
                const joinDate = member.joinedAt;
                const joinDiff = currentYear - joinDate.getYear();
                fields.push({
                    name: 'Join Date',
                    value: `${joinDate.toDateString()}${joinDiff > 0 ? ', ' + joinDiff + ' years ago' : ''}`
                });
                if (user.id == member.guild.ownerId) additionals.push('Server Owner');
            }
            if (user.bot) additionals.push('Bot');
            if (!global.owner) {
                await interaction.client.application.fetch();
                const ownerId = interaction.client.application.owner.id;
                if (user.id == ownerId) additionals.push('Bot Owner');
                global.owner = ownerId;
            } else if (user.id == global.owner) additionals.push('Bot Owner');
            if (additionals.length > 0)
                pingEmbed.setDescription(additionals.join(', '));
            pingEmbed.addFields(...fields).setColor(user.hexAccentColor || global.config.color || "#ffffff");
        }
        interaction.reply({ embeds: [pingEmbed] });
        return;
	}
};

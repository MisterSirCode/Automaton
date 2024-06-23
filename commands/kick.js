const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    local: false,
	data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('(Moderator) Kick a user from your guild')
        .addUserOption(option => option
        .setName('user')
            .setDescription('User you wish to kick')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Why the user is being kicked')
            .setRequired(false))
        .addBooleanOption(option => option
            .setName('hidden')
            .setDescription('Hide response message')
            .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
	async execute(interaction) {
        if (!interaction.inGuild()) {S
            interaction.reply('You cannot kick this user');
            return;
        }
        if (interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            const userOption = interaction.options.getUser('user');
            const memberOption = interaction.options.getMember('user');
            const reasonOption = interaction.options.getString('reason');
            const hiddenOption = interaction.options.getBoolean('hidden');
            if (memberOption.kickable) {
                memberOption.kick().then(() => {
                    const kickEmbed = new EmbedBuilder()
                        .setTitle(`${userOption.displayName} was kicked from this server`)
                        .setAuthor({
                            name: userOption.displayName === userOption.username ? userOption.displayName : `${userOption.displayName} (${userOption.username})`,
                            iconURL: userOption.avatarURL()
                        }).setColor(global.config.color || "#ffffff");
                    if (reasonOption) kickEmbed.setDescription(`Reason: ${reasonOption}`);
                    interaction.reply({ embeds: [kickEmbed], ephemeral: hiddenOption || false });
                    return;
                }).catch((e) => {
                    interaction.reply({ content: `Failed to kick ${userOption.displayName} with error, ${e}`, ephemeral: hiddenOption || false });
                    return;
                });
            } else {
                interaction.reply(`I do not have permission to kick ${userOption.displayName}`);
                return;
            }
        }
	},
};
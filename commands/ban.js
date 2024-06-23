const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    local: false,
	data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('(Moderator) Ban a user from your guild')
        .addUserOption(option => option
        .setName('user')
            .setDescription('User you wish to ban')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Why the user is being kicked')
            .setRequired(false))
        .addBooleanOption(option => option
            .setName('hidden')
            .setDescription('Hide response message')
            .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
        if (!interaction.inGuild()) {
            interaction.reply('You cannot ban this user');
            return;
        }
        if (interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            const userOption = interaction.options.getUser('user');
            const memberOption = interaction.options.getMember('user');
            const reasonOption = interaction.options.getString('reason');
            const hiddenOption = interaction.options.getBoolean('hidden');
            if (memberOption.bannable) {
                memberOption.ban().then(() => {
                    const banEmbed = new EmbedBuilder()
                        .setTitle(`${userOption.displayName} was banned from this server`)
                        .setAuthor({
                            name: userOption.displayName === userOption.username ? userOption.displayName : `${userOption.displayName} (${userOption.username})`,
                            iconURL: userOption.avatarURL()
                        }).setColor(global.config.color || "#ffffff");
                    if (reasonOption) banEmbed.setDescription(`Reason: ${reasonOption}`);
                    interaction.reply({ embeds: [banEmbed], ephemeral: hiddenOption || false });
                    return;
                }).catch((e) => {
                    interaction.reply({ content: `Failed to ban ${userOption.displayName} with error, ${e}`, ephemeral: hiddenOption || false });
                    return;
                });
            } else {
                interaction.reply(`I do not have permission to kick ${userOption.displayName}`);
                return;
            }
        }
	},
};
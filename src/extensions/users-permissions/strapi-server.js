module.exports = (plugin) => {
    //update profile of user
    plugin.controllers.user.updateProfile = async (ctx) => {
        if (!ctx.state.user || !ctx.state.user.id) {
            ctx.response.status = 401;
            ctx.response.body = { error: "Unauthorized" };
            return;
        }

        try {
            const updatedUser = await strapi.db.query('plugin::users-permissions.user').update({
                where: { id: ctx.state.user.id },
                data: ctx.request.body,
            });

            ctx.response.status = 200;
            ctx.response.body = { message: "Profile updated successfully", user: updatedUser };
        } catch (error) {
            ctx.response.status = 500;
            ctx.response.body = { error: "Something went wrong" };
        }
    };

    plugin.routes['content-api'].routes.push({
        method: "PUT",
        path: "/user/profile",
        handler: "user.updateProfile",
        config: {
            prefix: "",
            policies: [],
        },
    });

    return plugin;
};
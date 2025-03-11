'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::ingredient.ingredient', ({ strapi }) => ({
    // Update ingredient quantity
    async updateQuantity(ctx) {
        const { id, quantity } = ctx.request.body;

        if (!id || quantity === undefined) {
            return ctx.badRequest("ID and quantity are required");
        }

        try {
            const updatedIngredient = await strapi.entityService.update('api::ingredient.ingredient', id, {
                data: { quantity },
            });

            return ctx.send({
                message: "Quantity updated successfully",
                ingredient: updatedIngredient
            });
        } catch (error) {
            return ctx.internalServerError("Something went wrong", error);
        }
    },

    // Create a new ingredient
    async createIngredient(ctx) {
        const { name, quantity, groceryListID } = ctx.request.body;

        if (!name || quantity === undefined || !groceryListID) {
            return ctx.badRequest("Name, quantity, and groceryListID are required");
        }

        try {
            const newIngredient = await strapi.entityService.create('api::ingredient.ingredient', {
                data: { name, quantity,groceryListID },
            });

            return ctx.send({
                message: "Ingredient created successfully",
                ingredient: newIngredient
            });
        } catch (error) {
            return ctx.internalServerError("Something went wrong", error);
        }
    },

    // get user ingredients
    async getUserIngredients(ctx) {
        const { userId } = ctx.request.body;
        try {
            // Find a single grocery list that belongs to this user using strapi.db.query
            const groceryList = await strapi.db.query('api::grocery-list.grocery-list').findOne({
                where: { userID: userId },
                select: ['id'],
            });
            if (!groceryList) {
                return ctx.notFound("No grocery list found for this user");
            }
    
            // Find ingredients linked to this grocery list using strapi.db.query
            const ingredients = await strapi.db.query('api::ingredient.ingredient').findMany({
                where: { groceryListID: groceryList.id,publishedAt: { $not: null } },
            });
    
            ctx.response.status = 200;
            ctx.response.body = {
                message: "User's ingredients fetched successfully",
                ingredients,
            };
        } catch (error) {
            ctx.response.status = 500;
            ctx.response.body = { error: "Something went wrong", details: error.message };
        }
    }         
}));

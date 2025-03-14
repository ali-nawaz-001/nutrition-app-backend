const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');

module.exports = createCoreController('api::recommendation.recommendation', ({ strapi }) => ({
    // Fetch recommended recipes from Spoonacular
    async recommend(ctx) {
        const { time, calories,ingredients } = ctx.query;

        if (!time || !calories || !ingredients) {
            return ctx.badRequest("Time, calories, and ingredients are required");
        }

        try {
            const API_KEY = '788845b5c63b4b468d2a00e0343109f2';
            const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&maxReadyTime=${time}&maxCalories=${calories}&ingredients=${ingredients}&addRecipeInformation=true&number=3`;
            
            const response = await axios.get(url);
            return ctx.send({ recipes: response.data.results });
        } catch (error) {
            return ctx.internalServerError("Failed to fetch recipes", error);
        }
    },
    async getRecipeDetails(ctx) {
        const { id } = ctx.query;

        if (!id) {
            return ctx.badRequest("Recipe ID is required");
        }

        try {
            const API_KEY = '788845b5c63b4b468d2a00e0343109f2';
            const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}&includeNutrition=true`;
            
            const response = await axios.get(url);
            const recipe = response.data;

            return ctx.send({
                id: recipe.id,
                title: recipe.title,
                image: recipe.image,
                nutrition: recipe.nutrition,
                instructions: recipe.analyzedInstructions,
                ingredients: recipe.extendedIngredients,
                readyInMinutes: recipe.readyInMinutes,
                servings: recipe.servings
            });
        } catch (error) {
            return ctx.internalServerError("Failed to fetch recipe details", error);
        }
    },
}));
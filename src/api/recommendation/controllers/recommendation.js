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
            const res=response.data.results;
            const extractedData = res.map(recipe => ({
                id: recipe.id,
                name: recipe.title,
                time: recipe.readyInMinutes,
                level:recipe.readyInMinutes<30?"Easy":recipe.readyInMinutes<60?"Medium":"Hard",
                image: recipe.image,
                kcal: recipe.nutrition.nutrients[0].amount
            }));
            return ctx.send({ recipes: extractedData });
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

            // Extract the necessary nutrition data
            const calories = recipe.nutrition.nutrients.find(n => n.name === 'Calories');
            const protein = recipe.nutrition.nutrients.find(n => n.name === 'Protein');
            const glucides = recipe.nutrition.nutrients.find(n => n.name === 'Carbohydrates');
            const lipides = recipe.nutrition.nutrients.find(n => n.name === 'Fat');
            const fibres = recipe.nutrition.nutrients.find(n => n.name === 'Fiber');
            const sel=recipe.nutrition.nutrients.find(n => n.name === 'Selenium');

            const nutrition=({
                calories:calories,
                protein:protein,
                glucides:glucides,
                lipides:lipides,
                fibres:fibres,
                sel:sel
            });

            // Extract only the necessary data
            const ingredient=recipe.nutrition.ingredients.map(i=>({
                name:i.name,
                amount:i.amount,
                unit:i.unit
            }));

            // Extreact the necessary steps
            const extractedSteps = recipe.analyzedInstructions.flatMap(instruction =>
                instruction.steps.map(step => ({
                    number: step.number,
                    step: step.step
                }))
            );

            return ctx.send({
                // all:recipe,
                id: recipe.id,
                title: recipe.title,
                level:recipe.readyInMinutes<30?"Easy":recipe.readyInMinutes<60?"Medium":"Hard",
                time: recipe.readyInMinutes,
                image: recipe.image,
                summary: recipe.summary,
                nutrition:nutrition,
                ingredients: ingredient,
                instructions: extractedSteps,
            });
        } catch (error) {
            return ctx.internalServerError("Failed to fetch recipe details", error);
        }
    },
}));
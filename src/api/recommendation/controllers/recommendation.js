const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');

module.exports = createCoreController('api::recommendation.recommendation', ({ strapi }) => ({
    // Fetch recommended recipes from Spoonacular
    async recommend(ctx) {
        const { time, calories, minServings, cuisine, ingredients } = ctx.query;

        if (!time || !calories || !ingredients) {
            return ctx.badRequest("Time, calories, and ingredients are required");
        }
        try {
            const API_KEY = '788845b5c63b4b468d2a00e0343109f2';
            const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&maxReadyTime=${time}&maxCalories=${calories}&ingredients=${ingredients}&addRecipeInformation=true&number=3&minServings=${minServings}&cuisine=${cuisine}`;
            
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
    async updateMealPlan(ctx) {
        const { userId, recipeId } = ctx.query;
      
        if (!userId || !recipeId) {
          return ctx.badRequest("User ID and Recipe ID are required");
        }
      
        try {
          const currentDate = new Date();
          const formattedDate = currentDate.toISOString().split('T')[0];
      
          // 1. Check if meal plan exists for this user and date
          const existingMealPlans = await strapi.entityService.findMany('api::meal-plan.meal-plan', {
            filters: {
              user: { id: userId },
              date: formattedDate
            },
            populate: '*'
          });
      
          let mealPlan;
      
          if (existingMealPlans.length > 0) {
            // Meal plan exists
            console.log("Meal plan exists for this user and date");
            mealPlan = existingMealPlans[0];
          } else {
            // 2. Create a new meal plan
            console.log("Creating new meal plan for this user and date");
            mealPlan = await strapi.entityService.create('api::meal-plan.meal-plan', {
              data: {
                date: formattedDate,
                user: userId,
                calories: 0,
              },
              populate: '*'
            });
          }

          const recipe = await strapi.entityService.findOne('api::recipe.recipe', recipeId);
          if (!recipe) {
            return ctx.notFound("Recipe not found");
          }
          const RecipeCalories = recipe.nutrition.calories.amount;
          const ingredients = recipe.ingredients.map((ing) => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
          }));
          const groceryIngredients = await strapi.entityService.findMany('api::ingredient.ingredient', {
            filters: {
              grocery_list: {
                user: { id: userId }
              }
            }
          });
          const groceryMap = new Map();
            groceryIngredients.forEach((item) => {
            groceryMap.set(item.Name.toLowerCase(), item);
          });
          for (const recipeIng of ingredients) {
            const name = recipeIng.name.toLowerCase();
            const matchedGrocery = groceryMap.get(name);
        
            if (matchedGrocery) {
              const newQuantity = matchedGrocery.quantity - recipeIng.amount;
      
              await strapi.entityService.update('api::ingredient.ingredient', matchedGrocery.id, {
                data: {
                  quantity: newQuantity > 0 ? newQuantity : 0
                }
              });
            }
          }
            // 3. Add recipe to meal plan
            const currentHour = currentDate.getHours();
            let mealSlot = '';

            if (currentHour >= 5 && currentHour < 10) {
                mealSlot = 'breakfast';
                mealPlan=await strapi.entityService.update('api::meal-plan.meal-plan', mealPlan.id,{
                    data: {
                        breakfast: recipe,
                        calories:RecipeCalories+mealPlan.calories
                    },
                    populate: '*'
                });
            } else if (currentHour >= 10 && currentHour < 12) {
                mealSlot = 'snack';
                mealPlan=await strapi.entityService.update('api::meal-plan.meal-plan', mealPlan.id,{
                    data: {
                        snack: recipe,
                        calories:RecipeCalories+mealPlan.calories
                    },
                    populate: '*'
                });
            } else if (currentHour >= 12 && currentHour < 15) {
                mealSlot = 'lunch';
                mealPlan=await strapi.entityService.update('api::meal-plan.meal-plan', mealPlan.id,{
                    data: {
                        lunch: recipe,
                        calories:RecipeCalories+mealPlan.calories
                    },
                    populate: '*'
                });
            } else if (currentHour >= 15 && currentHour < 22) {
                mealSlot = 'dinner';
                mealPlan=await strapi.entityService.update('api::meal-plan.meal-plan', mealPlan.id,{
                    data: {
                        dinner: recipe,
                        calories:RecipeCalories+mealPlan.calories
                    },
                    populate: '*'
                });
            } else {
                mealSlot = 'dinner';
                mealPlan=await strapi.entityService.update('api::meal-plan.meal-plan', mealPlan.id,{
                    data: {
                        dinner: recipe,
                        calories:RecipeCalories+mealPlan.calories
                    },
                    populate: '*'
                });
            }
          return ctx.send({ message: "Meal plan checked or created", mealPlan });
      
        } catch (error) {
          console.error(error);
          return ctx.internalServerError("Failed to update meal plan", { error });
        }
    }      
}));
'use strict';

module.exports = {
    routes: [
        {
            method: "POST",
            path: "/ingredients/update-quantity",
            handler: "ingredient.updateQuantity",
            config: {
                auth: false, // Change to true if authentication is needed
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            path: "/ingredients/create",
            handler: "ingredient.createIngredient",
            config: {
                auth: false, // Change to true if authentication is needed
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            path: "/ingredients/all",
            handler: "ingredient.getUserIngredients",
            config: {
                auth: false,  // Ensure authentication is enabled
                policies: [],
                middlewares: [],
            },
        }        
    ],
};
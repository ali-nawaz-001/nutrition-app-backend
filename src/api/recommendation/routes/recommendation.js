module.exports = {
    routes: [
      {
        method: "GET",
        path: "/recommend-recipes",
        handler: "recommendation.recommend",
        config: {
          auth: false,
        },
      },
      {
        method: "GET",
        path: "/recipe-details",
        handler: "recommendation.getRecipeDetails",
        config: {
          auth: false,
        },
      },
      {
        method: "POST",
        path: "/updateMealPlan",
        handler: "recommendation.updateMealPlan",
        config: {
          auth: false,
        },
      },
    ],
  };  
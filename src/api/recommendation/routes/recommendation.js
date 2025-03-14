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
    ],
  };  
'use strict';

/**
 * save-recipe service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::save-recipe.save-recipe');

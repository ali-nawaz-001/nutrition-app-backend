'use strict';

/**
 * meal-plan service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::meal-plan.meal-plan');

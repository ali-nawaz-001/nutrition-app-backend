'use strict';

/**
 * grocery-list service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::grocery-list.grocery-list');

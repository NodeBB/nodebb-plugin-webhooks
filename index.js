
'use strict';

const validator = require('validator');
const db = require.main.require('./src/database').async;
const routeHelpers = require.main.require('./src/routes/helpers');
const socketAdmin = require.main.require('./src/socket.io/admin');

const plugin = module.exports;

plugin.init = function (params, callback) {
	routeHelpers.setupAdminPageRoute(params.router, '/admin/plugins/webhooks', params.middleware, [], renderAdmin);

	setImmediate(callback);
};

async function renderAdmin(req, res, next) {
	try {
		res.render('admin/plugins/webhooks', { });
	} catch (err) {
		return next(err);
	}
}

plugin.onHookFired = function (hookData) {

};

plugin.admin = {};

plugin.admin.menu = function (menu, callback) {
	menu.plugins.push({
		route: '/plugins/webhooks',
		icon: 'fa-chart-bar',
		name: 'Web Hooks',
	});

	setImmediate(callback, null, menu);
};


socketAdmin.plugins.webhooks = {};
socketAdmin.plugins.webhooks.save = function(socket, data, callback) {
	callback();
};
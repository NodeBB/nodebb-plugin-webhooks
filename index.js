
'use strict';

const request = require('request');

const db = require.main.require('./src/database').async;
const routeHelpers = require.main.require('./src/routes/helpers');
const socketAdmin = require.main.require('./src/socket.io/admin');
const pubsub = require.main.require('./src/pubsub');

const plugin = module.exports;

let hooks = [];

plugin.init = async function (params, callback) {
	routeHelpers.setupAdminPageRoute(params.router, '/admin/plugins/webhooks', params.middleware, [], renderAdmin);
	hooks = await getHooks();
	setImmediate(callback);
};

async function renderAdmin(req, res, next) {
	try {
		const hooks = await getHooks();
		res.render('admin/plugins/webhooks', { hooks: hooks });
	} catch (err) {
		next(err);
	}
}

async function getHooks() {
	const data = await db.get('nodebb-plugin-webhooks');
	return JSON.parse(data || '[]');
}

plugin.onHookFired = function (hookData) {
	hooks.forEach(function (hook) {
		if (hook.name === hookData.hook) {
			makeRequest(hook.endpoint, hookData.params);
		}
	});
};

function makeRequest(endpoint, params) {
	request.post(endpoint, {
		form: params,
		timeout: 2500,
		followAllRedirects: true,
	}, function (err, res, body) {
		if (err) {
			console.error('[nodebb-plugin-webhooks]', err);
		}
		if (res && res.statusCode !== 200) {
			console.error('[nodebb-plugin-webhooks]', res.statusCode, body);
		}
	});
}

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
socketAdmin.plugins.webhooks.save = async function (socket, data, callback) {
	await db.set('nodebb-plugin-webhooks', JSON.stringify(data));
	hooks = data;
	pubsub.publish('nodebb-plugin-webhooks:save', data);
	callback();
};

pubsub.on('nodebb-plugin-webhooks:save', function (data) {
	hooks = data;
});

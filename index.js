
'use strict';

const request = require('request-promise-native');
const async = require('async');
const crypto = require('crypto');

const winston = require.main.require('winston');
const db = require.main.require('./src/database');
const meta = require.main.require('./src/meta');
const routeHelpers = require.main.require('./src/routes/helpers');
const apiHelpers = require.main.require('./src/api/helpers');
const socketAdmin = require.main.require('./src/socket.io/admin');
const pubsub = require.main.require('./src/pubsub');

const plugin = module.exports;

let hooks = [];

plugin.init = async function (params) {
	routeHelpers.setupAdminPageRoute(params.router, '/admin/plugins/webhooks', params.middleware, [], renderAdmin);
	hooks = await getHooks();
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

plugin.onHookFired = async function (hookData) {
	const { secret } = await meta.settings.get('webhooks');
	hookData = cleanPayload(hookData);

	async.eachSeries(hooks, async (hook) => {
		if (hook.name === hookData.hook) {
			let signature;
			if (secret) {
				const hash = crypto.createHmac('sha1', secret);
				hash.update(JSON.stringify(hookData));
				signature = `sha1=${hash.digest('hex')}`;
			}
			await makeRequest(hook.endpoint, hookData, signature);
		}
	});
};

function cleanPayload(data) {
	if (data.params) {
		['req', 'socket'].forEach((prop) => {
			if (data.params.hasOwnProperty(prop)) {
				data.params[prop] = apiHelpers.buildReqObject(data.params[prop]);
			}
		});

		if (data.params.hasOwnProperty('res')) {
			delete data.params.res;
		}
	}

	return data;
}

async function makeRequest(endpoint, hookData, signature) {
	const { noStrictSSL } = await meta.settings.get('webhooks');
	const headers = signature && { 'x-webhook-signature': signature };
	const strictSSL = noStrictSSL !== 'on';

	try {
		const { statusCode, body } = await request.post(endpoint, {
			body: hookData,
			timeout: 2500,
			followAllRedirects: true,
			headers,
			json: true,
			resolveWithFullResponse: true,
			strictSSL,
		});

		if (statusCode !== 200) {
			winston.error(`[nodebb-plugin-webhooks] ${statusCode} ${body}`);
		}
	} catch (e) {
		winston.error(`[nodebb-plugin-webhooks] ${e.message}`);
	}
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
socketAdmin.plugins.webhooks.save = async function (socket, data) {
	await db.set('nodebb-plugin-webhooks', JSON.stringify(data));
	hooks = data;
	pubsub.publish('nodebb-plugin-webhooks:save', data);
};

pubsub.on('nodebb-plugin-webhooks:save', function (data) {
	hooks = data;
});

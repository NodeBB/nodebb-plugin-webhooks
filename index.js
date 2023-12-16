'use strict';

const https = require('https');
const axios = require('axios');
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
	routeHelpers.setupAdminPageRoute(params.router, '/admin/plugins/webhooks', renderAdmin);
	hooks = await getHooks();
};

async function renderAdmin(req, res) {
	const hooks = await getHooks();
	res.render('admin/plugins/webhooks', {
		title: 'Webhooks',
		hooks: hooks,
	});
}

async function getHooks() {
	const data = await db.get('nodebb-plugin-webhooks');
	return JSON.parse(data || '[]');
}

plugin.onHookFired = async function (hookData) {
	const { secret } = await meta.settings.get('webhooks');
	hookData = cleanPayload(hookData);

	for (const hook of hooks) {
		if (hook && hook.name === hookData.hook) {
			let signature;
			if (secret) {
				const hash = crypto.createHmac('sha1', secret);
				hash.update(JSON.stringify(hookData));
				signature = `sha1=${hash.digest('hex')}`;
			}
			// eslint-disable-next-line no-await-in-loop
			await makeRequest(hook.endpoint, hookData, signature);
		}
	}
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
	const axiosOptions = {
		timeout: 2500,
		maxRedirects: 10,
		headers,
		responseType: 'json',
	};

	if (!strictSSL) {
		axiosOptions.httpsAgent = new https.Agent({
			rejectUnauthorized: false,
		});
	}
	try {
		const { status, data } = await axios.post(endpoint, hookData, axiosOptions);
		if (status !== 200) {
			winston.error(`[nodebb-plugin-webhooks] ${status} ${data}`);
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

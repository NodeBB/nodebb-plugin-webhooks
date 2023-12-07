/* globals app, $, socket, define */

'use strict';

define('admin/plugins/webhooks', ['settings', 'alerts'], function (settings, alerts) {
	var WebHooks = {};

	WebHooks.init = function () {
		$('#add-hook').on('click', function () {
			app.parseAndTranslate('admin/plugins/webhooks', 'hooks', { hooks: [{ name: 'action:**.**', endpoint: 'https://yourendpoint.com' }] }, function (html) {
				$('#hooks-parent').append(html);
			});
		});

		settings.load('webhooks', $('.webhooks-settings'));
		$('#save').on('click', function () {
			var data = [];
			$('#hooks-parent tr').each(function () {
				data.push({
					name: $(this).find('.hook-name').val(),
					endpoint: $(this).find('.hook-endpoint').val(),
				});
			});

			Promise.all([
				new Promise((resolve, reject) => {
					socket.emit('admin.plugins.webhooks.save', data, err => (!err ? resolve() : reject(err)));
				}),
				new Promise((resolve, reject) => {
					settings.save('webhooks', $('.webhooks-settings'), err => (!err ? resolve() : reject(err)));
				}),
			]).then(() => {
				alerts.alert({
					type: 'success',
					alert_id: 'webhooks-saved',
					title: 'Settings Saved',
				});
			}).catch(alerts.error);
		});

		$('#hooks-parent').on('click', '.hook-remove', function () {
			$(this).parent().parent().remove();
		});
	};

	return WebHooks;
});

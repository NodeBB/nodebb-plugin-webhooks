/* globals app, $, socket, define */

'use strict';

define('admin/plugins/webhooks', ['settings'], function (settings) {
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
			socket.emit('admin.plugins.webhooks.save', data, function (err) {
				if (err) {
					return app.alertError(err);
				}
				app.alertSuccess('Hooks Saved!');
			});
			saveSettings();
		});

		$('#hooks-parent').on('click', '.hook-remove', function () {
			$(this).parent().parent().remove();
		});
	};

	function saveSettings() {
		settings.save('webhooks', $('.webhooks-settings'), function () {
			app.alert({
				type: 'success',
				alert_id: 'webhooks-saved',
				title: 'Settings Saved',
			});
		});
	}

	return WebHooks;
});

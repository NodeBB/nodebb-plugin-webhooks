<form role="form" class="webhooks-settings">
	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">Security</div>
		<div class="col-sm-10 col-xs-12">
			<div class="form-group">
				<label for="secret">Signature Verification Secret</label>
				<input type="text" id="secret" name="secret" title="Signature Verification Secret" class="form-control" placeholder="mye3cr37p@55w0r[)">
				<p class="help-block">
					If set, then a header <code>x-webhook-signature</code> will be sent with the web hook. The value of this header is a `sha1` HMAC of the payload. To verify that the payload sender is authenticated, run the HMAC with this shared secret and ensure the hashes match.
				</p>
			</div>

			<div class="checkbox">
				<label for="noStrictSSL" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
					<input type="checkbox" class="mdl-switch__input" id="noStrictSSL" name="noStrictSSL">
					<span class="mdl-switch__label"><strong>Disable strict verification of SSL certificates</strong></span>
					<p class="help-block">
						This is helpful if you are testing with a self-signed certificate. It is <strong>not recommended</strong> for you to leave this option checked in production.
					</p>
				</label>
			</div>
		</div>
	</div>
</form>

<div class="row">
	<div class="col-lg-12">
		<h4>Webhooks</h4>
		<p>Click <a target="_blank" href="https://github.com/NodeBB/NodeBB/wiki/Hooks">here</a> for available hooks.</p>
		<div class="table-responsive">
			<table class="table table-striped">
				<thead>
					<tr>
						<th>Hook Name</th>
						<th>End Point</th>
						<th></th>
					</tr>
				</thead>
				<tbody id="hooks-parent">
					<!-- BEGIN hooks -->
					<tr>
						<td class="col-md-3">
							<input class="hook-name form-control" value="{hooks.name}" />
						</td>
						<td class="col-md-8">
							<input class="hook-endpoint form-control" value="{hooks.endpoint}" />
						</td>
						<td class="col-md-1">
							<button class="hook-remove btn btn-danger">Remove</button>
						</td>
					</tr>
					<!-- END hooks -->
				</tbody>
			</table>
		</div>
		<div class="pull-right">
			<button id="add-hook" class="btn btn-success"><i class="fa fa-plus"></i> Add Hook</button>
		</div>
	</div>
</div>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>

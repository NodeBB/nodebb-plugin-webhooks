<div class="acp-page-container">
	<!-- IMPORT admin/partials/settings/header.tpl -->

	<div class="row m-0">
		<div id="spy-container" class="col-12 px-0 mb-4" tabindex="0">

			<form role="form" class="webhooks-settings">
				<h5 class="fw-bold tracking-tight settings-header">Security</h5>

				<div class="mb-3">
					<label class="form-label" for="secret">Signature Verification Secret</label>
					<input type="text" id="secret" name="secret" title="Signature Verification Secret" class="form-control" placeholder="mye3cr37p@55w0r[)">
					<p class="form-text">
						If set, then a header <code>x-webhook-signature</code> will be sent with the web hook. The value of this header is a `sha1` HMAC of the payload. To verify that the payload sender is authenticated, run the HMAC with this shared secret and ensure the hashes match.
					</p>
				</div>

				<div class="mb-3">
					<div class="form-check form-switch">
						<input class="form-check-input" id="noStrictSSL" type="checkbox" name="noStrictSSL" />
						<label class="form-check-label" for="noStrictSSL">Disable strict verification of SSL certificates</label>
					</div>
					<p class="form-text">
						This is helpful if you are testing with a self-signed certificate. It is <strong>not recommended</strong> for you to leave this option checked in production.
					</p>
				</div>
			</form>

			<div class="row">
				<div class="col-12">
					<h5 class="fw-bold tracking-tight settings-header">Webhooks</h5>
					<p>Click <a target="_blank" href="https://github.com/NodeBB/NodeBB/wiki/Hooks">here</a> for available hooks.</p>
					<div class="table-responsive">
						<table class="table">
							<thead>
								<tr>
									<th>Hook Name</th>
									<th>End Point</th>
									<th></th>
								</tr>
							</thead>
							<tbody id="hooks-parent">
								{{{ each hooks }}}
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
								{{{ end }}}
							</tbody>
						</table>
					</div>
					<div class="text-end">
						<button id="add-hook" class="btn btn-success"><i class="fa fa-plus"></i> Add Hook</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>






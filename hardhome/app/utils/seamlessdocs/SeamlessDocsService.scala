package utils.seamlessdocs

import java.net.URL

import play.api.libs.json.JsValue

import scala.concurrent.Future
import scala.util.Try

/**
 * Preparing Document
 * Document preparation is similar to a basic submission. The difference is that it does initiate a signature workflow.
 * *
 * API does not allow users to eSign the document, but it does allow to prepare the fields for the future signers using form/prepare method, initiating signature workflow for a form.
 * *
 * Here's an example of a form/prepare request:
 * *
 * Text
 * POST /api/form/<form_id>/prepare HTTP/1.1
 * Host: api.sandbox.seamlessdocs.com
 * Content-Type: application/json
 * Date: <timestamp>
 * Authorization: HMAC-SHA256 Api_key=<api_key> Signature=<signature>
 * *
 * {
 * "legal_name": "John Doe",
 * "gender": "Male",
 * ...
 * <some_other_field>: <some_value>,
 * ...
 * "signer_data": {
 * "fullname": "City Clerk",
 * "email":"preparer@example.com"
 * },
 * "recipients": {
 * "71f0d6844867a206d837f6728ddb545b": {
 * "fullname": "John Doe",
 * "email": "johndoe@example.com"
 * }
 * }
 * }
 * Notice the additional nodes in the request body:
 * *
 * signer_data (optional) containing custom credentials of a person preparing a document
 * recipients (optional) containing full name and email of next signer(s)
 * When custom signer_data is missing, user account credentials (based on provided API key) will be used instead.
 * *
 * Updating existing Signers
 * Signers info can be dynamically updated by including the information into recipients node.
 * *
 * Important
 * *
 * Updating signer info is not possible for Known (predefined) signers, but it is required for Unknown (user-defined) signers. Making sure that they receive an invite to sign a prepared document.
 * *
 * Existing signer may only be referred using signer_keys (See example below)
 * *
 * JSON
 * {
 * "recipients": {
 * "71f0d6844867a206d837f6728ddb545b": {
 * "fullname": "John Doe",
 * "email": "johndoe@example.com"
 * }
 * }
 * }
 * Error will be triggered when signer key is not found.
 * *
 * When no other signers are set up in a document and recipient_info is missing, your submission will be considered complete (making it impossible to proceed any further on this application).
 * *
 * Multiple (unknown) signers can be updated at once, referenced by a signer key, if they are defined in a form.
 * *
 * Creating new Signer
 * It is also possible to prepare a document for a non-existing signer. Signer will be dynamically added along with submission.
 * *
 * New signer will be considered as a part of a workflow, even though, not requiring a signature.
 * *
 * Important
 * *
 * Non-existing signer can only referred to as prepared_for using form/prepare method (See example below).
 * *
 * JSON
 * "recipients": {
 * "prepared_for": {
 * "fullname": "John Doe",
 * "email": "johndoe@example.com"
 * }
 * }
 * The only two field required to create a new signer are fullname and email.
 * *
 * Only one "prepared for" type signer is allowed.
 * *
 * The complete request will look like this:
 * *
 * Text
 * POST /api/form/<form_id>/prepare HTTP/1.1
 * Host: api.sandbox.seamlessdocs.com
 * Content-Type: application/json
 * Date: <timestamp>
 * Authorization: HMAC-SHA256 Api_key=<api_key> Signature=<signature>
 * *
 * {
 * "legal_name": "John Doe",
 * "gender": "Male",
 * ...
 * <some_other_field>: <some_value>,
 * ...
 * "signer_data": {
 * "fullname": "City Clerk",
 * "email":"preparer@example.com"
 * },
 * "recipients": {
 * "prepared_for": {
 * "fullname": "John Doe",
 * "email": "johndoe@example.com"
 * }
 * }
 * }
 *
 *
 *
 *
 *
 * By default, after a form has been successfully submitted, a submission PDF is generated and emails being sent inviting other signers in the workflow to complete the prepared document.
 * *
 * You may disable these actions by adding submission_settings node to your submit request.
 * *
 * As of current API version, the allowed settings are:
 * *
 * skip_pdf_update: boolean
 * skip_email_invites: boolean
 * EXAMPLE
 * Text
 * POST /api/form/<form_id>/prepare HTTP/1.1
 * Host: api.sandbox.seamlessdocs.com
 * Content-Type: application/json
 * Date: <timestamp>
 * Authorization: HMAC-SHA256 Api_key=<api_key> Signature=<signature>
 * *
 * {
 * "legal_name": "John Doe",
 * "gender": "Male",
 * ...
 * <some_other_field>: <some_value>,
 * ...
 * "signer_data": {
 * "fullname": "City Clerk",
 * "email":"preparer@example.com"
 * },
 * "recipients": {
 * "prepared_for": {
 * "fullname": "John Doe",
 * "email": "johndoe@example.com"
 * }
 * }
 * "submission_settings": {
 * "skip_pdf_update": true,
 * "skip_email_invites": true
 * }
 * }
 */
trait SeamlessDocsService {

  /**
   *
   * Document preparation is similar to a basic submission. The difference is that it does initiate a signature workflow.
   * *
   * API does not allow users to eSign the document, but it does allow to prepare the fields for the future signers using form/prepare method, initiating signature workflow for a form.
   * *
   * Here's an example of a form/prepare request:
   *
   * Request:
   *
   * {
   * "legal_name": "John Doe",
   * "birth_date": "June 2, 1978",
   * "gender": "Male",
   * "signer_data": {
   * "fullname": "City Clerk",
   * "email":"preparer@example.com"
   * },
   * "recipients": {
   * "71f0d6844867a206d837f6728ddb545b": {
   * "fullname": "John Doe",
   * "email": "johndoe@example.com"
   * }
   * }
   * }
   *
   * Response:
   *
   * {
   * "result": true,
   * "application_id": "AP15021000011409822",
   * "description": "Submission successful"
   * }
   *
   * Error response:
   *
   * {
   * "result": false,
   * "error_log": [
   * {
   * "error_code": "submission_halt",
   * "error_message": "Error executing signature workflow: Unable to find recipient info of the next signer '71f0d6844867a206d837f6728ddb545b'",
   * "error_description": "submission:execute"
   * }
   * ]
   * }
   *
   *
   * https://sandbox.seamlessdocs.com/api/form/:form_id/prepare
   *
   * @return
   */
  def formPrepare(formId: String, name: String, email: String, data: Map[String, JsValue]): Future[Try[SeamlessApplicationCreateResponse]]

  /**
   * https://sandbox.seamlessdocs.com/api/application/:application_id/get_invite_url
   *
   * @return
   */
  def getInviteUrl(applicationId: String): Future[Try[URL]]

  /**
   *
   *
   * https://sandbox.seamlessdocs.com/api/application/:application_id
   *
   * @return
   *
   *
   * {
   * "modified_ts": "2015-09-25 22:40:51.281342",
   * "created_ts": "2015-09-25 22:40:42.709018",
   * "application_id": "AP15091000010170784",
   * "form_id": "CO15081000010137483",
   * "user_id": null,
   * "notes": null,
   * "is_active": "t",
   * "application_data": {
   * "some_input": {
   * "input_name": "some_input",
   * "raw_value": "abc",
   * "label": "Some Input Field"
   * },
   * "another_input": {
   * "input_name": "another_input",
   * "raw_value": "def",
   * "label": "Another Input Field"
   * }
   * },
   * "pdf_cloud_file_id": null,
   * "user_agent_xml": [],
   * "geo_data_xml": {
   * "continent_code": "NA",
   * "country_code": "US",
   * "country_code3": "USA",
   * "country_name": "United States",
   * "region": "FL",
   * "city": "Miami",
   * "postal_code": "33125",
   * "latitude": "25.782899856567",
   * "longitude": "-80.239501953125",
   * "dma_code": "528",
   * "area_code": "305",
   * "ip_address": "73.46.132.58"
   * },
   * "referrer_url": "https://www.seamlessdocs.com",
   * "ip_address": "73.46.132.58",
   * "submission_pdf_url": "http://dev-cdn.seamlessdocs.com/sig_files/201509/Form_For_Testing_1FURGp44U2xMXN.pdf",
   * "field_positions_xml": [],
   * "group_id": null,
   * "overrides_xml": [],
   * "submission_file_urls": [
   * "http://dev-cdn.seamlessdocs.com/sig_files/201509/Form_For_Testing_1FURGp44U2xMXN.tiff"
   * ],
   * "is_incomplete": null
   * }
   *
   * modified_ts
   * *
   * Timestamp
   * *
   * Timestamp in account's default timezone, when application was updated or resumed.
   * *
   * created_ts
   * *
   * Timestamp
   * *
   * Timestamp in account's default timezone, when application was first submitted.
   * *
   * application_id
   * *
   * String
   * *
   * Unique Submission identifier.
   * *
   * form_id
   * *
   * String
   * *
   * Unique Form identifier
   * *
   * user_id
   * *
   * String
   * *
   * Unique User identifier. Will be null when the user was not logged in with SeamlessDocs during submission.
   * *
   * notes
   * *
   * String
   * *
   * Miscellaneous notes about the submission
   * *
   * is_active
   * *
   * 't' or 'f'
   * *
   * Internal use
   * *
   * application_data
   * *
   * Array
   * *
   * List of submitted fields and their values with some additional parameters. Read Application Data article for more info.
   * *
   * pdf_cloud_file_id
   * *
   * null
   * *
   * Deprecated
   * *
   * user_agent_xml
   * *
   * Array
   * *
   * Optional information about submitter's browser and OS environment.
   * *
   * geo_data_xml
   * *
   * Array
   * *
   * Optional information about submitter's geo location based on IP address.
   * *
   * referrer_url
   * *
   * URL
   * *
   * Optional URL of a page or host that referred user to a Form's live view before it was submitted.
   * *
   * ip_address
   * *
   * String
   * *
   * Submitter's IP address
   * *
   * submission_pdf_url
   * *
   * URL
   * *
   * URL of a generated submission PDF document.
   * *
   * field_positions_xml
   * *
   * Array
   * *
   * Contains information about quick-sign fields, if used.
   * *
   * group_id
   * *
   * null
   * *
   * Deprecated
   * *
   * overrides_xml
   * *
   * Array
   * *
   * List of overridden fields. Read Overriding Fields for more info.
   * *
   * submission_file_urls
   * *
   * Array
   * *
   * List of additionally generated submission files, such as TIFF, PNG etc (defined in Form settings)
   * *
   * is_incomplete
   * *
   * 't' of 'f'
   * *
   * Returns 't' if submission progress was saved for future completion.
   *
   */
  def getApplication(applicationId: String): Future[Try[SeamlessApplication]]

  /**
   * https://sandbox.seamlessdocs.com/api/application/:application_id/update_pd
   * @param applicationId
   * @param data
   * @return
   */
  def updatePdf(applicationId: String, data: Map[String, JsValue]): Future[Try[SeamlessResponse]]
}

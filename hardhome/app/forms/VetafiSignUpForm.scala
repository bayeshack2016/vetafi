package forms

import play.api.data.Form
import play.api.data.Forms._

/**
 * Form for creating an email username/password.
 */
object VetafiSignUpForm {
  /**
   * A play framework form.
   */
  val form = Form(
    mapping(
      "email" -> email,
      "password" -> nonEmptyText
    )(Data.apply)(Data.unapply)
  )

  /**
   * The form data.
   *
   * @param email The email of the user.
   * @param password The password of the user.
   */
  case class Data(
    email: String,
    password: String
  )
}

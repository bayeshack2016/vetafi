package utils.forms

import com.google.inject.Inject
import models.FormConfig
import play.Configuration
import play.api.Logger
import scala.collection.JavaConversions._
import play.api.libs.json._

/**
  * FormConfigManager backed by JSON files in the project resources.
  */
class JsonResourceFormConfigManager @Inject() (configuration: Configuration) extends FormConfigManager {

  def loadFormConfigFromResource(formKey: String): FormConfig = {
    val inputStream = getClass.getClassLoader.getResource(
      s"${configuration.getString("forms.dir")}/${formKey}.json").openStream()
    val result: JsResult[FormConfig] = Json.parse(inputStream).validate[FormConfig]

    result.fold(
      errors => {
        val msg = s"Errors while parsing form config JSON at ${configuration.getString("forms.dir")}/$formKey: ${errors.toString}"
        Logger.error(msg)
        throw new RuntimeException(msg)
      },
      formConfig => {
        formConfig
      }
    )
  }

  lazy val formConfigs: Map[String, FormConfig] = {
    val enabledForms = configuration.getStringList("forms.enabled")
    enabledForms.map(
      (formKey: String) => {
        (formKey, loadFormConfigFromResource(formKey))
      }
    ).toMap
  }

  override def getFormConfigs: Map[String, FormConfig] = formConfigs
}

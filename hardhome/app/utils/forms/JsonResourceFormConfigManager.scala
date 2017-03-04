package utils.forms
import java.io.InputStreamReader
import java.net.URL
import java.nio.file.{Files, Path, Paths}
import java.util

import com.google.inject.Inject
import models.FormConfig
import play.Configuration
import play.api.Logger
import play.api.libs.json.{JsResult, Json}
import scala.collection.JavaConversions._

/**
  * FormConfigManager backed by JSON files in the project resources.
  */
class JsonResourceFormConfigManager @Inject() (configuration: Configuration) extends FormConfigManager {

  def loadFormConfigFromResource(formKey: String): FormConfig = {
    val inputStream = getClass.getClassLoader.getResource(
      s"${configuration.getString("formsDir")}/$formKey").openStream()
    val result: JsResult[FormConfig] = Json.parse(inputStream).validate[FormConfig]

    result.fold(
      errors => {
        val msg = s"Errors while parsing form config JSON at ${configuration.getString("formsDir")}/$formKey: ${errors.toString}"
        Logger.error(msg)
        throw new RuntimeException(msg)
      },
      formConfig => {
        formConfig
      }
    )
  }

  override def getFormConfigs: Map[String, FormConfig] = {
    val enabledForms = configuration.getStringList("enabledForms")
    enabledForms.map(
      (formKey: String) => {
        (formKey, loadFormConfigFromResource(formKey))
      }
    ).toMap
  }
}

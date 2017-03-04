package utils.forms

import models.FormConfig

/**
  * Manage FormConfig objects and define the set of forms for the app.
  */
trait FormConfigManager {

  def getFormConfigs: Map[String, FormConfig]
}

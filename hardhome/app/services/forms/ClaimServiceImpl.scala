package services.forms

import java.util
import javax.script.{ScriptEngine, ScriptEngineManager, SimpleBindings}

import com.google.inject.Inject
import models.{ClaimForm, Field, FormConfig}
import play.api.libs.json.JsValue
import utils.JsonUnbox

/**
 * ClaimService backed by FormConfig
 */
class ClaimServiceImpl @Inject() (formConfigManager: FormConfigManager) extends ClaimService {

  val engine: ScriptEngine = new ScriptEngineManager().getEngineByMimeType("text/javascript")

  override def calculateProgress(claimForm: ClaimForm): ClaimForm = {
    if (!formConfigManager.getFormConfigs.contains(claimForm.key)) {
      throw new IllegalArgumentException(s"Form not enabled: ${claimForm.key}")
    }

    val formConfig: FormConfig = formConfigManager.getFormConfigs(claimForm.key)

    val optionalQuestions: Int = formConfig.fields.count(_.templateOptions.optional)
    val requiredQuestions: Int = formConfig.fields.count(shouldBeAnswered(claimForm.responses))

    val answeredOptional: Int = formConfig.fields.count(
      (field: Field) => field.templateOptions.optional && claimForm.responses.contains(field.key)
    )
    val answeredRequired: Int = formConfig.fields.count(
      (field: Field) => !field.templateOptions.optional && claimForm.responses.contains(field.key)
    )

    claimForm.copy(
      optionalQuestions = optionalQuestions,
      requiredQuestions = requiredQuestions,
      answeredRequired = answeredRequired,
      answeredOptional = answeredOptional
    )
  }

  def shouldBeAnswered(data: Map[String, JsValue])(field: Field): Boolean = {
    if (field.hideExpression.isEmpty && !field.templateOptions.optional) {
      true
    } else if (field.templateOptions.optional) {
      false
    } else {
      // SimpleBindings seems to require a real java HashMap.
      val model = new util.HashMap[String, Object]
      data.foreach { x => model.put(x._1, JsonUnbox.unbox(x._2)) }

      val bindings = new util.HashMap[String, Object]
      bindings.put("model", model)

      val jsExpressionEval: AnyRef = engine.eval(
        field.hideExpression.get, new SimpleBindings(bindings)
      )
      jsExpressionEval.asInstanceOf[Boolean]
    }
  }
}

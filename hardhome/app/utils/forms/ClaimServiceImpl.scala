package utils.forms

import java.util
import javax.script.{ ScriptEngine, ScriptEngineManager, SimpleBindings }

import com.google.inject.Inject
import models.{ ClaimForm, Field, FormConfig }
import play.api.libs.json.{ JsBoolean, JsNumber, JsString, JsValue }

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

    val optionalQuestions: Int = formConfig.fields.count(_.optional)
    val requiredQuestions: Int = formConfig.fields.count(shouldBeAnswered(claimForm.responses))

    val answeredOptional: Int = formConfig.fields.count(
      (field: Field) => field.optional && claimForm.responses.contains(field.key)
    )
    val answeredRequired: Int = formConfig.fields.count(
      (field: Field) => !field.optional && claimForm.responses.contains(field.key)
    )

    claimForm.copy(
      optionalQuestions = optionalQuestions,
      requiredQuestions = requiredQuestions,
      answeredRequired = answeredRequired,
      answeredOptional = answeredOptional
    )
  }

  def shouldBeAnswered(data: Map[String, JsValue])(field: Field): Boolean = {
    if (field.hideExpression.isEmpty && !field.optional) {
      true
    } else if (field.optional) {
      false
    } else {
      // SimpleBindings seems to require a real java HashMap.
      val bindings = new util.HashMap[String, Object]
      data.foreach { x => bindings.put(x._1, unbox(x._2)) }

      val jsExpressionEval: AnyRef = engine.eval(
        field.hideExpression.get, new SimpleBindings(bindings)
      )
      jsExpressionEval.asInstanceOf[Boolean]
    }
  }

  def unbox(value: JsValue): Object = {
    value match {
      case string: JsString => string.value.asInstanceOf[Object]
      case bool: JsBoolean => bool.value.asInstanceOf[Object]
      case number: JsNumber => number.value.asInstanceOf[Object]
      case _ => throw new IllegalArgumentException(value.toString())
    }
  }
}

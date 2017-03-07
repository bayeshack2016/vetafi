package utils

import play.api.libs.json.{JsBoolean, JsNumber, JsString, JsValue}

object JsonUnbox {

  def unbox(value: JsValue): Object = {
    value match {
      case string: JsString => string.value.asInstanceOf[Object]
      case bool: JsBoolean => bool.value.asInstanceOf[Object]
      case number: JsNumber => number.value.asInstanceOf[Object]
      case _ => throw new IllegalArgumentException(value.toString())
    }
  }
}

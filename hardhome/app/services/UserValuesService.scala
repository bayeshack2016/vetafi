package services

import models.{ User, UserValues }

/**
 * Service for populating user values based on a users account information.
 * For example, this class will make sure if OAuth provides answers to some
 * user values, we populate them into that user's values.
 */
trait UserValuesService {

  def updateUserValues(user: User, userValues: UserValues): UserValues
}

/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {


  /**
   *
   * API Gateway
   *
   */

  /**
   * Admin
   */

  'APIGateway/Admin2/AppRegistryController': {
    // always add this default policy for all actions not listed here to prevent unauthorized access
    '*': [
      'APIGateway/defaultAccessDeniedPolicy'
    ],
    createKPI: [
      'APIGateway/Admin/isUserAuthorized',
      'APIGateway/Admin/Permissions/adminAccess',
      'APIGateway/Admin/Permissions/kpi/appKpiCreate'
    ],
    createSmartFilter: [
      'APIGateway/Admin/isUserAuthorized',
      'APIGateway/Admin/Permissions/adminAccess',
      'APIGateway/Admin/Permissions/smartFilter/appSmartFilterCreate'
    ],
    createAchievement: [
      'APIGateway/Admin/isUserAuthorized',
      'APIGateway/Admin/Permissions/adminAccess',
      'APIGateway/Admin/Permissions/achievement/appAchievementCreate'
    ],
    createMechanicalAchievement: [
      'APIGateway/Admin/isUserAuthorized',
      'APIGateway/Admin/Permissions/adminAccess',
      'APIGateway/Admin/Permissions/mechanicalAchievement/appMechanicalAchievementCreate'
    ],
    findKPIWithUsersAndStores: [
      'APIGateway/Admin/isUserAuthorized',
      'APIGateway/Admin/Permissions/adminAccess',
      'APIGateway/Admin/Permissions/kpi/appKpiRead'
    ],
    findAchievementWithUsersAndStores: [
      'APIGateway/Admin/isUserAuthorized',
      'APIGateway/Admin/Permissions/adminAccess',
      'APIGateway/Admin/Permissions/achievement/appAchievementRead'
    ],
    findMechanicalAchievementWithUsers: [
      'APIGateway/Admin/isUserAuthorized',
      'APIGateway/Admin/Permissions/adminAccess',
      'APIGateway/Admin/Permissions/mechanicalAchievement/appMechanicalAchievementRead'
    ],
    updateKPI: [
      'APIGateway/Admin/isUserAuthorized',
      'APIGateway/Admin/Permissions/adminAccess',
      'APIGateway/Admin/Permissions/kpi/appKpiUpdate'
    ],
    updateAchievement: [
      'APIGateway/Admin/isUserAuthorized',
      'APIGateway/Admin/Permissions/adminAccess',
      'APIGateway/Admin/Permissions/achievement/appAchievementUpdate'
    ],
    updateMechanicalAchievement: [
      'APIGateway/Admin/isUserAuthorized',
      'APIGateway/Admin/Permissions/adminAccess',
      'APIGateway/Admin/Permissions/mechanicalAchievement/appMechanicalAchievementUpdate'
    ],
    removeKPI: [
      'APIGateway/Admin/isUserAuthorized',
      'APIGateway/Admin/Permissions/adminAccess',
      'APIGateway/Admin/Permissions/kpi/appKpiDelete'
    ],
    removeAchievement: [
      'APIGateway/Admin/isUserAuthorized',
      'APIGateway/Admin/Permissions/adminAccess',
      'APIGateway/Admin/Permissions/achievement/appAchievementDelete'
    ],
    removeMechanicalAchievement: [
      'APIGateway/Admin/isUserAuthorized',
      'APIGateway/Admin/Permissions/adminAccess',
      'APIGateway/Admin/Permissions/mechanicalAchievement/appMechanicalAchievementDelete'
    ]
  }


};

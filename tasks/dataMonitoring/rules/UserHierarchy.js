'use strict';

let _ = require('lodash');

function checkUserParentChains(userParents, logger) {
  let listOfHierarchiesWithLoop = [];

  userParents.forEach(userParent => {
    let hierarchyIds = checkHierarchy(userParent, userParents);

    if (!_.isEmpty(hierarchyIds)) {
      listOfHierarchiesWithLoop.push({id: userParent.userId, hierarchyIds});
    }
  });

  // see "_getPureList" description
  _getPureList(listOfHierarchiesWithLoop).forEach(listItem => {
    // replace adapter name from id
    let idsWithoutAdapterName = listItem.hierarchyIds.map(id => id.replace(/^[^\_]+_/, ''));

    logger.addLog(listItem.id, `This parent user has loop in hierarchy "${idsWithoutAdapterName.join(' -> ')}"`);
  });
}

/**
 * This function recursive moving from parent to children and returns ids hierarchy, which has doubles or null
 *
 * @param {object}    item
 * @param {object[]}  itemsList
 * @param {string[]}  existsIdsInHierarchy
 *
 * @returns {string[]|null}
 */
function checkHierarchy(item, itemsList, existsIdsInHierarchy = []) {
  //eslint-disable-next-line no-magic-numbers
  if (existsIdsInHierarchy.indexOf(item.userId) !== -1) {
    existsIdsInHierarchy.push(item.userId);
    return existsIdsInHierarchy;
  }

  existsIdsInHierarchy.push(item.userId);

  let filteredItems = _.filter(itemsList, {parentId: item.userId});

  for (let filteredItem of filteredItems) {
    let hierarchyIds = checkHierarchy(filteredItem, itemsList, _.clone(existsIdsInHierarchy));

    // If nested call returns non empty array, then need to break loop and return it
    if (!_.isEmpty(hierarchyIds)) {
      return hierarchyIds;
    }
  }
  return null;
}


/**
 * Returns array without doubles
 *
 * When we have hierarchy (bigger than 2 level) with loop it means we can find this loop many times from each included item.
 * In this case we have many records with same ids in list, but with different order.
 * Also can get different ids list, but many items may include other totally (it still means that we have only one loop, but several parents)
 * So, this function cleans hierarchies list thereby in order to get unique records with little as possible ids list
 *
 * @param   {string[]}  list
 * @returns {array}
 */
function _getPureList(list) {
  /*
   * list without same hierarchies loops
   * for example: ['west-232', 'isdd', 323', 'west-232'] and ['isdd', '323', 'west-232', 'isdd'] that's same hierarchies build from different parents
   */
  let listWithoutDoubles = _.filter(list, (currentItem, currentIndex) => {
    return !_(list)
      .slice(currentIndex + 1)
      .find(item => !_.difference(item.hierarchyIds, currentItem.hierarchyIds).length && !_.difference(currentItem.hierarchyIds, item.hierarchyIds).length);
  });

  /*
   * list without nasted hierarchies loops
   * for exampe: hierarchy ['west-232', 'sssw', '333', '333'] include hierarchy ['333', '333']
   */
  return _.filter(listWithoutDoubles, (currentItem, currentIndex) => {
    return !_.find(listWithoutDoubles, (item, index) => {
      return !_.isEqual(currentIndex, index) && _(item.hierarchyIds).difference(currentItem.hierarchyIds).isEmpty();
    });
  });
}

module.exports.run = function(DataExtractor, Logger) {
  let logger = new Logger('User');
  let userQuery = {
    attributes: ['id', 'userId', 'parentId']
  };

  return DataExtractor.getModelData('UserParent', userQuery).then(userParents => {
    checkUserParentChains(userParents, logger);
    return logger.saveData();
  });
};

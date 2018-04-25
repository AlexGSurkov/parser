'use strict';
/* eslint-disable */
const phantom = require('phantom'),
  lines = require('./api/services/adapters/index');

const {maersk, cmacgm, zim} = lines,
  //line = new maersk();
  //line = new cmacgm();
  line = new zim();

(async (searchNumber) => {
  try {
    const result = await line.search(searchNumber);

    if (result) {
      Object.keys(result).forEach(key => {
        key != 'containers' ? console.log(`${key}: ${result[key]}`) :
          result[key].forEach(container => Object.keys(container).forEach(contKey => {
            contKey != 'locations' ? console.log(`${contKey}: ${container[contKey]}`) :
              container[contKey].forEach((location, idx) => {
                console.log(`location[${idx}]: `, location)
                //console.log(location.states[0].state);
      });
    }));
      });
    }
    console.log('done');
  } catch (e) {
    //console.log(`Error: "${e.message}"`);
    console.log(e);
  } finally {
    await line.exit();
  }
})
//('CAIU9295033'); //CMACGM container
//('CRSU9304248'); //CMACGM container
//('OEA0141159'); //CMACGM bill of lading (1 container)
//('OEA0141165'); //CMACGM bill of lading (2 containers)
//('575487755'); //Maersk bill of lading (1 container)
//('963927550'); //Maersk bill of lading (5 containers)
//('ZIMUNGB1025694'); //ZIM bill of lading (1 container)
//('ZIMUNGB1025714'); //ZIM bill of lading (2 containers)
('DFSU6496421'); //ZIM container
/* eslint-enable */

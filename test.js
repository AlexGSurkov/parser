'use strict';
/* eslint-disable */
const //phantom = require('phantom'),
  lines = require('./api/services/adapters/index');

const {maersk, cmacgm, zim, msc} = lines,
  //line = new maersk();
  //line = new cmacgm();
  line = new zim();
  //line = new msc();

(async (searchNumber) => {
  try {
    const result = await line.search(searchNumber);

    console.log(result);

    if (result) {
      Object.keys(result).forEach(key => {
        key != 'containers' ? console.log(`${key}: ${result[key]}`) :
          result[key].forEach(container => Object.keys(container).forEach(contKey => {
            contKey != 'locations' ? console.log(`${contKey}: ${container[contKey]}`) :
              container[contKey].forEach((location, idx) => {
                console.log(`location[${idx}]: `, location)
                console.log(location.states[location.states.length - 1].state);
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
//('582196600'); //Maersk bill of lading (3 containers)
//('582196601'); //Maersk bill of lading (11 containers)
//('982196601'); //Maersk bill of lading (no results)
//('MRKU7007504'); //Maersk 1 container
//('ZIMUNGB1025694'); //ZIM bill of lading (1 container)
//('ZIMUNGB1025714'); //ZIM bill of lading (2 containers)
//('ZIMUOSS802832'); //ZIM bill of lading (4 containers)
//('ZIMUOSS802805'); //ZIM bill of lading (3 containers)
//('DRYU9661489'); //ZIM container
('ZIMUOSS803086'); //ZIM bill of lading (0 containers)
//('539INTRA1800096'); //MSC boocking (21 containers)
//('MSCUO2566823'); //MSC bill of lading (5 containers)
/* eslint-enable */

'use strict';
/* eslint-disable */
const //phantom = require('phantom'),
  lines = require('./api/services/adapters/index');

const {maersk, cmacgm, zim, msc, cosco, hapag} = lines,
  line = new maersk();
  //line = new cmacgm();
  //line = new zim();
  //line = new msc();
  //line = new cosco();
  //line = new hapag();

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
//('965934754'); //Maersk bill of lading (1 container)
//('965847696'); //Maersk bill of lading (6 containers)
//('965941966'); //Maersk bill of lading (2 containers)
//('982196601'); //Maersk bill of lading (no results)
//('965925131'); //Maersk bill of lading (1 container)
('MRKU7007504'); //Maersk 1 container
//('ZIMUNGB1025694'); //ZIM bill of lading (1 container)
//('ZIMUNGB1025714'); //ZIM bill of lading (2 containers)
//('ZIMUOSS802832'); //ZIM bill of lading (4 containers)
//('ZIMUOSS802805'); //ZIM bill of lading (3 containers)
//('DRYU9661489'); //ZIM container
//('ZIMUOSS803086'); //ZIM bill of lading (0 containers)
//('539INTRA1800096'); //MSC boocking (21 containers)
//('MSCUO2566823'); //MSC bill of lading (5 containers)
//('9002818620'); //COSCO boocking (2 containers)
//('9002818650'); //COSCO bill of lading (5 containers)
//('FCIU7204412'); //COSCO container
//('54712750'); //HAPAG boocking (8 containers)
//('HLCUANR180371145'); //HAPAG bill of lading (2 containers)
//('CAIU9418056'); //container
/* eslint-enable */

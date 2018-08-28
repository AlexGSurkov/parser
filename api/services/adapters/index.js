const maersk = require('./lineMaerskApi'),
  //maersk = require('./lineMaersk'),
  cmacgm = require('./lineCmaCgm'),
  zim = require('./lineZIM'),
  msc = require('./lineMSC'),
  cosco = require('./lineCoscoApi');
  //cosco = require('./lineCosco'),
  //hapag = require('./lineHapag');

module.exports = {
  maersk,
  cmacgm,
  zim,
  msc,
  cosco
  //hapag
};

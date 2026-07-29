const fs = require('fs');
const file = fs.readFileSync('src/data/sampleRoster.ts', 'utf8');

const columns = [
  { id: 'c-sd-und', brand: 'SmackDown', titleName: 'Undisputed WWE Championship' },
  { id: 'c-sd-us', brand: 'SmackDown', titleName: 'Men\'s United States Championship' },
  { id: 'c-sd-wwe', brand: 'SmackDown', titleName: 'WWE Women\'s Championship' },
  { id: 'c-sd-wus', brand: 'SmackDown', titleName: 'Women\'s United States Championship' },
  { id: 'c-sd-tag', brand: 'SmackDown', titleName: 'WWE Tag Team Championship' },
  { id: 'c-raw-whc', brand: 'RAW', titleName: 'World Heavyweight Championship' },
  { id: 'c-raw-ic', brand: 'RAW', titleName: 'Men\'s Intercontinental Championship' },
  { id: 'c-raw-wwc', brand: 'RAW', titleName: 'Women\'s World Championship' },
  { id: 'c-raw-wic', brand: 'RAW', titleName: 'Women\'s Intercontinental Championship' },
  { id: 'c-raw-tag', brand: 'RAW', titleName: 'World Tag Team Championship' },
  { id: 'c-nxt-nxt', brand: 'NXT', titleName: 'NXT Championship' },
  { id: 'c-nxt-na', brand: 'NXT', titleName: 'Men\'s NXT NA Championship' },
  { id: 'c-nxt-wnxt', brand: 'NXT', titleName: 'NXT Women\'s Championship' },
  { id: 'c-nxt-wna', brand: 'NXT', titleName: 'Women\'s NXT NA Championship' },
  { id: 'c-nxt-tag', brand: 'NXT', titleName: 'NXT Tag Team Championship' },
  { id: 'c-joint-wtag', brand: 'Joint', titleName: 'WWE Women\'s Tag Team Championship' }
];

let modified = file;

modified = modified.replace(/raw: \{ whc: (.*?), ic: (.*?), tag: (.*?), wwc: (.*?), wic: (.*?) \},\s*sd: \{ und: (.*?), us: (.*?), tag: (.*?), wwe: (.*?), wus: (.*?) \},\s*nxtMonth: (.*?),\s*nxtPle: (.*?),\s*nxt: \{ nxt: (.*?), na: (.*?), tag: (.*?), wnxt: (.*?), wna: (.*?) \},\s*joint: \{ wtag: (.*?) \}/g, (match, rwhc, ric, rtag, rwwc, rwic, sund, sus, stag, swwe, swus, nxtM, nxtP, nnxt, nna, ntag, nwnxt, nwna, jwtag) => {
  return `nxtMonth: ${nxtM},
    nxtPle: ${nxtP},
    champions: {
      'c-raw-whc': ${rwhc},
      'c-raw-ic': ${ric},
      'c-raw-tag': ${rtag},
      'c-raw-wwc': ${rwwc},
      'c-raw-wic': ${rwic},
      'c-sd-und': ${sund},
      'c-sd-us': ${sus},
      'c-sd-tag': ${stag},
      'c-sd-wwe': ${swwe},
      'c-sd-wus': ${swus},
      'c-nxt-nxt': ${nnxt},
      'c-nxt-na': ${nna},
      'c-nxt-tag': ${ntag},
      'c-nxt-wnxt': ${nwnxt},
      'c-nxt-wna': ${nwna},
      'c-joint-wtag': ${jwtag}
    }`;
});

// For INITIAL_EMPTY_MATRIX mapping replace the specific mapping code
modified = modified.replace(/raw: \{ whc: '', ic: '', tag: '', wwc: '', wic: '' \},[\s\S]*?joint: \{ wtag: '' \}/, `champions: {
      'c-raw-whc': '',
      'c-raw-ic': '',
      'c-raw-tag': '',
      'c-raw-wwc': '',
      'c-raw-wic': '',
      'c-sd-und': '',
      'c-sd-us': '',
      'c-sd-tag': '',
      'c-sd-wwe': '',
      'c-sd-wus': '',
      'c-nxt-nxt': '',
      'c-nxt-na': '',
      'c-nxt-tag': '',
      'c-nxt-wnxt': '',
      'c-nxt-wna': '',
      'c-joint-wtag': ''
    }`);

if (!modified.includes('export const INITIAL_MATRIX_COLUMNS')) {
  modified = modified.replace('export const INITIAL_HISTORY_MATRIX', `export const INITIAL_MATRIX_COLUMNS: MatrixColumn[] = ${JSON.stringify(columns, null, 2).replace(/"/g, "'")};\n\nexport const INITIAL_HISTORY_MATRIX`);
}

if (!modified.includes('matrixColumns: INITIAL_MATRIX_COLUMNS')) {
  modified = modified.replace('historyMatrix: INITIAL_HISTORY_MATRIX,', `historyMatrix: INITIAL_HISTORY_MATRIX,\n  matrixColumns: INITIAL_MATRIX_COLUMNS,`);
}

fs.writeFileSync('src/data/sampleRoster.ts', modified);
console.log('Migration complete');

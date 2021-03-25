import fs from 'fs'
import acquit from 'acquit'

function generateTestBasedDocs(filePath) {
  let content = fs.readFileSync(filePath).toString();

  // Parse the contents of the test file into acquit 'blocks'
  let blocks = acquit.parse(content);

  let header = fs.readFileSync('./.github/HEADER.md').toString();

  let mdOutput = header + '\n\n';

  // For each describe() block
  for (let i = 0; i < blocks.length; ++i) {
    let describe = blocks[i];
    mdOutput += '## ' + describe.contents + '\n\n';
    mdOutput += describe.comments[0] ?
      acquit.trimEachLine(describe.comments[0]) + '\n\n' :
      '';

    // This test file only has it() blocks underneath a
    // describe() block, so just loop through all the
    // it() calls.
    for (let j = 0; j < describe.blocks.length; ++j) {
      let it = describe.blocks[j];
      mdOutput += '#### It ' + it.contents + '\n\n';
      mdOutput += it.comments[0] ?
        acquit.trimEachLine(it.comments[0]) + '\n\n' :
        '';
      mdOutput += '```javascript\n';
      mdOutput += '    ' + it.code + '\n';
      mdOutput += '```\n\n';
    }
  }

  fs.writeFileSync('./README.md', mdOutput);
}

generateTestBasedDocs('./test/spec.js');

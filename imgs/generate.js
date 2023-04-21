const fs = require('fs');

const zoom = +process.argv[2];
console.log("Zoom", zoom);

for (const layer of fs.readdirSync('orig')) {
  let s = "";
  const imgs = fs.readdirSync(zoom + '/' + layer + '/').map(e => e.split(".")[0].split("_").map(e=>parseInt(e)));
  const xmax = Math.ceil((Math.max(...imgs.map(e=>e[0]))+1)/2);
  const ymax = Math.ceil((Math.max(...imgs.map(e=>e[1]))+1)/2);

  s += ("mkdir '" + (zoom+1) + "/" + layer + "'\n")
  for (let x=0; x<xmax; x++) {
    for (let y=0; y<ymax; y++) {
      let all_empty = true;
      let cmd = "montage";
      for (let py=0; py<2; py++) {
        for (let px=0; px<2; px++) {
          const rx = x+x+px;
          const ry = y+y+py;
          if (imgs.some(([ax, ay]) => ax == rx && ay == ry)) {
            cmd += " '" + zoom + "/" + layer + "/" + rx + "_" + ry + ".png'";
            all_empty = false;
          } else cmd += " 'empty.png'";
        }
      }
      cmd += " -background none -gravity NorthWest -geometry '+0+0>+0+0' -tile 2x2 -resize '50%' '" + (zoom+1) + "/" + layer + "/" + x + "_" + y + ".png' &";
      if (!all_empty) {
        s += cmd + "\n";
      }
    }
  }
  s += 'for job in `jobs -p`; do wait ${job}; done\n';
  fs.writeFileSync('runs/' + layer + '.sh', s);
}

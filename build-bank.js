// 构建词库:n5/n4 CSV(open-anki-jlpt-decks, MIT+CC-BY) + 中文释义(lxl66566, Unlicense)
// 输出:jlpt-n5-words.csv / jlpt-n4-words.csv(格式:汉字,假名,,难度,释义——中文优先,缺 fallback 英文)
const fs = require('fs');
function splitCsv(line){
  const out = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++){
    const ch = line[i];
    if (q){ if (ch === '"'){ if (line[i+1] === '"'){ cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',' || ch === '\t'){ out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  out.push(cur.trim()); return out;
}
// 中文词典:键有 "汉字"、"汉字(假名)"、"(〜が)る" 等模式,做多形态索引
const zhRaw = JSON.parse(fs.readFileSync('zh-dict.json', 'utf8'));
const zhMap = new Map();
for (const [k, v] of Object.entries(zhRaw)){
  const keys = [k, k.split(/[(（]/)[0], k.replace(/^\(.*?\)/, '').replace(/〜/g, '')];
  for (const key of keys) if (key && key.length >= 1 && !zhMap.has(key)) zhMap.set(key, v);
}
const supMap = new Map(fs.readFileSync('zh-supplement.tsv', 'utf8').split('\n')
  .filter(l => l.trim()).map(l => { const i = l.indexOf('\t'); return [l.slice(0, i), l.slice(i + 1)]; }));
function zhOf(kanji, kana){
  return zhMap.get(kanji)
    || zhMap.get(kanji + '(' + kana + ')') || zhMap.get(kanji + '（' + kana + '）')
    || zhMap.get(kanji + kana)
    || supMap.get(kanji + '|' + kana) || '';
}
function convert(file, out, minD = 1){ // minD:整库难度下限(N4≥2、N3≥3),避免短读音的高级词混进入门篇
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
  const rows = []; let zhHit = 0;
  for (const line of lines.slice(1)){
    const [expr, reading, meaning] = splitCsv(line);
    if (!expr || !reading || !/[\u3040-\u30ff]/.test(reading)) continue;
    if (/[〜～]/.test(expr)) continue; // 跳过「～区」这类模式词条(两种波浪号)
    const hasSmall = /[\u30FCーぁぃぅぇぉゃゅょ]/.test(reading);
    const hasSokuon = /っ/.test(reading);
    const d = Math.max((reading.length <= 3 && !hasSmall && !hasSokuon) ? 1 : (reading.length <= 5 && !hasSmall) ? 2 : 3, minD);
    const zh = zhOf(expr, reading);
    if (zh) zhHit++;
    const meaningAll = zh || meaning; // 中文优先
    const meaningSafe = /["\n,]/.test(meaningAll) ? '"' + meaningAll.replace(/"/g, '""') + '"' : meaningAll;
    rows.push(`${expr},${reading},,${d},${meaningSafe}`);
  }
  fs.writeFileSync(out, rows.join('\n'), 'utf8');
  console.log(`${out}: ${rows.length} 词,中文释义命中 ${zhHit} (${Math.round(zhHit / rows.length * 100)}%)`);
}
convert('n5-anki.csv', 'jlpt-n5-words.csv', 1);
convert('n4-anki.csv', 'jlpt-n4-words.csv', 2);
convert('n3-anki.csv', 'jlpt-n3-words.csv', 3);

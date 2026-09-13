// 罗马字→平假名 转换器(原型核心算法验证)
const MAP = {
  // 3字组合
  kya:'きゃ', kyu:'きゅ', kyo:'きょ', sha:'しゃ', shu:'しゅ', sho:'しょ',
  sya:'しゃ', syu:'しゅ', syo:'しょ', cha:'ちゃ', chu:'ちゅ', cho:'ちょ',
  cya:'ちゃ', cyu:'ちゅ', cyo:'ちょ', nya:'にゃ', nyu:'にゅ', nyo:'にょ',
  hya:'ひゃ', hyu:'ひゅ', hyo:'ひょ', mya:'みゃ', myu:'みゅ', myo:'みょ',
  rya:'りゃ', ryu:'りゅ', ryo:'りょ', gya:'ぎゃ', gyu:'ぎゅ', gyo:'ぎょ',
  ja:'じゃ', ju:'じゅ', jo:'じょ', jya:'じゃ', jyu:'じゅ', jyo:'じょ',
  zya:'じゃ', zyu:'じゅ', zyo:'じょ', bya:'びゃ', byu:'びゅ', byo:'びょ',
  pya:'ぴゃ', pyu:'ぴゅ', pyo:'ぴょ', fya:'ふぁ', fyu:'ふゅ', fyo:'ふょ',
  tsa:'つぁ', tsi:'つぃ', tse:'つぇ', tso:'つぉ', sho:'しょ',
  dha:'でゃ', // 占位,实际不会用到
  // 2字组合
  ka:'か', ki:'き', ku:'く', ke:'け', ko:'こ', sa:'さ', shi:'し', si:'し',
  su:'す', se:'せ', so:'そ', ta:'た', chi:'ち', ti:'ち', tsu:'つ', tu:'つ',
  te:'て', to:'と', na:'な', ni:'に', nu:'ぬ', ne:'ね', no:'の', ha:'は',
  hi:'ひ', fu:'ふ', hu:'ふ', he:'へ', ho:'ほ', ma:'ま', mi:'み', mu:'む',
  me:'め', mo:'も', ya:'や', yu:'ゆ', yo:'よ', ra:'ら', ri:'り', ru:'る',
  re:'れ', ro:'ろ', wa:'わ', wo:'を', ga:'が', gi:'ぎ', gu:'ぐ', ge:'げ',
  go:'ご', za:'ざ', ji:'じ', zi:'じ', zu:'ず', ze:'ぜ', zo:'ぞ', da:'だ',
  di:'ぢ', du:'づ', de:'で', do:'ど', ba:'ば', bi:'び', bu:'ぶ', be:'べ',
  bo:'ぼ', pa:'ぱ', pi:'ぴ', pu:'ぷ', pe:'ぺ', po:'ぽ',
  // 1字(不含 n,n 由专门规则处理以支持挂起)
  a:'あ', i:'い', u:'う', e:'え', o:'お',
};
delete MAP.dha; // 清理占位

// 合法双辅音声母:这类组合不产生促音(如 ts→つ、sh→し)
const ONSET = new Set(['ky','sh','sy','ch','cy','ts','fy','ny','hy','my','ry','gy','jy','zy','by','py']);

function toKana(input){
  const s = input.toLowerCase();
  let out = '', i = 0, lastN = false; // lastN:上一个字符刚通过拨音规则输出过 ん
  while (i < s.length){
    let matched = false;
    for (let len = 3; len >= 1; len--){
      const seg = s.substr(i, len);
      if (MAP[seg]){ out += MAP[seg]; i += len; matched = true; lastN = false; break; }
    }
    if (matched) continue;
    const c = s[i], d = s[i+1];
    // 促音:辅音后紧跟另一辅音,且二者不构成合法声母(kk/tch/pp 等;ts/sh 不算)
    if ('kstphbgrzcdmfj'.includes(c) && d && 'kstphbgrzcdmfj'.includes(d) && !ONSET.has(c + d)){
      out += 'っ'; i += 1; lastN = false; continue;
    }
    // 拨音挂起:n 后面跟辅音、另一个 n 或结束位置时输出 ん,只消费 1 个字符;
    // 连续第二个冗余 n(如 honn)静默跳过,与真实 IME 行为一致
    if (c === 'n' && !(d && 'aiueo'.includes(d)) && d !== 'y'){
      if (!(lastN && !(d && 'kstphbgrzdm'.includes(d)))){ out += 'ん'; }
      lastN = true; i += 1; continue;
    }
    out += c; i += 1; lastN = false; // 无法识别的字符原样透传
  }
  return out;
}

// 比对:去掉末尾尚未成形的透传罗马字后,与目标假名比对
function checkProgress(raw, target){
  const conv = toKana(raw);
  const solid = conv.replace(/[a-z\- ]+$/i, ''); // 去掉尾部未转换的透传字符
  if (solid === target) return { status: 'done', solid, conv };
  let ok = 0;
  const max = Math.min(solid.length, target.length);
  while (ok < max && solid[ok] === target[ok]) ok++;
  if (ok === solid.length && solid.length <= target.length) return { status: 'ok', solid, conv, ok };
  return { status: 'wrong', solid, conv, ok };
}

const cases = [
  ['sakura','さくら'], ['KONNICHIHA','こんにちは'], ['arigatou','ありがとう'],
  ['gakkou','がっこう'], ['nihon','にほん'], ['denwa','でんわ'],
  ['shinkansen','しんかんせん'], ['ryokou','りょこう'], ['benkyou','べんきょう'],
  ['itte','いって'], ['genki','げんき'], ['muzukashii','むずかしい'],
  ['tomodachi','ともだち'], ['ohayou','おはよう'], ['sensei','せんせい'],
  ['taberu','たべる'], ['gohan','ごはん'], ['kon','こん'], ['kanji','かんじ'],
  ['nyan','にゃん'], ['shinbun','しんぶん'], ['honn','ほん'],
  ['shutchou','しゅっちょう'], ['shucchou','しゅっちょう'], ['matchi','まっち'],
  ['tsukue','つくえ'], ['zasshi','ざっし'], ['chotto','ちょっと'], ['ippai','いっぱい'],
];
let fail = 0;
for (const [raw, expect] of cases){
  const got = toKana(raw);
  if (got !== expect){ fail++; console.log(`FAIL toKana: ${raw} → ${got} (期望 ${expect})`); }
}
// 进度比对:逐步输入
const prog = [
  ['', 'さくら', 'ok'], ['s','さくら','ok'], ['sa','さくら','ok'], ['sak','さくら','ok'],
  ['saku','さくら','ok'], ['sakur','さくら','ok'], ['sakura','さくら','done'],
  ['zaku','さくら','wrong'], ['saki','さくら','wrong'],
];
for (const [raw, target, expect] of prog){
  const r = checkProgress(raw, target);
  if (r.status !== expect){ fail++; console.log(`FAIL check: "${raw}" → ${r.status} (期望 ${expect}, solid="${r.solid}")`); }
}
console.log(fail === 0 ? `全部 ${cases.length + prog.length} 个用例通过 ✓` : `${fail} 个用例失败`);

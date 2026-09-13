# かなフロー · 日语打字练习

入门难度的日语拼写训练 Web 应用(手机优先):五十音 → 单元词汇 → 拼写/点选/复习,兴趣导向,进度自控。

**在线使用**:https://shigureyukina.github.io/kana-flow/prototype.html

手机浏览器打开后「添加到主屏幕」即可像 APP 一样全屏使用;首次加载后完全离线可用(PWA)。

## 功能

- 罗马字 → 假名实时转换的拼写引擎(拨音挂起、促音、拗音边角全覆盖)
- 3512 词内置词库:JLPT N5(677)/ N4(636)/ N3(2138),中文释义 100% 覆盖
- 单元制学习:篇 → 组(20 单元)→ 单元,首页只显示「继续学习」当前位置
- 两阶段拼写:看假名打一遍 → 看汉字默写一遍;SM-2 间隔复习;错词本
- 读音选择(干扰项同难度、近音分级)/ 听写 / 五十音 104 音打字
- 自制课程:粘贴任意日文,kuromoji 分词注音,生词查义一键入库
- 全部进度存本机浏览器 localStorage,无账号、无推送、无打卡

## 数据来源与致谢

- 词表:[open-anki-jlpt-decks](https://github.com/jamsinclair/open-anki-jlpt-decks)(MIT / CC-BY,数据源自 [Jonathan Waller's JLPT resources](https://jlptstudy.net))
- 中文释义:[lxl66566/Japanese-Chinese-thesaurus](https://github.com/lxl66566/Japanese-Chinese-thesaurus)(Unlicense)+ 人工补译(zh-supplement.tsv)
- 分词:[kuromoji.js](https://github.com/takuyaa/kuromoji.js)(Apache-2.0),词典经 jsDelivr CDN 加载
- 发音:浏览器 Web Speech API(ja-JP)

## 本地开发

```bash
python -m http.server 8642  # 或任意静态服务器
# 打开 http://127.0.0.1:8642/prototype.html
```

改动词库后:`node build-bank.js` 重新生成三份 CSV,并递增 `sw.js` 的 `VER`。

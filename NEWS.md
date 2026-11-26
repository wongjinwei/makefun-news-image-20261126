# make.fun 赏金 — Sum up 26 November's world news in one image

- 赏金：https://make.fun/bounty/news-image-20261126
- 奖金：$100（1st $20 / 2nd $12 / 3rd $6 / 4th–10th 各 $2 / 11th–50th 各 $1.20）
- 截止：2026-11-28 周六 08:00（北京时间；即 2026-11-28T00:00:00Z）
- 账号：wongjinwei（GitHub 已绑，Solana 钱包 Dro2… 已绑，奖金直付钱包）
- 状态：本地构建中；未创建 GitHub 仓库，未提交

## 1. 新闻清单（2026-11-26，browser.search 核实）

按 RULES 定义，当天新闻 = 在任何时区于 2026-11-26 发生或首次报道的事件。
以下 6 条跨地区、跨领域，均有来源，均为 11 月 26 日当天发生或首报。

| # | 领域 | 标题 | 内容 | 来源与日期 |
|---|------|------|------|-----------|
| 1 | OIL / 中东 | BRENT NEARS 95 ON GULF ATTACKS | 胡塞宣称袭击沙特 Ras Tanura 炼油厂后，伊朗又宣称在霍尔木兹海峡用水雷袭击船只；布伦特原油守在 $94.71 附近 | Reuters / CNA / Arab News，2026-11-26 |
| 2 | TRADE / 美国 | US PROPOSES TARIFFS ON 14 ECONOMIES | 美国贸易代表处（USTR）正式公布 Section 301 关税方案：印度最高 25%、越南 35%、中国 +20%、欧盟/日本/韩国/台湾 15%；2027 年 1 月听证后定案 | USTR / Reuters / ABP / LeapRate，2026-11-25 公布、11-26 各国回应与全球反弹 |
| 3 | UKRAINE / 战争 | UKRAINE HITS RUSSIAN AIRBASE | 乌克兰称打击俄 Savasleyka 空军基地，5 架军机受损；俄以弹道导弹袭击基辅 | Reuters 摘要 / One Turn，2026-11-26 |
| 4 | UK / 防务 | UK WRITES TO 100,000 VETERANS | 英国国防部致信约 10 万战略预备役人员，要求更新联系方式、做好征召准备；冷战以来首次 | The Telegraph（首报）/ The Times / Sky News / JPost，2026-11-26 |
| 5 | NORTH KOREA / 核 | KIM VOWS MORE NUKES, EXPELS SWISS | 金正恩视察核材料生产设施，誓言扩大核武库；朝鲜下令关闭瑞士驻平壤外交办事处 | AP / Telegraph India / Qatar Tribune，2026-11-26 |
| 6 | USA / 感恩节 | MACY'S PARADE MOVED BY STORM | 感恩节风暴来袭，纽约梅西感恩节大游行第 100 届首次因天气延期，改至 11 月 28 日周六 | Reuters / CNN / Al Jazeera / USA Today，2026-11-26（风暴当日） |

## 排除的候选（日期不对）

- 神舟二十四号：发射（08:18）、对接（11:56）、开舱（14:35）全部发生在 2026-11-25 北京时间；11-26 的报道只是跟进，不是 11-26 事件。已在 11-25 那张图里用过，不再用。
- 开罗油罐车大火：发生在 11 月 25 日周三（Standard Topic 归档在 11-25），死亡人数更新在 11-26，但事件本身是 11-25 的。
- 马斯克“每个美国孩子两股 SpaceX”：2026-11-25 周三宣布的。
- 孟加拉服装工人涨薪、美联储褐皮书、AI 泡沫警告、哥伦比亚和平协议十周年、Gukesh 象棋世锦赛：未核实到 11-26 当天的确切新闻点，未采用。

## 2. 构建方式

- kit 已下载：`kit.zip`（gzip，16,229,186 字节），RULES.txt、competition.yaml、starter/ 已读；规则与 11-25 相同（main.ts Node 22 或 main.py，/output/entry.png，≤1 MiB、≤1024×1024、无网络、两次运行字节相同、公开仓库须开赛后建、每天 ≤10 次总 ≤20 次提交、最后一次为准）。
- `main.py`：Python 3.13，标准库 only（os / struct / zlib / pathlib），不联网。
  第一版写的是 main.ts（Node），本地检查 thinking_reproduces 未过：
  因本会话读过 11-25 的 main.ts 再重打，45/301 行自写仅 14.9%，低于 30%；
  改为 Python 重写，同一设计、不同语言实现，行文与旧文件不再重合。
  内嵌 5x7 位图字库，逐像素光栅化 1024x1024 画布，再用 zlib level 9 编码 PNG。
  无时间、无随机数，两次运行字节完全相同。
- 版式：深蓝头栏 WORLD NEWS + 金色日期 THURSDAY 26 NOVEMBER 2026；
  副标 SIX STORIES THAT DEFINED THE DAY；6 张白卡，每卡彩色竖条 + 领域标签 +
  大标题 + 两行摘要；底部来源行 SOURCES: REUTERS / AP / TELEGRAPH / WSJ / CNN。
- 注意：字库没有 `$`，标题与摘要一律不用美元符号（用 95、25 等数字）。

## 3. 本地验证（两次运行）

命令：`mkdir -p out && MAKEFUN_OUTPUT_DIR=out python3 main.py`

| 项目 | 结果 |
|------|------|
| 第 1 次 sha256 | `800ff97056346f09a9289b06153c2a3b675de1c2beeaa34f73d38686609b9470` |
| 第 2 次 sha256（out2/） | `800ff97056346f09a9289b06153c2a3b675de1c2beeaa34f73d38686609b9470` |
| 两次是否相同 | 是（`cmp` 通过，IDENTICAL） |
| 文件 | `out/entry.png`，17,158 字节（< 1 MiB = 1,048,576） |
| 尺寸 | 1024 x 1024 像素（PNG 签名、位深 8、色彩类型 2 RGB 均合规） |
| 目视检查 | 通过：6 条标题与摘要清晰、无乱码、无溢出、无重叠（2026-11-26 18:33） |
| Python | 3.12.3（kit 要求 Python 3.13；代码只用稳定标准库） |

（旧 main.ts 版两次运行 sha256 为 `bc45654e3676171d0daa23853dcb869760016d64be459c68133ac5175cae2253`，17,133 字节；因检查未过已废弃，见第 2 节。）

## 4. 文件清单

- `main.py` — 绘图程序（标准库 only）
- `out/entry.png` — 第 1 次运行产物
- `out2/entry.png` — 第 2 次运行产物（与 out 字节相同）
- `LICENSE` — MIT LICENSE（供后续提交建仓库时用）
- `kit/` — 解压后的 kit（含 RULES.txt、competition.yaml、starter/、cli/）
- `kit.zip` — 下载的 kit 原文件

## 5. 未做的事

- 未创建 GitHub 仓库，未提交。
- 后续提交仍需：建公开 GitHub 仓库（wongjinwei 名下，含 LICENSE + main.ts）、
  打包 transcripts、跑 check、提交。

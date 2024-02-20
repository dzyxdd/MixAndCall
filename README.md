# MixAndCall

## 项目简介

这是一个基于MkDocs-Material的网站项目，用于收集整理一些mix和call本。

## 使用教程

### 工作流程

整个项目的大致工作流程如下：

运行`python_generator`目录下的`xxx_generator.py`脚本读取`template`目录下的模板`html`文件和`doc`目录内的`json`文件，通过`jinja2`库的解析批量生成`html`和`markdown`文件并保存在`doc`目录下。然后再通过`MkDocs`完成网站构建。

### 本地部署

1. clone 仓库到本地：

	```shell
	git clone https://github.com/dzyxdd/MixAndCall.git
	```

2. 在项目根目录下运行`run_scripts.sh`（Linux）或`run_scripts.sh`（Windows）安装环境依赖并运行`python_generator`目录下脚本（此步骤需要有 Python 环境，请自行搜索 Python 安装教程）

3. 使用 Mkdocs 命令构建网站。

执行命令：
```shell
mkdocs serve
```

启动内建服务器，执行成功后，访问 http://127.0.0.1:8000/ 即可本地预览当前文档。

### 参与项目

- 添加和修改数据（mix、曲库、call本等）或完善网站功能：提交PR
- 仅添加和修改Json相关数据（mix、曲库等）：按照文档规范将数据转为json字符串，提交Issue或PR

## JSON规范

### music_call.json

这个 JSON 数据主体是一个JSON对象数组，每个JSON对象存储了一首歌的call本的相关信息，其结构如下所示：

- `title`(字符串): 歌曲标题。
- `version_list`(JSON对象数组): 每个JSON对象存储了该歌曲的一个版本的信息，其结构如下所示：
	- `title`(字符串): 歌曲版本的名称，如长版、短版、xxx公演定制版等。
	- `pic_list`(JSON对象数组): 每个JSON对象包含了该歌曲版本的不同版本的call本信息，其结构如下所示：
		- `description`(字符串): 对该call本的简要描述，可包含call本作者、call本来源等信息。
		- `href`(字符串): 图片的保存路径。

以下是一个简单的示例：

```json
[
  {
    "title": "速",
    "version_list": [
      {
        "title": "长版",
        "pic_list": [
          {
            "description": "baf公演版--dzy",
            "href": "../../call_image/dzydoom/速.png"
          },
          {
            "description": "rb",
            "href": "../../call_image/rainbow/速1.jpg"
          }
        ]
      },
      {
        "title": "短版",
        "pic_list": [
          {
            "description": "xxx拉票--rb",
            "href": "../../call_image/rainbow/速2.jpg"
          }
        ]
      }
    ]
  }
]
```

该示例列表仅包含一首歌《速》，这首歌包括2个版本，其中长版有2个版本的call本，短版有1个版本的call本。

### stage_list.json

该 json 文件主体是一个JSON对象数组，每个JSON对象存储了一场公演的相关信息，目前仅支持按首演时间排列，其结构如下所示：

- `title` (字符串): 公演的标题。
- `type` (字符串): 公演的类型，包括：复刻公演、原创公演、拼盘公演、焕新公演（目前仅有TeamX《交X点》）。
- `date` (字符串): 公演的首演日期，格式为"YYYY/MM/DD"。
- `team` (字符串): 公演首演的队伍。
- `notes` (字符串): 关于公演的额外备注，目前主要包含其他队伍的复刻信息，格式为："YYYY/MM/DD xxx48 TEAM xxx"。当复刻公演与原本的公演存在明显差异时（如TeamZ《代号林和西》，TeamX《三角函数》，TeamFt《双面偶像》等），不在此处列出，而是单列为一项公演。
- `song_title_list` (字符串数组): 公演中的常驻曲目列表，通常以首演的演出顺序进行排列。
	1. 非常驻的前座曲、安可曲等无需列出
	2. 轮换曲目较少时可同时列出
	3. 出现大量歌曲轮换时可单列为一项公演

以下是一个简单的示例：

```json
[
  {
    "title": "最后的钟声响起（K4）",
    "type": "复刻公演",
    "date": "2013/08/30",
    "team": "SNH48 TEAM SII",
    "notes": "2015/4/17 SNH48 TEAM X",
    "song_title_list": [
      "猛犸",
      "最后的钟声响起",
      "男友制作秘籍",
      "不想太伟大",
      "再爱一回",
      "初恋小盗",
      "对不起我的宝贝",
      "夜蝶",
      "16人姐妹歌",
      "战役的崛起",
      "冷酷女孩",
      "爱的洄游鱼",
      "期待相遇",
      "暹罗猫",
      "梅洛斯之路",
      "支柱"
    ]
  }
]
```

在这个示例中，公演"最后的钟声响起（K4）"是一个复刻公演，由SNH48 TEAM SII在2013年8月30日完成首演，并在2015年4月17日由SNH48 TEAM X完成复刻，公演共包含16首歌曲。

### mix_list.json

这个项目包含了一些歌曲的混音信息，存储在`mix_list.json`文件中。

## 数据结构

该 json 文件主体是一个JSON对象数组，每个JSON对象存储了一个MIX的相关信息，其结构如下所示：

- `title`(字符串): mix的名称，如果存在多种名称，则将常用名称放在最前，其他名称以方括号包围，以竖线`|`分割。

	例如：`英语mix [スタンダードmix | 英語mix]`

- `text_list`(JSON对象): 每个JSON对象存储了该MIX的一种表达形式，其结构如下所示：
  
  - `lang`(字符串): 该表达形式使用的文字的名称
  - `text`(字符串): 该表达形式下的文本
  - `notes`(字符串): 关于该表达形式的注解
  
- `text_list_size`(数字): `text_list`包含的JSON对象的数量
  
- `notes`(字符串): 关于mix的注解

- `link_list`(字符串): 相关链接（以视频链接为主）的列表，每个JSON对象存储了一个链接的相关信息，其结构如下所示：

	- `title`(字符串): 链接的标题，或直接放链接亦可

	- `url`(字符串): 链接


以下是一个简单的示例：

```json
[
  {
    "title": "终幕可变mix [アッチェレ終幕ジャパ可変mix | ジャパ可変mix]",
    "text_list_size": 4,
    "text_list": [
      {
        "lang": "罗马字",
        "text": "_Noujou Mai Umiu Chou\nJyokyoTobiKasenShindouAmaSeniJinzouHi\n_Tora Hi Tora Hi\nToraToraToraTora ToraHiJinzouSeniAmaShindou\nAmashinAmashinAmashindou AmaSenAmaSenJinzouHi\nToraHiJinzouSeni(P)Ama Shindou\n_Kasen Tobi Jyokyo Chou\n_Umiu Mai Noujou",
        "notes": ""
      },
      {
        "lang": "日语",
        "text": "農場 舞 海鵜[うみう] 跳[ちょう]\n\"除去飛化繊振動海女繊維人造火\"\n虎 火 虎 火\n\"虎虎虎虎\" (虎火人造繊維海女振動)\n(海女振海女振海女振動 海女繊海女繊人造火)\n\u0027虎　火　人造　繊維\u0027 海女 振動\n化繊 飛 除去 跳\n海鵜 舞 農場",
        "notes": "\"\"表示倍速，()表示四倍速，\u0027\u0027表示可倍速可原速，根据歌曲决定"
      },
      {
        "lang": "日语",
        "text": "農場 舞 海鵜[うみう] 跳[ちょう]\n\"除去飛化繊振動海女繊維人造火\"\n虎 火 虎 火\n\"虎虎虎虎\" (虎火人造繊維海女振動)\n(海女振海女振海女振動 海女繊海女繊人造火)\n\u0027虎　火　人造　繊維\u0027 海女 振動\n化繊 飛 除去 跳\n海鵜 舞 農場",
        "notes": "\"\"表示倍速，()表示四倍速，\u0027\u0027表示可倍速可原速，根据歌曲决定"
      },
      {
        "lang": "日语",
        "text": "農場 舞 海鵜[うみう] 跳[ちょう]\n\"除去飛化繊振動海女繊維人造火\"\n虎 火 虎 火\n\"虎虎虎虎\" (虎火人造繊維海女振動)\n(海女振海女振海女振動 海女繊海女繊人造火)\n\u0027虎　火　人造　繊維\u0027 海女 振動\n化繊 飛 除去 跳\n海鵜 舞 農場",
        "notes": "\"\"表示倍速，()表示四倍速，\u0027\u0027表示可倍速可原速，根据歌曲决定"
      }
    ],
    "notes": "第一个词農場在弱拍上",
    "link_list": [
      {
        "title": "【CALL教学】可変三連MIX之歌的原作者教你打CALL喊MIX 教学合集",
        "url": "https://www.bilibili.com/video/BV1LL411r7DZ/?p=4&t=310"
      }
    ]
  }
]
```

在这个示例中，包含了终幕可变mix的相关信息。

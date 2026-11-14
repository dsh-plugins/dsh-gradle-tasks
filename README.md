<div align="center">

<img src="icon.svg" alt="@dsh-plugin/dsh-gradle-tasks" width="72" height="72" />

# dsh-gradle-tasks

**在 DSH 右侧边栏浏览并运行 Gradle 任务：按 `group` 分文件夹、双击即在终端里执行、用项目自带 wrapper 与选定 JDK。**

[![DSH Plugin](https://img.shields.io/badge/DeepSeek%20Harness-plugin-4f7cff)](https://github.com/topics/dsh-plugin)
[![dsh](https://img.shields.io/badge/dsh-%E2%89%A50.2.2--rc.2%20%3C0.3.0-4f7cff)](#兼容版本)
[![license](https://img.shields.io/badge/license-LGPL--3.0--only-blue)](LICENSE)

</div>

在 DSH 的**右侧边栏**增加一个「Gradle 任务」标签页：识别当前会话所在项目是否为 Gradle 工程，按任务声明的 `group` 分文件夹列出全部任务，双击任务即在 DSH 终端里用项目自带的 wrapper 与选定的 JDK 执行。

面板以标签页形式挂在右侧边栏：右侧边栏的「开始」页会多出一张「Gradle 任务」卡片，点开即在侧栏内打开该页；同一个标签也可以在分屏或浮窗中打开。

![面板预览](docs/preview.svg)

## 功能

| 功能 | 说明 |
| --- | --- |
| Gradle 工程检测 | 只看当前会话的工作目录：从该目录向上查找 `settings.gradle[.kts]` / `build.gradle[.kts]`，命中最先出现的目录即为构建根目录；同时读取 wrapper 名称与 `distributionUrl` |
| 任务枚举 | 注入初始化脚本 `dump-tasks.gradle`，在 `gradle.projectsEvaluated` 阶段遍历 `allprojects` 下全部 `tasks`，写回 `路径 / group / description` 三列清单 |
| 任务清单缓存 | 清单写入项目自己的 `<项目根>/.gradle/dsh-gradle-tasks/tasks.json`；下次打开面板时按构建脚本内容做指纹比对，脚本没变就直接读取，实测 1.4 s → 6 ms |
| 自动失效 | 指纹覆盖根目录与各子项目的 `build.gradle[.kts]`、`settings.gradle[.kts]`、`gradle.properties`、`gradle/wrapper/gradle-wrapper.properties`、`gradle/libs.versions.toml`；同时把平台、JDK 与离线开关计入指纹，任一变化即重扫 |
| 分组显示 | 按任务的 `group` 分文件夹，文件夹按名称排序、「未分组」排在最后；文件夹内按 `description` 排序，无描述的任务排在后面，最终以任务路径兜底 |
| wrapper 优先 | 优先使用项目自带的 `gradlew.bat` / `gradlew`；项目没有 wrapper 时才回退到 `PATH` 中的 `gradle`，两者都没有则明确报错 |
| 双击运行 | 双击任务，命令被输入到一个真实的 DSH 终端里；任务路径先按 `:project:task` 形式校验，`--init-script` 一类选项形状的输入在启动前就被拒绝 |
| 终端复用 | 双击时先看当前窗口有没有本插件开过、且在同一个构建目录里的终端标签：有就直接在该终端里接着跑，没有才新开一个终端（新终端会自动成为侧栏的一个标签） |
| PowerShell 优先 | Windows 上开终端时按 pwsh → powershell 请求 shell；拿到终端后再按它实际启动的 shell 决定引号形式，cmd.exe 回退时用双引号且不加 &，因此两种 shell 都能跑 |
| 离线模式 | 标题栏的云加斜杠图标，点一下高亮（半透明品牌色底），再点一下取消；开启后 Gradle 调用带 `--offline`，扫描与运行都生效 |
| 手动重扫 | 标题栏的刷新图标与 JDK、离线开关的显式切换一律忽略缓存；只有面板首次加载会读取缓存 |
| JDK 选择 | 扫描环境变量中的 `JAVA_HOME`、`JAVA_8`、`JAVA_17`… `JDK_HOME` 等，逐个校验 `bin/java[.exe]` 并读取 `release` 中的 `JAVA_VERSION`；默认选中 `JAVA_HOME`，切换后按新 JDK 重新扫描任务 |

## 兼容版本

针对 DSH `0.2.2-rc.x` 编写与验证，`engines.dsh` 为 `>=0.2.2-rc.2 <0.3.0`。

宿主端只依赖公开服务：`webServer`、`connection`、`subprocess`、`sessions`、`agents`、`workingDirectory`、`sandboxPolicy`、`terminalController`。运行期不导入任何 `@deepseek-ai/*` 值，接口形状以 `interface` 就地声明，因此插件不会因上游包的小版本调整而失效。客户端注册为右侧边栏的标签类型（`ctx.sidebarRightTabs` + `sidebar.right.pane.tab` 插槽），在 `dsh.client.inject` 中声明对 `@deepseek-ai/dsh-client-ui-sidebar-right` 的启动顺序依赖，并注入 `slots`、`sidebarRightTabs`、`sidebarRight`、`webTerminals`；`locale` 为可选服务。

## 构建

开发需要 Node.js `>=22.6.0`（`npm test` 依赖原生 TypeScript 类型剥离；DSH 自身另有更高的运行时要求）。

```powershell
npm install --no-audit --no-fund
npm run typecheck
npm run build
npm test
```

`src/` 为 TypeScript 源码，运行期加载 `lib/` 中的产物。客户端入口 `src/client/index.tsx` 由 `tsdown` 编译为 CommonJS 并包进 `window.__ModuleLoader__.load({ id: "dsh-gradle-tasks", ... })` 闭包；构建配置见 [tsdown.client.config.mjs](tsdown.client.config.mjs)。修改客户端源码后需重新构建并刷新页面，修改宿主端源码后需重启 DSH 进程（Node 的 ESM 缓存按 URL 驻留）。

`npm test` 覆盖且仅覆盖本仓库的算法与解析逻辑：Gradle 工程定位、任务清单解析、分组排序、命令行拼装、JDK 变量筛选与排序。业务编排、路由处理与界面渲染不写测试。

## 安装

从 Git 源安装（`lib/` 产物已随仓库提交，无需授权构建脚本）：

```sh
dsh plugin --profile web add "github:dsh-plugins/dsh-gradle-tasks"
```

也可以克隆后从本地目录安装，或在 DSH Web 的「插件」页安装：

```powershell
git clone https://github.com/dsh-plugins/dsh-gradle-tasks.git
dsh plugin --profile web add <克隆下来的目录绝对路径>
```

`cordis.patch.yml` 只插入一行宿主入口：

```yaml
- insert:
    - id: gradle-tasks
      name: 'dsh-gradle-tasks'
```

安装并重启后，展开右侧边栏的「开始」页，会看到「Gradle 任务」卡片；点开即在该侧栏内打开页面，之后它作为标签留在侧栏顶部。

## 运行时行为

### 工程检测

从当前会话的工作目录开始逐级向上，最多 12 层。同一层同时存在 settings 与 build 脚本时以该层为根；只有 build 脚本的目录视为独立项目，同样作为根。

### 任务清单

任务清单来自一次真实的 Gradle 调用：

```text
<wrapper> --quiet --console=plain -p <root> --init-script <dump> -PdshGradleTasksOut=<report> help
```

初始化脚本在构建配置完成后执行，因此插件注册的任务、settings 脚本注册的任务都在清单内。`help` 任务本身也会出现，属于 Gradle 的正常行为。

### 任务清单缓存

清单缓存在 `<项目根>/.gradle/dsh-gradle-tasks/tasks.json`：`.gradle` 是 Gradle 自己的构建内缓存目录，项目的 `.gitignore` 普遍已排除它，插件因此不需要在项目里再制造一个待清理的目录。

命中条件是「配置指纹」相同，指纹由三部分组成：

1. 递归扫描到的配置文件的 SHA-1，每个文件单独取摘要；
2. 这些文件的相对路径；
3. 执行平台、所选 JDK 的目录，以及离线开关。

扫描范围覆盖根目录与全部子项目，跳过 `build`、`out`、`target`、`.gradle`、`.idea`、`node_modules` 等目录，深度上限 8 层、文件数上限 2000 个（超出会在日志中提示「缓存可能漏掉某目录下的改动」，不会静默截断）。收录的文件名固定为 `build.gradle[.kts]`、`settings.gradle[.kts]`、`gradle.properties`、`gradle-wrapper.properties`、`libs.versions.toml`。

平台与 JDK 进入指纹，是因为同一份脚本在不同操作系统与不同工具链下可能注册出不同的任务；离线开关同理，配置阶段解析不到依赖时注册的任务会变少。不把它们算进去，切回去后会读到一个语义上错误的清单。

缓存条目带格式版本号 `version`，升级插件时递增即可让旧条目全部失效；版本或结构不符的条目按缺失处理并给出日志，随后那次扫描会重写它。写在只读卷上的项目会有一次失败日志，之后每次打开都重新扫描，功能不受影响。

被中断的请求不会浪费：浏览器中途断开后，宿主端的 Gradle 仍会跑完并写入缓存，下一次打开即命中。

### 任务运行

双击任务时，插件把一条命令行输入到会话的终端里，构建就在那个终端里跑——滚屏、颜色、Ctrl+C 中断都由终端本身提供，面板不再另存一份输出。

终端的选择顺序：

1. 本插件为该会话开过、仍处于运行状态、且控制权还在 Agent 手里的终端；
2. 该终端此时必须是当前窗口已打开的标签（面板会把窗口里的终端标签列表一并发给宿主）；
3. 该终端的**启动目录**必须就是本次的构建根目录——命令里不带 `-p`，Gradle 读的是 shell 自己的当前目录，目录不符会把构建跑到别的地方去；
4. 任一条不满足就新开一个终端，标题为 `Gradle · <项目目录名>`，它会自动成为侧栏的一个标签。

控制权那一项是关键：一旦人在终端里敲过字，控制权就永久转给人，后续运行会另开终端而不是往别人的会话里塞命令。

### shell 选择与引号

Windows 的终端默认是 `cmd.exe`，而 `cmd` 把 `&` 当命令分隔符、不认单引号，`& 'gradlew.bat'` 这类写法会直接报 `& was unexpected at this time`。因此：

1. 开终端时按 `pwsh` → `powershell` 的顺序请求 shell，装了就优先用；
2. 拿到终端后用**它实际启动的 shell**（`info.shell.path`）决定引号形式，而不是按平台猜：

```text
powershell  & 'C:\path\gradlew.bat' ':build' '--console=plain'
cmd         "C:\path\gradlew.bat" ":build" "--console=plain"
posix       '/path/gradlew' ':build' '--console=plain'
```

即使机器上没有任何 PowerShell（回退到 `cmd.exe`），命令也仍然可用。每个参数都是带引号的字面量，含空格的路径、含点的任务名都不会被 shell 拆开。命令只在终端产生过输出之后才输入，避免 shell 启动阶段（加载 PowerShell profile、rc 文件）吞掉这段输入；若 8 秒内始终没有任何输出，仍会输入并记录一条警告。

### JDK 选择

- 扫描规则：变量名以 `JAVA` / `JDK` 开头，其后只能是版本号或 `_HOME`（可组合），因此 `JAVA_HOME`、`JAVA_17`、`JDK_HOME`、`JAVA_HOME_21` 命中，而 `JAVA_TOOL_OPTIONS`、`JAVA_OPTS` 不命中。
- 排序：`JAVA_HOME` → `JDK_HOME` → 版本别名（按数字升序）。
- 去重：先排序再去重，同一目录只保留优先级最高的变量，因此 `JAVA_HOME` 与 `JAVA_25` 指向同一 JDK 时默认项仍是 `JAVA_HOME`。
- 校验：目录内必须存在 `bin/java` 或 `bin/java.exe`，否则不计入候选。
- 生效方式：运行时同时设置 `JAVA_HOME` 与 `PATH` 前置 `bin`，wrapper 与 Gradle 守护进程都会使用该 JDK。

## 目录结构

```text
dsh-gradle-tasks/
├── package.json              # 包名、入口、dsh.bundle / dsh.client 声明
├── cordis.patch.yml          # 插入宿主入口的补丁层
├── icon.svg                  # 插件展示图标
├── locale/{zh,en}.json       # 插件管理页的标题与简介
├── docs/preview.svg          # 面板预览图
├── src/
│   ├── index.ts              # 宿主端：路由、扫描、JDK 扫描、终端复用与命令注入
│   ├── gradle.ts             # 工程定位、任务解析、分组排序、命令行拼装、配置指纹
│   ├── cache.ts              # 任务清单缓存的读写、校验与格式版本
│   ├── jdk.ts                # 环境变量筛选、排序、release 读取
│   ├── shared/protocol.ts    # 宿主与浏览器共用的线格式
│   └── client/               # 浏览器端：面板、图标、文案、样式
└── tests/                    # 算法与解析逻辑测试
```

## 已知限制

- 指纹只读取上面列出的那几类文件：任务清单还受插件版本、`~/.gradle/gradle.properties`、依赖版本变化等外部因素影响，这类改动需要点一次刷新图标。
- 同一项目只保留一份清单，因此来回切换 JDK 或离线开关会各自重扫一次；切回用过的组合不会命中旧的另一份。
- 每个会话只记住最近开的那一个终端：在同会话内切换项目会新开终端，切回原项目时若记录已被后一次覆盖，也会新开一个。
- 插件重载或 DSH 重启后记录清空，第一次运行会新开终端。
- 面板不看构建结果，成败以终端里的输出为准。
- 面板以当前用户的身份执行任意 Gradle 构建，其后果与本人在终端里执行 `gradlew` 相同。

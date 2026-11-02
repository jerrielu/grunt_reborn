# 设计文档（高层）

## 架构分层
- **core/**：纯 TypeScript 模拟层，不依赖 Phaser/DOM/浏览器 API；随机经种子 PRNG，时间经 update(dt)。可被 Phaser 场景（图形）与 headlessRunner（文本 E2E）双重驱动。
- **sprites/**：移植 pixelsmall 组件组合架构（Component/CompositeComponent/SpriteTemplate），运行时生成纹理；Phaser 负责播放（anims/flip）。
- **scenes/**：Phaser 渲染层，事件驱动同步 sim 状态。
- **ui/**：DOM 覆盖层（菜单/手牌/奖励/结算），薄层，只消费事件。
- **core/meta + save/**：局外永久存档（MetaStore 经 SaveAdapter），与局内 RunState 严格隔离。

## 核心循环
战斗执行期 10s（BOSS 6-8s）→ 决策出牌窗口（游戏暂停）→ 玩家出一张或跳过 → 下一轮。关卡 = 多波敌卒 → 精英 → BOSS → 三选一奖励 + 回血 → 下一关（敌人增强）。死亡 → 结算轮回积分 → 清空局内 → 新武将开局。

## 主角 AI 优先级
1. 生效战法覆盖 → 2. 默认就近追击普攻 → 3. 低血后撤（<30%）。

## 测试
Vitest 单测（core 全覆盖）+ 无头文本 E2E（事件流日志断言），CI 可跑。

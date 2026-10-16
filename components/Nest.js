import { useEffect } from 'react'
import { loadExternalResource } from '@/lib/utils'
import { siteConfig } from '@/lib/config'

/**
 * 背景粒子（nest）效果开关说明
 *
 * 这里和主题里的挂载点是两层独立开关，互不影响：
 * 1. `NEST`：由主题（如 endspace）读取，决定是否渲染挂载点 <div id="__nest">；
 * 2. `NEST_ANIMATION`：本组件读取，决定是否真正加载 public/js/nest.js、
 *    创建粒子画布并启动 requestAnimationFrame 动画。
 *
 * `NEST_ANIMATION` 默认 false（关闭）。原因：
 * - 画布动画是持续重绘的视觉效果，会长期占用主线程与电量；
 * - public/js/nest.js 曾存在变量名缺陷（`i.id = id`，正确为 `idNest`），
 *   一旦执行必然抛出 ReferenceError。默认关闭时连脚本都不会加载，
 *   因此既不会产生该报错，也不会在修复后突然出现背景动画，
 *   站点视觉与性能与修复前保持一致。
 *
 * 需要主动启用背景粒子时（两步都要满足）：
 * - 在 Notion 配置中心 / THEME_CONFIG / blog.config.js 中设置
 *     NEST: true             // 渲染挂载点
 *     NEST_ANIMATION: true   // 真正开启动画
 * - public/js/nest.js 已修正为使用 idNest，开启后画布 id 与挂载点一致。
 */
const Nest = () => {
  // 默认关闭：显式开关，避免"修好报错"顺带把动画打开
  const nestAnimationEnable = siteConfig('NEST_ANIMATION', false)

  useEffect(() => {
    if (!nestAnimationEnable) {
      // 关闭状态下不加载脚本、不创建画布、不初始化动画，也不产生任何报错
      return
    }
    loadExternalResource('/js/nest.js', 'js').then(url => {
      window.createNest && window.createNest()
    })
    return () => window.destroyNest && window.destroyNest()
  }, [nestAnimationEnable])

  return <></>
}

export default Nest

'use client'

import { isBrowser } from '@/lib/utils'
import { useCallback, useEffect, useRef } from 'react'

/**
 * Viewport Scale Hook - Endfield-style proportional scaling
 *
 * ⚠️ 这个效果会把根字号按视口等比放大：
 *    1920 宽屏 → 19.2px，2560 宽屏 → 顶到上限 24px（+50%）。
 * 因为 Tailwind 的尺寸几乎全是 rem，根字号一涨，容器宽度、封面高度、
 * 间距、字号会一起膨胀 —— 大屏上首页一屏只能放下一篇文章。
 * 所以它是显式开启的增强项（ENDSPACE_VIEWPORT_SCALE，默认 false），
 * 而不是默认行为；博客的默认根字号固定 16px，并尊重用户浏览器的字号设置。
 *
 * Algorithm based on Endfield website:
 * - Landscape: design base 1440 x 900
 * - Portrait: design base 390 x 844
 * - Scales by whichever dimension maintains aspect ratio
 */

// 提到模块级，保证引用稳定（否则每次 render 都会重建对象，
// 让 applyScale 的 useCallback 失效、effect 反复重挂载）
const DEFAULT_LANDSCAPE_BASE = { width: 1440, height: 900 }
const DEFAULT_PORTRAIT_BASE = { width: 390, height: 844 }

const useViewportScale = (options = {}) => {
  const {
    enabled = false,
    landscapeBase = DEFAULT_LANDSCAPE_BASE,
    portraitBase = DEFAULT_PORTRAIT_BASE,
    baseFontSize = 16,
    minFontSize = 14,
    maxFontSize = 24
  } = options

  // 缓存上一次的视口尺寸，避免无意义的重算
  const dimsRef = useRef({ width: 0, height: 0 })

  const applyScale = useCallback(() => {
    if (!isBrowser) return
    const html = document.documentElement

    // 未启用：不写入任何字号，并清掉可能残留的内联值
    if (!enabled) {
      if (html.style.fontSize) html.style.fontSize = ''
      html.style.removeProperty('--endspace-viewport-scale')
      html.style.removeProperty('--endspace-base-font-size')
      return
    }

    const innerWidth = window.innerWidth
    const innerHeight = window.innerHeight

    if (
      innerWidth === dimsRef.current.width &&
      innerHeight === dimsRef.current.height
    ) {
      return
    }
    dimsRef.current = { width: innerWidth, height: innerHeight }

    let fontSize = baseFontSize

    if (innerHeight >= innerWidth) {
      // Portrait：以竖屏基准等比缩放
      const { width: designWidth, height: designHeight } = portraitBase
      fontSize =
        innerWidth / innerHeight > designWidth / designHeight
          ? baseFontSize * (innerHeight / designHeight)
          : baseFontSize * (innerWidth / designWidth)
    } else {
      // Landscape：以横屏基准等比缩放
      const { width: designWidth, height: designHeight } = landscapeBase
      fontSize =
        innerWidth / innerHeight > designWidth / designHeight
          ? baseFontSize * (innerHeight / designHeight)
          : baseFontSize * (innerWidth / designWidth)
    }

    fontSize = Math.max(minFontSize, Math.min(maxFontSize, fontSize))

    html.style.fontSize = `${fontSize}px`
    html.style.setProperty(
      '--endspace-viewport-scale',
      (fontSize / baseFontSize).toString()
    )
    html.style.setProperty('--endspace-base-font-size', `${fontSize}px`)
  }, [
    enabled,
    landscapeBase,
    portraitBase,
    baseFontSize,
    minFontSize,
    maxFontSize
  ])

  useEffect(() => {
    if (!isBrowser) return

    applyScale()

    const handleResize = () => applyScale()
    // 旋转屏幕后等浏览器稳定再算
    const handleOrientationChange = () => setTimeout(() => applyScale(), 100)

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [applyScale])

  return { applyScale }
}

export default useViewportScale

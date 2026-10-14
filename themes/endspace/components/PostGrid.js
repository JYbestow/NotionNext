'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'
import { BlogPostCard } from './BlogPostCard'

/**
 * PostGrid —— 首页 / 列表页的紧凑文章网格
 *
 * 列数：<720px 单列 / 720–1099px 两列 / ≥1100px 由 ENDSPACE_POST_GRID_COLUMNS 决定（默认 3）
 * 原实现是 <div id="posts-wrapper"> 里直接堆 <article>，没有任何 grid，
 * 于是每张卡片都是整行宽度（896–1075px）——这是首页只能放下一篇的核心原因。
 *
 * 入场揭示的渐进增强不变式：
 * - SSR 与服务端首屏输出 data-reveal="off"，此时没有任何隐藏规则，内容始终可见；
 * - 挂载后在 useLayoutEffect（浏览器绘制前）切换到 "on" 并同步标记首屏内已可见的项，
 *   因此不会出现「先显示→再隐藏→再淡入」的闪烁；
 * - 若 JS 失效，data-reveal 永远停在 "off"，内容不会被藏起来。
 * - 用户开启 prefers-reduced-motion 时完全不启用揭示。
 */
export const PostGrid = ({ posts = [] }) => {
  const rootRef = useRef(null)
  const [revealOn, setRevealOn] = useState(false)
  const [inView, setInView] = useState(() => new Set())

  const columns = Number(siteConfig('ENDSPACE_POST_GRID_COLUMNS', 3, CONFIG)) || 3

  // 服务端用 useEffect 语义（不警告），浏览器用 useLayoutEffect（绘制前执行）
  const useIsoLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect

  useIsoLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const items = Array.from(root.children)
    if (!items.length) return

    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    // 首屏内已经可见的项：立刻标记为已进入，避免闪烁
    const immediate = new Set()
    items.forEach((el, i) => {
      el.style.setProperty('--eds-rv-delay', `${Math.min(i, 8) * 55}ms`)
      if (el.getBoundingClientRect().top < window.innerHeight) immediate.add(i)
    })
    setInView(immediate)
    setRevealOn(true)

    // 其余项交给 IntersectionObserver
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const idx = items.indexOf(entry.target)
          if (idx >= 0) {
            setInView(prev => {
              if (prev.has(idx)) return prev
              const next = new Set(prev)
              next.add(idx)
              return next
            })
          }
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0 }
    )
    items.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [posts])

  return (
    <div
      id='posts-wrapper'
      ref={rootRef}
      className='eds-grid'
      data-reveal={revealOn ? 'on' : 'off'}
      style={{ '--eds-cols': columns }}>
      {posts.map((post, i) => (
        <div
          key={post.id || post.slug}
          className={`eds-item${inView.has(i) ? ' is-in' : ''}`}>
          <BlogPostCard post={post} index={i} showSummary={true} />
        </div>
      ))}
    </div>
  )
}

export default PostGrid

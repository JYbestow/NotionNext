'use client'

import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useRouter } from 'next/router'
import { useState } from 'react'
import CONFIG from '../config'

/**
 * ListHeader —— 紧凑站点身份头
 *
 * 替代原先约 400px 高、只有滚动水印、连站名都不显示的装饰横幅。
 * 结构沿用个人主页的三段式 eyebrow：[01] ──── LABEL，
 * 然后才是站名 / 一句话定位 / 统计，垂直占用控制在 150px 以内。
 */
export const ListHeader = ({ postCount, categoryOptions = [] }) => {
  const title = siteConfig('TITLE') || siteConfig('AUTHOR') || ''
  const bio = siteConfig('BIO') || ''
  const showStats = siteConfig('ENDSPACE_HOME_HERO_STATS', true, CONFIG)

  const stats = []
  if (showStats) {
    if (typeof postCount === 'number' && postCount > 0) {
      stats.push({ value: postCount, label: 'ARTICLES' })
    }
    if (categoryOptions.length > 0) {
      stats.push({ value: categoryOptions.length, label: 'CATEGORIES' })
    }
  }

  return (
    <header className='eds-hero'>
      {/* 制图网格底纹 */}
      <div className='eds-hero__mesh' aria-hidden='true' />

      <div className='eds-hero__in'>
        <p className='eds-eyebrow eds-mono'>
          <span className='eds-eyebrow__no'>
            <span>01</span>
          </span>
          <span>BLOG / 文章索引</span>
          <span className='eds-eyebrow__line' />
        </p>

        {title && <h1 className='eds-hero__title'>{title}</h1>}
        {bio && <p className='eds-hero__sub'>{bio}</p>}

        {stats.length > 0 && (
          <div className='eds-hero__stats eds-mono'>
            {stats.map((stat, i) => (
              <span key={stat.label}>
                {i > 0 && <span className='eds-hero__stat-sep'>/</span>}
                <b>{stat.value}</b> {stat.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}

/**
 * ListFilterBar —— 分类筛选 + 紧凑搜索
 *
 * 都是真实功能：分类走现有的 /category/<name> 路由，
 * 搜索走现有的 /search/<term> 路由（与 SearchInput 同一目标）。
 * 没有假按钮。
 */
export const ListFilterBar = ({ categoryOptions = [], activeCategory = '' }) => {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')

  const onSubmit = event => {
    event.preventDefault()
    const term = keyword.trim()
    if (!term) return
    router.push(`/search/${encodeURIComponent(term)}`)
  }

  return (
    <div className='eds-filter'>
      <nav className='eds-filter__cats' aria-label='文章分类'>
        <SmartLink
          href='/'
          className={`eds-chip${activeCategory ? '' : ' is-active'}`}>
          全部
        </SmartLink>

        {categoryOptions.map(category => (
          <SmartLink
            key={category.name}
            href={`/category/${category.name}`}
            className={`eds-chip${
              activeCategory === category.name ? ' is-active' : ''
            }`}>
            {category.name}
            {typeof category.count === 'number' && (
              <span className='eds-chip__n'>{category.count}</span>
            )}
          </SmartLink>
        ))}
      </nav>

      <form className='eds-search' role='search' onSubmit={onSubmit}>
        <input
          type='search'
          value={keyword}
          onChange={event => setKeyword(event.target.value)}
          placeholder='SEARCH'
          aria-label='搜索文章'
        />
        <button type='submit'>GO</button>
      </form>
    </div>
  )
}

export default ListHeader

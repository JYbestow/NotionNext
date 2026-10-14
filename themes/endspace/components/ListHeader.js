'use client'

import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useState } from 'react'
import { useRouter } from 'next/router'
import CONFIG from '../config'

/**
 * ListHeader —— 列表页的轻量 Hero（档案库身份头）
 *
 * 三段式：eyebrow（[01] ── LABEL）→ 站名 → 档案定位行 + 真实统计。
 * 垂直占用控制在 170px 以内 —— 不做大面积 Banner，工业站是靠信息密度而不是留白。
 *
 * 统计数字全部来自真实 props：postCount / categoryOptions / tagOptions。
 * KNOWLEDGE ARCHIVE、ENGINEERING NOTES 是站点的定位文案（可在 config.js / Notion 配置里改），
 * 不属于「数据字段」，因此不会伪造任何计数。
 */
export const ListHeader = ({
  postCount,
  categoryOptions = [],
  tagOptions = []
}) => {
  const title = siteConfig('TITLE') || siteConfig('AUTHOR') || ''
  const wordmark = siteConfig(
    'ENDSPACE_ARCHIVE_WORDMARK',
    'KNOWLEDGE ARCHIVE',
    CONFIG
  )
  const role = siteConfig('ENDSPACE_ARCHIVE_ROLE', 'ENGINEERING NOTES', CONFIG)
  const showStats = siteConfig('ENDSPACE_HOME_HERO_STATS', true, CONFIG)

  const stats = []
  if (showStats) {
    if (typeof postCount === 'number' && postCount > 0) {
      stats.push({ value: postCount, label: 'DOCUMENTS' })
    }
    if (categoryOptions.length > 0) {
      stats.push({ value: categoryOptions.length, label: 'CATEGORIES' })
    }
    if (tagOptions.length > 0) {
      stats.push({ value: tagOptions.length, label: 'TAGS' })
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
          <span>ARCHIVE / 知识档案库</span>
          <span className='eds-eyebrow__line' />
        </p>

        {title && <h1 className='eds-hero__title'>{title}</h1>}

        {(wordmark || role) && (
          <p className='eds-hero__wordmark eds-mono'>
            {wordmark && <span>{wordmark}</span>}
            {wordmark && role && (
              <span className='eds-hero__wm-sep' aria-hidden='true'>
                ·
              </span>
            )}
            {role && <span className='eds-hero__role'>{role}</span>}
          </p>
        )}

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
 * IndexHeader —— 索引页头（分类 / 标签 / 搜索）
 *
 * 让这些页面从「只有一列卡片」变成一张数据库索引表头：
 *   INDEX DATABASE ──── CATEGORY NODE            12 DOCUMENTS
 *   课程
 *
 * kindLabel（CATEGORY NODE / TAG MARKER / SEARCH QUERY）和计数都是真实值，
 * 计数取当前路由下真实命中的文章数。
 */
export const IndexHeader = ({ kindLabel, value, postCount, note }) => {
  return (
    <header className='eds-idx'>
      <div className='eds-idx__bar eds-mono'>
        <span className='eds-idx__k'>INDEX DATABASE</span>
        <span className='eds-idx__line' aria-hidden='true' />
        {kindLabel && <span className='eds-idx__kind'>{kindLabel}</span>}
        {typeof postCount === 'number' && (
          <span className='eds-idx__n'>
            <i>ARTICLE COUNT</i>
            <b>{postCount}</b>
          </span>
        )}
      </div>
      {value && <h2 className='eds-idx__val'>{value}</h2>}
      {note && <p className='eds-idx__note eds-mono'>{note}</p>}
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

import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import {
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight
} from '@tabler/icons-react'

/**
 * 分页控件 —— 直角工业风，与首页文章网格共用同一套视觉语言。
 *
 * 这里原来沿用 endspace 原生样式：外层是 bg-[#2a2a2a] 的深色圆角胶囊，
 * 里面塞 4 个 rounded-full 的白色圆形按钮，还叠了两层投影。
 * 放在 1px 描边、0 圆角、零阴影的新网格下面非常突兀
 * （线上实测：按钮 border-radius:9999px、背景纯白、box-shadow 非 none），
 * 所以整体重写：1px 描边、0 圆角、无阴影，只有悬停才出现信号黄。
 *
 * 行为与改造前完全一致：保留 first/prev/next/last 四个动作、
 * 保留搜索词 s 查询参数、保留从 asPath 推导列表页前缀的逻辑
 * （所以第 1 页的地址是 / 而不是 /page/1）。
 */

const PAGE_BTN =
  'w-9 h-9 flex items-center justify-center border transition-colors duration-200'

const PageBtn = ({ href, query, disabled, icon: Icon, label }) => {
  if (disabled) {
    return (
      <span
        aria-hidden='true'
        className={`${PAGE_BTN} border-[var(--eds-line)] text-[var(--endspace-text-muted)] opacity-40 cursor-not-allowed`}>
        <Icon size={15} stroke={1.75} />
      </span>
    )
  }
  return (
    <SmartLink href={{ pathname: href, query }} legacyBehavior passHref>
      <a
        aria-label={label}
        className={`${PAGE_BTN} border-[var(--eds-line)] text-[var(--endspace-text-secondary)] hover:bg-[var(--endspace-accent-yellow)] hover:border-[var(--endspace-accent-yellow)] hover:text-[#0a0a0a]`}>
        <Icon size={15} stroke={1.75} />
      </a>
    </SmartLink>
  )
}

const pad = n => String(n).padStart(2, '0')

const PaginationNumber = ({ page, totalPage }) => {
  const router = useRouter()
  const currentPage = +page || 1
  const total = +totalPage || 1

  // 剥掉 /page/N 得到列表页前缀（与改造前一致）
  const pagePrefix = router.asPath
    .split('?')[0]
    .replace(/\/page\/[1-9]\d*/, '')
    .replace(/\/$/, '')
    .replace('.html', '')
  const to = n => `${pagePrefix}${n === 1 ? '/' : `/page/${n}`}`
  const query = router.query.s ? { s: router.query.s } : {}

  return (
    <nav
      aria-label='分页'
      className='mt-14 pt-6 border-t border-[var(--eds-line)] flex items-center justify-between gap-4'>
      <span className='eds-mono text-[var(--endspace-text-muted)]'>
        PAGE {pad(currentPage)} / {pad(total)}
      </span>
      <div className='flex items-center gap-2'>
        <PageBtn
          href={to(1)}
          query={query}
          disabled={currentPage === 1}
          icon={IconChevronsLeft}
          label='第一页'
        />
        <PageBtn
          href={to(Math.max(1, currentPage - 1))}
          query={query}
          disabled={currentPage <= 1}
          icon={IconChevronLeft}
          label='上一页'
        />
        <PageBtn
          href={to(Math.min(total, currentPage + 1))}
          query={query}
          disabled={currentPage >= total}
          icon={IconChevronRight}
          label='下一页'
        />
        <PageBtn
          href={to(total)}
          query={query}
          disabled={currentPage === total}
          icon={IconChevronsRight}
          label='最后一页'
        />
      </div>
    </nav>
  )
}

export default PaginationNumber

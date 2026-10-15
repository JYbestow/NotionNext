'use client'

import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { IconArrowRight, IconRefresh } from '@tabler/icons-react'

/**
 * ListStateNotice —— 列表页（分类 / 标签 / 搜索）的零结果与异常提示
 *
 * 视觉沿用 Endspace 的档案卡片语言：endspace-frame 外壳 + 等宽小标签 + 1px 分隔线，
 * 通体只有 hover 时才出现 1px 信号黄描边，不做大面积黄块装饰。
 *
 * 只负责渲染 state（由 lib/site/listState.js 的 resolveListState 判定），
 * 有结果时调用方不会渲染这个组件，列表 DOM 与改动前一致。
 *
 * @param {object} props
 * @param {object} props.state resolveListState() 的返回值
 */
export const ListStateNotice = ({ state }) => {
  const router = useRouter()
  if (!state) return null

  const actions = Array.isArray(state.actions) ? state.actions : []
  const chipClass =
    'inline-flex items-center gap-2 border border-[var(--endspace-border-base)] ' +
    'bg-[var(--endspace-bg-primary)] px-3 py-2 text-xs font-bold tracking-wide ' +
    'text-[var(--endspace-text-primary)] transition-colors ' +
    'hover:border-[var(--endspace-accent-yellow)] hover:bg-[var(--endspace-bg-secondary)]'

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <section
      className='endspace-frame mb-8 p-6 md:p-8'
      role='status'
      aria-live='polite'
    >
      <p className='eds-mono flex items-center gap-3 text-[10px] tracking-[0.16em] text-[var(--endspace-text-muted)]'>
        <span className='font-semibold text-[var(--endspace-text-primary)]'>
          {state.code}
        </span>
        <span
          className='h-px flex-1 bg-[var(--endspace-border-base)]'
          aria-hidden='true'
        />
      </p>

      <h2 className='mt-3 text-lg font-bold leading-snug text-[var(--endspace-text-primary)] md:text-xl'>
        {state.title}
      </h2>

      {state.description && (
        <p className='mt-2 max-w-2xl text-sm leading-relaxed text-[var(--endspace-text-secondary)]'>
          {state.description}
        </p>
      )}

      {(actions.length > 0 || state.retry) && (
        <div className='mt-5 flex flex-wrap items-center gap-3'>
          {actions.map(action =>
            action.route ? (
              <button
                key={`route-${action.route}-${action.label}`}
                type='button'
                className={chipClass}
                onClick={() => router.push(action.route)}
              >
                {action.label}
                <IconArrowRight size={11} stroke={2.2} />
              </button>
            ) : (
              <SmartLink
                key={`${action.href}-${action.label}`}
                href={action.href}
                className={chipClass}
              >
                {action.label}
                <IconArrowRight size={11} stroke={2.2} />
              </SmartLink>
            )
          )}

          {state.retry && (
            <button type='button' className={chipClass} onClick={handleRetry}>
              重试加载
              <IconRefresh size={12} stroke={2.2} />
            </button>
          )}
        </div>
      )}
    </section>
  )
}

export default ListStateNotice

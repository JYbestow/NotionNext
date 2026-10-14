import { useEffect } from 'react'
import { galleryVisibilityClassName } from '@/lib/notion/galleryVisibilityClassName'
import { Collection } from 'react-notion-x/build/third-party/collection'

export const GALLERY_VISIBILITY_WRAPPER_CLASS =
  'notion-gallery-visibility-wrapper'

/**
 * 判断两个地址是否指向同一个目标。Notion 的 URL 属性值有时不带结尾斜杠，
 * 而浏览器规范化后的 href 会补上，因此不能只做字符串比较。
 */
function isSameTarget(a, b) {
  if (!a || !b) return false
  if (a === b) return true
  try {
    return new URL(a).href === new URL(b).href
  } catch {
    return a.replace(/\/+$/, '') === b.replace(/\/+$/, '')
  }
}

/**
 * 画册卡片内的 URL 属性与整张卡片指向同一个地址（components/NotionPage.js 开启了
 * isLinkCollectionToUrlProperty）。react-notion-x 自带的 .nested-form-link 降级只覆盖
 * 卡片的 children，属性列表没有被覆盖，所以卡片里仍会留一个同地址的 <a>：
 * 既形成非法的 <a> 嵌套，也多出一个指向同一目标的 Tab 停靠点。
 *
 * 这里只做最小处理——摘掉它的 href 并移出 Tab 顺序，文字与外观完全不变；
 * 只有与卡片同目标的内部链接会被处理，卡片说明里的其它链接不受影响。
 */
function useNeutralizeDuplicateCardLinks() {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined

    const neutralize = () => {
      document
        .querySelectorAll('a.notion-collection-card[href][target="_blank"]')
        .forEach(card => {
          const href = card.getAttribute('href')
          card
            .querySelectorAll('.notion-collection-card-body a.notion-link[href]')
            .forEach(link => {
              if (!isSameTarget(link.getAttribute('href'), href)) return
              link.removeAttribute('href')
              link.setAttribute('tabindex', '-1')
            })
        })
    }

    neutralize()
    // 画册是异步渲染出来的，卡片挂载后需要再处理一次。
    const observer = new MutationObserver(neutralize)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])
}

export default function NotionCollection(props) {
  useNeutralizeDuplicateCardLinks()

  const collectionView = props.block?.view_ids
    ?.map(viewId => {
      const record = props.ctx?.recordMap?.collection_view?.[viewId]
      return record?.value?.value || record?.value || record
    })
    .find(view => view?.type === 'gallery')
  const className = galleryVisibilityClassName(collectionView)

  if (!className) return <Collection {...props} />

  return (
    <div className={`${GALLERY_VISIBILITY_WRAPPER_CLASS} ${className}`}>
      <Collection {...props} />
    </div>
  )
}

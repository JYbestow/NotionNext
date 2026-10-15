import { galleryVisibilityClassName } from '@/lib/notion/galleryVisibilityClassName'
import { Collection } from 'react-notion-x/build/third-party/collection'

export const GALLERY_VISIBILITY_WRAPPER_CLASS =
  'notion-gallery-visibility-wrapper'

/**
 * 画册（友链）合集渲染入口。
 *
 * 说明：这里曾经用 useEffect 在水合之后逐个摘掉卡片内层 <a> 的 href，
 * 用来规避 isLinkCollectionToUrlProperty 造成的 <a> 嵌套。那种事后 DOM 补丁
 * 改不了服务端 HTML，水合依旧失败（线上 /links：#418×29 + #423×1），
 * 所以改为在渲染期解决：见 components/NotionCollectionUrlProperty.js，
 * 由 components/NotionPage.js 通过 components.propertyUrlValue 注入。
 */

export default function NotionCollection(props) {
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

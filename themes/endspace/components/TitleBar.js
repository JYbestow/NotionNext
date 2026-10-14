import { ListHeader } from './ListHeader'
import { getPostCover } from './getCover'

/**
 * TitleBar —— 页面顶部条，两种形态：
 *
 * 1. 列表页（首页 / 归档 / 搜索 / 分类 / 标签）：紧凑站点身份头，垂直占用约 140px。
 *    原实现在这里渲染的是 `relative py-20 md:py-28`（上下各 80/112px 内边距）
 *    加一行 `text-[10rem] md:text-[14rem]` 的滚动水印，整体约 400px 高：
 *    既没有站名、也没有定位信息，只有装饰，而且是 30s 无限循环动画。
 *
 * 2. 文章页：保留原有的封面横幅，正文排版不受影响。
 */
export const TitleBar = ({
  post,
  postCount,
  sitePostCount,
  categoryOptions,
  tagOptions
}) => {
  // —— 列表页：紧凑身份头（替代原装饰横幅）
  if (!post) {
    return (
      <ListHeader
        postCount={postCount}
        sitePostCount={sitePostCount}
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
      />
    )
  }

  // —— 文章页：封面横幅
  const cover = getPostCover(post)
  return (
    <div className='relative py-20 md:py-28 border-b-2 border-[var(--endspace-border-base)] overflow-hidden bg-[var(--endspace-bg-base)]'>
      {cover && (
        <div className='absolute inset-0'>
          <img
            src={cover}
            alt={post.title || 'Cover'}
            className='w-full h-full object-cover'
            // 图源失效时直接隐藏，让下面的网格底纹顶上，避免出现"破图"图标
            onError={event => {
              event.currentTarget.style.display = 'none'
            }}
          />
          {/* Dark overlay for better contrast */}
          <div className='absolute inset-0 bg-black/40' />
        </div>
      )}

      {/* Background Pattern - Grid overlay effect */}
      <div className='absolute inset-0 opacity-10 pointer-events-none'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 2px, var(--endspace-text-muted) 2px, var(--endspace-text-muted) 4px),
              repeating-linear-gradient(90deg, transparent, transparent 2px, var(--endspace-text-muted) 2px, var(--endspace-text-muted) 4px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
      </div>
    </div>
  )
}

export default TitleBar

import TwikooCommentCount from '@/components/TwikooCommentCount'
import SmartLink from '@/components/SmartLink'

export default function BlogItem({ post }) {
  const date = post.date?.start_date || post.createdTime

  return (
    <article className='mb-6'>
      {/* 说明：整卡链接与分类链接必须是「兄弟」而不是「父子」。
          此前外层 SmartLink 包住整张卡片，卡片内又有分类 SmartLink，
          于是产生非法的 <a> 嵌套：浏览器解析时会提前闭合外层 <a>，
          解析后的 DOM 与 React 渲染的树不一致，水合会失败。
          这里把 group 上移到视觉卡片、元信息行移出外层链接，
          外观与 hover 效果不变，整卡与分类各自仍是独立链接。

          整张卡片可点则用 stretched-link：卡片容器设为 relative，
          文章链接内部放一个铺满卡片的 aria-hidden 覆盖层（span，不是 <a>，
          因此不产生嵌套锚点），分类/评论等独立链接再各自提升层级，
          保证它们依然可以被单独点击、Tab 聚焦，语义与目标地址都不变。 */}
      <div className='relative border-2 border-[#0284c7] rounded-sm shadow-[4px_4px_0px_0px_#0284c7] bg-[#ffffff] dark:bg-slate-800 p-5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#0284c7] active:translate-y-0 active:shadow-[2px_2px_0px_0px_#0284c7] transition-all group'>
        <SmartLink href={post?.href} className='no-underline block'>
          <span aria-hidden='true' className='absolute inset-0' />
          <div className='text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono'>
            {date?.slice(0, 10)}
          </div>

          <h2 className='text-xl font-black text-slate-900 dark:text-slate-100 group-hover:text-[#0284c7] transition-colors mb-2'>
            {post.title}
          </h2>

          {post.summary && (
            <p className='text-sm text-slate-600 dark:text-slate-400 font-semibold leading-relaxed line-clamp-2 mb-3'>
              {post.summary}
            </p>
          )}
        </SmartLink>

        <div className='flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wider'>
          {post.category && (
            <SmartLink
              href={`/category/${post.category}`}
              className='relative z-10'>
              <span className='inline-block border-2 border-[#0284c7] rounded-sm shadow-[1px_1px_0px_0px_#0284c7] px-2 py-0.5 text-[#0284c7] bg-[#fde68a] hover:bg-[#0284c7] hover:text-white transition-colors'>
                {post.category}
              </span>
            </SmartLink>
          )}
          <TwikooCommentCount
            post={post}
            className='relative z-10 text-slate-400 dark:text-slate-500'
          />
        </div>
      </div>
    </article>
  )
}

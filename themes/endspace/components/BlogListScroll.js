import { PostGrid } from './PostGrid'

/**
 * BlogListScroll Component - 无限滚动文章列表（紧凑工业网格）
 */
export const BlogListScroll = ({ posts = [] }) => {
  return (
    <div className='w-full'>
      <PostGrid posts={posts} />
    </div>
  )
}

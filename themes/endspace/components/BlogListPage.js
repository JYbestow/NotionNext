import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import PaginationNumber from './PaginationNumber'
import { PostGrid } from './PostGrid'

/**
 * BlogListPage Component - 分页文章列表（紧凑工业网格）
 */
export const BlogListPage = ({ posts = [], page = 1, postCount }) => {
  const { NOTION_CONFIG } = useGlobal()
  const POSTS_PER_PAGE = siteConfig('POSTS_PER_PAGE', 12, NOTION_CONFIG)
  const totalPage = Math.ceil(postCount / POSTS_PER_PAGE)

  return (
    <div className='w-full'>
      <PostGrid posts={posts} />

      {/* Pagination */}
      {totalPage > 1 && <PaginationNumber page={page} totalPage={totalPage} />}
    </div>
  )
}

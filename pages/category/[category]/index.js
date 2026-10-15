import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { isSiteDataUnavailable } from '@/lib/site/listState'
import { DynamicLayout } from '@/themes/theme'

/**
 * 分类页
 * @param {*} props
 * @returns
 */
export default function Category(props) {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutPostList' {...props} />
}

export async function getStaticProps({ params: { category }, locale }) {
  const from = 'category-props'
  let props = await fetchGlobalAllData({ from, locale })

  // 过滤状态
  props.posts = props.allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  )
  // 处理过滤
  props.posts = props.posts.filter(
    post => post && post.category && post.category.includes(category)
  )

  // 全站文章总数：定义与 lib/db/SiteDataApi 里的 postCount 完全一致。
  // 下面的 props.postCount 会被覆盖成「当前分类命中的文章数」（那是 IndexHeader 要显示的），
  // 所以趁 allPages 还在，单独留一个站点级字段给 Hero 用，避免同一个 Hero 混两种口径。
  props.sitePostCount = props.allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  ).length

  // 处理文章页数
  props.postCount = props.posts.length
  // 处理分页
  const POST_LIST_STYLE = siteConfig(
    'POST_LIST_STYLE',
    'page',
    props?.NOTION_CONFIG
  )
  if (POST_LIST_STYLE === 'scroll') {
    // 滚动列表 给前端返回所有数据
  } else if (POST_LIST_STYLE === 'page') {
    props.posts = props.posts?.slice(
      0,
      siteConfig('POSTS_PER_PAGE', 12, props?.NOTION_CONFIG)
    )
  }

  // 数据源读取失败（fetchGlobalAllData 的兜底数据）与「该分类下没有文章」必须分开报
  props.dataUnavailable = isSiteDataUnavailable(props)

  delete props.allPages

  props = { ...props, category }

  return {
    props,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props.NOTION_CONFIG
        )
  }
}

export async function getStaticPaths() {
  const from = 'category-paths'
  const { categoryOptions } = await fetchGlobalAllData({ from })
  const categories = Array.isArray(categoryOptions) ? categoryOptions : []
  return {
    paths: categories.map(category => ({
      params: { category: category?.name }
    })),
    fallback: true
  }
}

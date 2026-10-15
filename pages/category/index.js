import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { isSiteDataUnavailable } from '@/lib/site/listState'
import { DynamicLayout } from '@/themes/theme'

/**
 * 分类首页
 * @param {*} props
 * @returns
 */
export default function Category(props) {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return (
    <DynamicLayout theme={theme} layoutName='LayoutCategoryIndex' {...props} />
  )
}

export async function getStaticProps({ locale }) {
  const props = await fetchGlobalAllData({ from: 'category-index-props', locale })
  // 必须在删除 allPages 之前判定：数据源读取失败时 fetchGlobalAllData 会用兜底数据，
  // 不识别的话「加载失败」会被显示成「暂无分类」。
  props.dataUnavailable = isSiteDataUnavailable(props)
  delete props.allPages
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

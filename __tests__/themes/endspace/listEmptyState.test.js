/**
 * Endspace 列表页「零结果 / 异常」状态回归测试
 *
 * 覆盖 /category、/tag、/search 的四类状态：
 *   ① 空分类 / 空标签   ② 搜索无结果   ③ 分类 / 标签不存在   ④ 数据加载失败
 * 并锁定「有结果时不渲染空态、列表容器照旧」这一不变式。
 *
 * 被替换成轻量桩的只有叶子组件（PostGrid / NotionPage / Comment / ShareBar）与
 * 会引入 ESM-only 依赖的 FloatingControls（notion-utils，jest 不转译 node_modules）——
 * 判定逻辑（lib/site/listState.js）与布局接线都是真实代码。
 *
 * @jest-environment node
 */
import { renderToStaticMarkup } from 'react-dom/server'

let mockPathname = '/category/x'
jest.mock('next/router', () => ({
  useRouter: () => ({
    isFallback: false,
    isReady: true,
    pathname: mockPathname,
    query: {},
    asPath: mockPathname,
    push: jest.fn(),
    replace: jest.fn()
  })
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: props => {
    const React = require('react')
    const { children, legacyBehavior, passHref, ...rest } = props
    return React.createElement('a', rest, children)
  }
}))

jest.mock('@/lib/global', () => ({
  useGlobal: () => ({
    NOTION_CONFIG: {},
    onLoading: false,
    fullWidth: false,
    locale: {}
  }),
  getGlobalSnapshot: () => ({}),
  GlobalContextProvider: props => props.children
}))

jest.mock('@/components/NotionPage', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('@/components/Comment', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('@/components/ShareBar', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('@/themes/endspace/components/FloatingControls', () => ({
  __esModule: true,
  default: () => null
}))

jest.mock('@/themes/endspace/components/PostGrid', () => {
  const React = require('react')
  const PostGrid = ({ posts = [] }) =>
    React.createElement(
      'div',
      { id: 'posts-wrapper', className: 'eds-grid', 'data-count': posts.length },
      posts.map(post =>
        React.createElement('article', { key: post.id }, post.title)
      )
    )
  return { __esModule: true, PostGrid, default: PostGrid }
})

const React = require('react')
const { LayoutPostList, LayoutSearch, LayoutCategoryIndex, LayoutTagIndex } =
  require('@/themes/endspace')

const render = (Layout, props) =>
  renderToStaticMarkup(React.createElement(Layout, props))

const posts = [
  { id: 'a', slug: 'a', title: '文章 A' },
  { id: 'b', slug: 'b', title: '文章 B' }
]

describe('有结果时不渲染任何空态（列表容器照旧）', () => {
  it('分类详情页', () => {
    const html = render(LayoutPostList, {
      category: '课程',
      posts,
      postCount: 2,
      allCategoryNames: ['课程']
    })
    expect(html).toContain('data-count="2"')
    expect(html).not.toContain('CATEGORY_EMPTY')
    expect(html).not.toContain('DATA_SOURCE_OFFLINE')
  })

  it('搜索页', () => {
    const html = render(LayoutSearch, {
      keyword: 'foo',
      posts,
      postCount: 2
    })
    expect(html).toContain('data-count="2"')
    expect(html).not.toContain('NO_MATCH')
  })

  it('分类索引 / 标签索引', () => {
    expect(
      render(LayoutCategoryIndex, {
        categoryOptions: [{ name: '课程', count: 2 }],
        postCount: 2
      })
    ).toContain('id="category-list"')
    expect(
      render(LayoutTagIndex, {
        tagOptions: [{ name: 'CSS', count: 2 }],
        postCount: 2
      })
    ).toContain('id="tags-list"')
  })

  it('路由回退（fallback）期间不判定空态', () => {
    // isFallback 由 next/router mock 控制，这里直接验证判定函数契约
    const { resolveListState } = require('@/lib/site/listState')
    expect(
      resolveListState({
        kind: 'category',
        value: '课程',
        visibleCount: 0,
        totalCount: 0,
        loading: true
      })
    ).toBeNull()
  })
})

describe('① 空分类 / 空标签', () => {
  it('分类存在但没有文章', () => {
    const html = render(LayoutPostList, {
      category: '课程',
      posts: [],
      postCount: 0,
      allCategoryNames: ['课程', '随笔']
    })
    expect(html).toContain('CATEGORY_EMPTY')
    expect(html).toContain('该分类下暂无文章')
    expect(html).toContain('href="/"')
    expect(html).toContain('href="/category"')
  })

  it('标签存在但没有文章', () => {
    const html = render(LayoutPostList, {
      tag: 'CSS',
      posts: [],
      postCount: 0,
      allTagNames: ['CSS']
    })
    expect(html).toContain('TAG_EMPTY')
    expect(html).toContain('该标签下暂无文章')
    expect(html).toContain('href="/tag"')
  })
})

describe('② 搜索无结果', () => {
  it('给出关键词 + 清除搜索 + 返回全部文章', () => {
    const html = render(LayoutSearch, {
      keyword: '不存在',
      posts: [],
      postCount: 0
    })
    expect(html).toContain('没有匹配「不存在」的文章')
    expect(html).toContain('清除搜索')
    expect(html).toContain('href="/"')
    expect(html).toContain('id="posts-wrapper"')
  })

  it('/search 首帧（query 还没解析）不显示「请输入搜索关键词」', () => {
    mockPathname = '/search'
    const html = render(LayoutSearch, { keyword: '', posts: [], postCount: 0 })
    expect(html).not.toContain('NO_QUERY')
    mockPathname = '/category/x'
  })
})

describe('③ 分类 / 标签不存在（文案区别于「暂无文章」）', () => {
  it('分类不存在', () => {
    const html = render(LayoutPostList, {
      category: '拼错的分类',
      posts: [],
      postCount: 0,
      allCategoryNames: ['课程']
    })
    expect(html).toContain('分类「拼错的分类」不存在')
    expect(html).not.toContain('该分类下暂无文章')
    expect(html).toContain('href="/category"')
  })

  it('标签不存在', () => {
    const html = render(LayoutPostList, {
      tag: 'Perl',
      posts: [],
      postCount: 0,
      allTagNames: ['CSS']
    })
    expect(html).toContain('标签「#Perl」不存在')
    expect(html).not.toContain('该标签下暂无文章')
  })

  it('清单不可用时按「暂无文章」处理，不误报不存在', () => {
    const html = render(LayoutPostList, {
      category: '课程',
      posts: [],
      postCount: 0,
      allCategoryNames: undefined
    })
    expect(html).toContain('CATEGORY_EMPTY')
    expect(html).not.toContain('CATEGORY_NOT_FOUND')
  })
})

describe('④ 数据加载失败（不得显示成「没有文章」）', () => {
  it('分类页：加载失败文案 + 重试，且不显示 ARTICLE COUNT 0', () => {
    const html = render(LayoutPostList, {
      category: '课程',
      posts: [],
      postCount: 0,
      dataUnavailable: true
    })
    expect(html).toContain('内容加载失败，请稍后重试')
    expect(html).toContain('重试加载')
    expect(html).not.toContain('该分类下暂无文章')
    expect(html).not.toContain('ARTICLE COUNT')
  })

  it('搜索页：加载失败 ≠ 没有匹配', () => {
    const html = render(LayoutSearch, {
      keyword: 'foo',
      posts: [],
      postCount: 0,
      dataUnavailable: true
    })
    expect(html).toContain('DATA_SOURCE_OFFLINE')
    expect(html).not.toContain('没有匹配')
  })

  it('分类索引：加载失败 ≠ 暂无分类', () => {
    const html = render(LayoutCategoryIndex, {
      categoryOptions: [],
      postCount: 1,
      dataUnavailable: true
    })
    expect(html).toContain('DATA_SOURCE_OFFLINE')
    expect(html).not.toContain('NO_CATEGORIES')
  })
})

describe('分页越界与空索引', () => {
  it('分页越界不是「暂无文章」', () => {
    const html = render(LayoutPostList, {
      category: '课程',
      posts: [],
      postCount: 13,
      page: '99',
      allCategoryNames: ['课程']
    })
    expect(html).toContain('PAGE_OUT_OF_RANGE')
    expect(html).toContain('第 99 页没有文章')
  })

  it('分类索引 / 标签索引为空', () => {
    expect(
      render(LayoutCategoryIndex, { categoryOptions: [], postCount: 0 })
    ).toContain('NO_CATEGORIES')
    expect(
      render(LayoutTagIndex, { tagOptions: [], postCount: 0 })
    ).toContain('NO_TAGS')
  })
})

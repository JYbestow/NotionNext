/**
 * 列表页「零结果 / 异常」状态判定（分类详情、标签详情、搜索、分页列表）
 *
 * 三个设计约束：
 * 1. 判定与渲染分离：有结果、或路由还没就绪时返回 null，调用方保持原有列表渲染，
 *    有结果时的 DOM 与改动前完全一致。
 * 2. 「数据加载失败」必须与「没有文章」分开，且优先级最高：
 *    fetchGlobalAllData 内部会吞掉异常并用 EmptyData 兜底（一篇文章的假数据），
 *    若不识别，分类/标签页会把它当成「该分类下暂无文章」，正是要避免的误报。
 * 3. 纯函数、零依赖：可以直接用 node 跑真值表验证分支。
 */

/** EmptyData 兜底文章的特征（真实 Notion 页面 id 是 uuid 字符串，slug 不会叫 oops） */
const FALLBACK_SLUG = 'oops'
const FALLBACK_TITLE_MARK = '无法获取Notion数据'

/**
 * 判断这份 props 是不是「数据源读取失败」的兜底数据，而不是「站点确实没有文章」。
 * 必须传入还保留 allPages 的 props（各页面在 delete props.allPages 之前调用）。
 * @param {object} props getStaticProps 返回的 props
 * @returns {boolean}
 */
export function isSiteDataUnavailable(props) {
  const allPages = props?.allPages
  if (!Array.isArray(allPages) || allPages.length !== 1) return false
  const only = allPages[0]
  if (!only || typeof only !== 'object') return false
  return (
    typeof only.id === 'number' &&
    only.slug === FALLBACK_SLUG &&
    typeof only.title === 'string' &&
    only.title.includes(FALLBACK_TITLE_MARK)
  )
}

const ACTION_ALL_POSTS = { label: '返回全部文章', href: '/' }
const ACTION_ARCHIVE = { label: '浏览全部归档', href: '/archive' }
const ACTION_CATEGORIES = { label: '浏览所有分类', href: '/category' }
const ACTION_TAGS = { label: '浏览所有标签', href: '/tag' }

const toCount = value => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : 0
}

const firstPageHref = (kind, name) => {
  switch (kind) {
    case 'category':
      return `/category/${encodeURIComponent(name)}`
    case 'tag':
      return `/tag/${encodeURIComponent(name)}`
    case 'search':
      return `/search/${encodeURIComponent(name)}`
    default:
      return '/'
  }
}

/**
 * 该分类 / 标签名是否在「全站清单」里被定义过。
 * 注意：categoryOptions / tagOptions 只包含「至少 1 篇已发布文章」的项，
 * 所以判定存在性必须用未过滤的 allCategoryNames / allTagNames。
 * @returns {boolean|null} null = 清单不可用，无法判定（此时按「存在但为空」处理，避免误报不存在）
 */
const isDefined = (knownNames, name) => {
  const roster = Array.isArray(knownNames)
    ? knownNames.filter(item => typeof item === 'string')
    : null
  if (!roster || roster.length === 0) return null
  return roster.includes(name)
}

/**
 * 未知分类 / 标签：URL 里的名字不在全站清单里。
 *
 * 为什么要单独判定，而不能等 visibleCount === 0：
 * 数据层对未知分类 / 标签会退化成「显示全部文章」，于是 visibleCount > 0，
 * 页面看起来和一个正常标签页一模一样 —— 实测 /tag/zzz不存在标签 会渲染出 12 张卡片，
 * 用户会以为这个标签真的存在。这是「无效路由」，必须与「标签下暂无文章」区分开。
 *
 * 清单不可用时 isDefined 返回 null，这里一律按「无法判定」处理，绝不误报不存在。
 */
const isUnknownName = (kind, value, knownNames) => {
  if (kind !== 'category' && kind !== 'tag') return false
  const name = typeof value === 'string' ? value.trim() : ''
  return !!name && isDefined(knownNames, name) === false
}

/**
 * 列表页状态判定。
 *
 * @param {object} options
 * @param {'category'|'tag'|'search'|'list'|'categoryIndex'|'tagIndex'} [options.kind]
 * @param {string} [options.value] 分类名 / 标签名 / 搜索关键词
 * @param {number} [options.visibleCount] 当前页实际渲染的文章数（props.posts.length）
 * @param {number} [options.totalCount] 当前筛选条件下的总命中数（props.postCount）
 * @param {string[]} [options.knownNames] 未过滤的分类 / 标签清单（判断「不存在」）
 * @param {number|string} [options.page] 当前页码（仅分页路由有）
 * @param {boolean} [options.dataUnavailable] 数据源读取失败
 * @param {boolean} [options.loading] 路由回退 / 查询串未就绪：不判定，保持原样
 * @returns {null|{tone:string,code:string,title:string,description:string,actions:Array,retry?:boolean}} null = 有结果或加载中，渲染原列表
 */
export function resolveListState(options = {}) {
  const {
    kind = 'list',
    value = '',
    visibleCount = 0,
    totalCount,
    knownNames,
    page,
    dataUnavailable = false,
    loading = false
  } = options

  // 路由回退（fallback）/ 查询串未就绪：此时 props 还没到，不能判定空态
  if (loading) return null
  // 有结果：交给原有列表渲染，不改动任何输出。
  // 例外：未知分类 / 标签必须判定为「不存在」（原因见 isUnknownName 的注释）。
  if (toCount(visibleCount) > 0 && !isUnknownName(kind, value, knownNames)) {
    return null
  }

  const name = typeof value === 'string' ? value.trim() : ''
  const total = totalCount === undefined ? toCount(visibleCount) : toCount(totalCount)
  const pageNo = Number(page) || 1

  // ④ 数据加载失败（优先级最高：数据没读到就不能说「暂无文章」）
  if (dataUnavailable) {
    return {
      tone: 'error',
      code: 'DATA_SOURCE_OFFLINE',
      title: '内容加载失败，请稍后重试',
      description:
        '没有读到站点的内容数据，这不代表「没有文章」。可以重试加载，或先回到首页、浏览已生成的归档。',
      actions: [ACTION_ALL_POSTS, ACTION_ARCHIVE],
      retry: true
    }
  }

  // 分页越界：总命中数 > 0 但当前页是空的（例如 /category/x/page/99）
  if (pageNo > 1 && total > 0) {
    return {
      tone: 'empty',
      code: 'PAGE_OUT_OF_RANGE',
      title: `第 ${pageNo} 页没有文章`,
      description: `当前筛选条件下一共有 ${total} 篇文章，这一页没有内容。`,
      actions: [{ label: '返回第 1 页', href: firstPageHref(kind, name) }, ACTION_ALL_POSTS]
    }
  }

  if (kind === 'search') {
    if (!name) {
      return {
        tone: 'prompt',
        code: 'NO_QUERY',
        title: '请输入搜索关键词',
        description: '在上方搜索框输入关键词后回车，即可检索站内文章。',
        actions: [ACTION_ALL_POSTS, ACTION_ARCHIVE]
      }
    }
    return {
      tone: 'empty',
      code: 'NO_MATCH',
      title: `没有匹配「${name}」的文章`,
      description:
        '标题、摘要、分类或标签都没有命中这个关键词。可以换一个更短的关键词，或直接浏览全部文章。',
      actions: [
        // SmartLink 会把当前页 URL 上的 query 带到目标地址上（见 components/SmartLink.js），
        // 清除搜索必须绕开它，用路由跳转而不是 <Link href='/search'>。
        { label: '清除搜索', route: '/search' },
        ACTION_ALL_POSTS,
        ACTION_ARCHIVE
      ]
    }
  }

  if (kind === 'category') {
    if (!name) return noRecords()
    if (isDefined(knownNames, name) === false) {
      return {
        tone: 'missing',
        code: 'CATEGORY_NOT_FOUND',
        title: `分类「${name}」不存在`,
        description:
          'URL 里的分类名没有对应的分类节点，可能已被重命名或删除。这与「分类下暂无文章」是两回事。',
        actions: [ACTION_CATEGORIES, ACTION_ALL_POSTS]
      }
    }
    return {
      tone: 'empty',
      code: 'CATEGORY_EMPTY',
      title: '该分类下暂无文章',
      description: `分类「${name}」目前没有任何已发布的文章。`,
      actions: [ACTION_ALL_POSTS, ACTION_CATEGORIES]
    }
  }

  if (kind === 'tag') {
    if (!name) return noRecords()
    if (isDefined(knownNames, name) === false) {
      return {
        tone: 'missing',
        code: 'TAG_NOT_FOUND',
        title: `标签「#${name}」不存在`,
        description:
          'URL 里的标签没有对应的标签标记，可能已被重命名或删除。这与「标签下暂无文章」是两回事。',
        actions: [ACTION_TAGS, ACTION_ALL_POSTS]
      }
    }
    return {
      tone: 'empty',
      code: 'TAG_EMPTY',
      title: '该标签下暂无文章',
      description: `标签「#${name}」目前没有被任何已发布的文章使用。`,
      actions: [ACTION_ALL_POSTS, ACTION_TAGS]
    }
  }

  if (kind === 'categoryIndex') {
    return {
      tone: 'empty',
      code: 'NO_CATEGORIES',
      title: '暂无分类',
      description:
        '站点还没有任何分类节点；如果确实建过分类，可能是这些分类下的文章都还没发布。',
      actions: [ACTION_ALL_POSTS, ACTION_ARCHIVE]
    }
  }

  if (kind === 'tagIndex') {
    return {
      tone: 'empty',
      code: 'NO_TAGS',
      title: '暂无标签',
      description:
        '站点还没有任何标签标记；如果确实打过标签，可能是这些文章都还没发布。',
      actions: [ACTION_ALL_POSTS, ACTION_ARCHIVE]
    }
  }

  return noRecords()
}

function noRecords() {
  return {
    tone: 'empty',
    code: 'NO_RECORDS',
    title: '这里暂无文章',
    description: '当前列表还没有可显示的文章。',
    actions: [ACTION_ALL_POSTS]
  }
}

export default resolveListState

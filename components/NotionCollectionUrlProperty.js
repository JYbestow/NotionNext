/**
 * 画册（友链）卡片内 URL 属性的降级渲染 —— 必须发生在「渲染期」。
 *
 * 背景
 * ----
 * components/NotionPage.js 开启了 react-notion-x 的 isLinkCollectionToUrlProperty，
 * 由外层 <a class="notion-collection-card" href=...> 承担整卡跳转；而卡片内的 URL 属性
 * 由 react-notion-x 的 URL 渲染器直接输出 `<a class="notion-link" href=...>`
 * （node_modules/react-notion-x/build/third-party/collection.js L4057），
 * 于是形成 <a> 嵌套。
 *
 * 嵌套 <a> 属于非法 HTML：浏览器 HTML 解析器遇到内层 <a> 时会提前闭合外层 <a>
 * （仅字符串层面的 HTML 不会报错，但解析后的 DOM 树已经与 React 渲染的树不同），
 * 水合时 React 逐处比对失败 —— 线上 /links 的 19 张友链卡片正好对应
 * React #418 × 29 + #423 × 1。
 *
 * 为什么不能用 useEffect 事后补丁
 * ----------------------------
 * 之前 components/NotionCollection.js 在水合之后用 DOM 操作摘掉内层 <a> 的 href。
 * 那既改不了服务端已经发出的 HTML（水合错误照旧），又白白多一次全文档 DOM 遍历。
 *
 * 现在的做法
 * --------
 * 使用库提供的官方渲染钩子 components.propertyUrlValue
 * （collection.js L4458：`content = components.propertyUrlValue(props, renderUrlValue)`），
 * 在服务端与客户端**同一次渲染**里就把画册卡片内的 URL 属性渲染成纯文本 <span>：
 *   - 服务端 HTML 与客户端首次渲染结构完全一致，水合无差异；
 *   - 文案（domain + 与库一致的 path 截断）与外观 class（notion-link /
 *     notion-url-domain / notion-url-path）保持不变，只是不再是 <a>；
 *   - 整张卡片仍是唯一的外链 <a>（target=_blank、rel=noopener noreferrer），
 *     每张卡片仍只有一个 Tab 停靠点；
 *   - 页面级（非卡片）的 URL 属性完全不受影响。
 *
 * 判别依据：react-notion-x 只在画册卡片的属性列表里传 `inline: true`
 * （collection.js L4672，全包唯一一处），页面级属性不会带这个标记。
 */

/**
 * @param {object} props react-notion-x Property 组件的原始 props
 *        （{ schema, data, block, collection, inline }）
 * @param {Function} renderDefault 库自带的 URL 属性渲染器
 * @returns {JSX.Element} 卡片内为纯文本，其余情况沿用库的默认实现
 */
const NotionCollectionUrlProperty = (props, renderDefault) => {
  // 非画册卡片（页面级属性）保持库的默认行为，仍是可点击的 <a>
  if (!props?.inline) return renderDefault(props)

  const rawUrl = props?.data?.[0]?.[0]
  if (!rawUrl) return renderDefault(props)

  let domain = rawUrl
  let path = ''
  try {
    const url = new URL(rawUrl)
    domain = url.hostname.replace(/^www\./, '')
    const rawPath = url.pathname === '/' ? '' : url.pathname
    // 与库保持一致的 path 截断规则
    path = rawPath.length > 20 ? `${rawPath.slice(0, 8)}...${rawPath.slice(-8)}` : rawPath
  } catch {
    // 不是合法 URL：交给库的默认实现（它会渲染成不带链接的 Text）
    return renderDefault(props)
  }

  return (
    <span className='notion-link'>
      <span className='notion-url-domain'>{domain}</span>
      {path && <span className='notion-url-path'>{path}</span>}
    </span>
  )
}

export default NotionCollectionUrlProperty

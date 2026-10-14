/**
 * 文章内嵌 PDF 块的渲染。
 *
 * 背景：Notion 的 pdf 块（react-notion-x 的 Pdf 组件）原本只是
 *   <object data={file} width='100%' height='100%'>
 * 而 object 的 height:100% 在没有高度的父容器里会塌成 ~320px 高，
 * 于是 PDF 只能挤在 544x320 的小框里；正文阅读宽度有 896px，
 * 对讲义、试卷这类长文档基本没法读。
 *
 * 这里改成：宽度铺满正文栏 + 固定按 A4 比例给高度 + 顶部一条
 * 始终可见的信息条（文件名 / 在新标签打开），
 * 这样即使浏览器不支持内嵌预览也有明确的出口。
 */
export function Pdf({ file, block }) {
  // react-notion-x 传下来的是 file；兜底从 block 里取 source
  const src =
    file ||
    block?.properties?.source?.[0]?.[0] ||
    block?.properties?.source?.[0] ||
    null

  if (!src) return null

  // 从签名 URL 里还原出真实文件名，解析失败就退回一个通用名字
  let name = 'PDF 文档'
  try {
    const last = decodeURIComponent(String(src).split('?')[0].split('/').pop() || '')
    if (last) name = last
  } catch (_) {
    /* 文件名解析失败不影响渲染 */
  }
  // Notion 签名地址的最后一段形如 attachment:<uuid>:<真实文件名>，去掉前缀
  name = name.replace(/^attachment:[0-9a-f-]{36}:/i, '') || 'PDF 文档'

  return (
    <div className='eds-pdf'>
      <div className='eds-pdf__bar'>
        <span className='eds-mono eds-pdf__tag'>PDF</span>
        <span className='eds-pdf__name' title={name}>
          {name}
        </span>
        <a
          className='eds-pdf__open'
          href={src}
          target='_blank'
          rel='noopener noreferrer'>
          在新标签打开 ↗
        </a>
      </div>
      <object className='eds-pdf__view' data={src} type='application/pdf'>
        <div className='eds-pdf__fallback'>
          此浏览器无法内嵌显示 PDF。
          <a href={src} target='_blank' rel='noopener noreferrer'>
            点此在新标签打开
          </a>
        </div>
      </object>
    </div>
  )
}

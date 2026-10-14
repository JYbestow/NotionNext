// import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import TimeFillIcon from 'remixicon-react/TimeFillIcon'
import FolderFillIcon from 'remixicon-react/FolderFillIcon'
import PriceTag3FillIcon from 'remixicon-react/PriceTag3FillIcon'
// import CONFIG from '../config'

/**
 * SideBar Component - Light Industrial Minimalist
 * Right sidebar component - minimalist white style
 * Removed redundant "Operator Info" headers, focused on content.
 */
export const SideBar = (props) => {
  const { tags, categories, latestPosts, locale, showTitle = true } = props

  return (
    <aside className="space-y-8 max-h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'thin' }}>
      {/* Latest Posts (Minimalist List) */}
      {latestPosts && latestPosts.length > 0 && (
        <div className="p-2">
          {showTitle && (
            <h3 className="text-[var(--endspace-text-muted)] font-mono text-xs font-bold mb-6 tracking-widest uppercase flex items-center gap-2">
              {/* 黄色当图标色画在白底上对比度只有约 1.07:1，等于看不见；
                  改成黄底黑图标的小方块，既保留强调色又可读 */}
              <span className="inline-grid place-items-center w-4 h-4 shrink-0 bg-[var(--endspace-accent-yellow)] text-black">
                <TimeFillIcon size={10} />
              </span>
              Recent Logs
            </h3>
          )}
          <div className="space-y-5 border-l border-[var(--endspace-border-base)] pl-4">
            {latestPosts.slice(0, 5).map((post, index) => (
              <SmartLink
                key={post.id}
                href={`/${post.slug}`}
                className="block group"
              >
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[var(--endspace-text-muted)] font-mono group-hover:text-[var(--endspace-text-primary)] transition-colors">
                        {post.publishDay}
                    </span>
                    <h4 className="text-sm font-bold text-[var(--endspace-text-primary)] group-hover:translate-x-1 transition-transform duration-300 leading-snug">
                      {post.title}
                    </h4>
                </div>
              </SmartLink>
            ))}
          </div>
        </div>
      )}

      {/* Categories (Clean List) */}
      {categories && categories.length > 0 && (
        <div className="p-2">
           <h3 className="text-[var(--endspace-text-muted)] font-mono text-xs font-bold mb-6 tracking-widest uppercase flex items-center gap-2">
            <span className="inline-grid place-items-center w-4 h-4 shrink-0 bg-[var(--endspace-accent-yellow)] text-black">
              <FolderFillIcon size={10} />
            </span>
            Data Types
          </h3>
          <div className="flex flex-col gap-2">
            {categories.map((category) => (
              <SmartLink
                key={category.name}
                href={`/category/${category.name}`}
                className="flex items-center justify-between group py-2 border-b border-[var(--endspace-border-base)] hover:border-[var(--endspace-border-active)] transition-all"
              >
                <span className="text-sm text-[var(--endspace-text-secondary)] group-hover:text-[var(--endspace-text-primary)] transition-colors">
                  {category.name}
                </span>
                <span className="text-xs font-mono text-[var(--endspace-text-muted)] bg-[var(--endspace-bg-secondary)] px-2 py-0.5">
                  {category.count}
                </span>
              </SmartLink>
            ))}
          </div>
        </div>
      )}

      {/* Tags Cloud (Clean Pills) */}
      {tags && tags.length > 0 && (
        <div className="p-2">
          <h3 className="text-[var(--endspace-text-muted)] font-mono text-xs font-bold mb-6 tracking-widest uppercase flex items-center gap-2">
            <span className="inline-grid place-items-center w-4 h-4 shrink-0 bg-[var(--endspace-accent-yellow)] text-black">
              <PriceTag3FillIcon size={10} />
            </span>
            Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 25).map((tag) => (
              <SmartLink
                key={tag.name}
                href={`/tag/${encodeURIComponent(tag.name)}`}
                className="px-3 py-1.5 text-xs font-medium bg-[var(--endspace-bg-secondary)] text-[var(--endspace-text-secondary)] hover:bg-[var(--endspace-text-primary)] hover:text-white transition-all"
              >
                {tag.name}
              </SmartLink>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

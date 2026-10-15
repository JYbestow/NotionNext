import { useState, useEffect, useRef, useCallback } from 'react'
import throttle from 'lodash.throttle'
import { uuidToId } from 'notion-utils'
import { IconClock, IconListTree, IconArrowUp, IconX, IconMessage, IconAdjustments } from '@tabler/icons-react'
import { SideBar } from './SideBar'

/**
 * FloatingControls Component
 * Consolidates Recent Logs, TOC, and ScrollToTop into a single capsule widget.
 *
 * 窄屏（< lg）行为调整（第 5 轮）：
 *   原来移动端是一整条 flex-row 胶囊（最多 4 个 40px 圆钮 + 内边距 ≈ 208×56），
 *   固定停在右下角，会持续压住正文文字（390px 下实测遮挡 10696 px²）。
 *   现在改为：默认只露一个 40px 圆钮，点一下才展开整排控件；
 *   并且向下滚动时自动收起（向上滚动或回到顶部立即恢复）。
 *   桌面端（>= lg）保持原样：竖排胶囊常驻，不受影响。
 */
const FloatingControls = ({ toc, ...props }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(null) // 'logs' | 'toc'
  const [percent, setPercent] = useState(0)
  const [activeSection, setActiveSection] = useState(null)

  // -- 窄屏折叠 / 滚动收起 --
  const [compactOpen, setCompactOpen] = useState(false)
  const [peekHidden, setPeekHidden] = useState(false)
  const isDesktopRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(min-width: 1024px)')
    const apply = () => {
      isDesktopRef.current = mq.matches
      if (mq.matches) {
        // 回到桌面宽度时恢复常驻，避免状态残留
        setCompactOpen(false)
        setPeekHidden(false)
      }
    }
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    let lastY = window.scrollY
    const onScroll = throttle(() => {
      if (isDesktopRef.current) return
      const y = window.scrollY
      if (y > 200 && y > lastY + 10) {
        setPeekHidden(true) // 向下阅读时让出视线
      } else if (y < lastY - 10 || y <= 200) {
        setPeekHidden(false) // 向上滚动 / 回到顶部立即恢复
      }
      lastY = y
    }, 150)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 展开时点击抽屉之外任意位置收起（窄屏）
  useEffect(() => {
    if (!compactOpen || typeof document === 'undefined') return
    const onDown = event => {
      const el = event.target
      if (el && el.closest && el.closest('#eds-floating-controls')) return
      setCompactOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [compactOpen])

  
  // -- TOC Logic --
  useEffect(() => {
    window.addEventListener('scroll', updateProgress)
    window.addEventListener('scroll', actionSectionScrollSpy)
    return () => {
        window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('scroll', actionSectionScrollSpy)
    }
  }, [])

  const updateProgress = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const p = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0
    setPercent(p)
  }

  const actionSectionScrollSpy = useCallback(
    throttle(() => {
      const sections = document.getElementsByClassName('notion-h')
      let prevBBox = null
      let currentSectionId = activeSection
      for (let i = 0; i < sections.length; ++i) {
        const section = sections[i]
        if (!section || !(section instanceof Element)) continue
        if (!currentSectionId) {
          currentSectionId = section.getAttribute('data-id')
        }
        const bbox = section.getBoundingClientRect()
        const prevHeight = prevBBox ? bbox.top - prevBBox.bottom : 0
        const offset = Math.max(150, prevHeight / 4)
        if (bbox.top - offset < 0) {
          currentSectionId = section.getAttribute('data-id')
          prevBBox = bbox
          continue
        }
        break
      }
      setActiveSection(currentSectionId)
    }, 200),
    []
  )

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleDrawer = (tab) => {
    if (isOpen && activeTab === tab) {
      setIsOpen(false)
      setActiveTab(null)
    } else {
      setIsOpen(true)
      setActiveTab(tab)
    }
  }

  // Common Button Style (Double Circle)
  const ControlBtn = ({ icon: Icon, onClick, active, label, showPercent, iconClassName = "text-black", iconSize = 20 }) => (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 cursor-pointer group shadow-lg transition-transform active:scale-95"
      aria-label={label}
      title={label}
    >
      <div 
        className={`w-full h-full rounded-full flex items-center justify-center transition-colors duration-200 ${
            active ? 'bg-[#FFFA00]' : 'bg-transparent group-hover:bg-[#FFFA00]'
        }`}
      >
        {showPercent ? (
            <div className="relative w-full h-full flex items-center justify-center">
                <span className={`text-[10px] font-bold font-mono ${active ? 'text-black hidden' : 'text-gray-600 group-hover:hidden'}`}>
                    {Math.round(percent)}%
                </span>
                <Icon size={iconSize} stroke={2} className={`${iconClassName} ${active ? 'block' : 'hidden group-hover:block'}`} />
            </div>
        ) : (
            <Icon size={iconSize} stroke={2} className={iconClassName} />
        )}
      </div>
    </button>
  )

  return (
    <>
      {/* Container: Fixed Bottom Right */
      /* Note: Parent must allow fixed child to escape if needed, but fixed-in-fixed usually works for viewport. */
      /* We use a fragment or simple div to hold the buttons, and put the drawer as a sibling or just rely on fixed positioning. */
      /* Actually, to ensure proper z-indexing, let's keep them siblings. */}
      
      {/* The Drawer (Mobile Sheet / Desktop Popover) */}
      <div
        className={`
            transition-all duration-300 ease-out bg-[#f7f9fe] border-[var(--endspace-border-base)] shadow-2xl overflow-hidden
            
            /* Mobile Styles: Bottom Sheet */
            fixed bottom-0 left-0 right-0 w-full rounded-t-2xl border-t z-40
            ${isOpen ? 'translate-y-0 opacity-100 visible' : 'translate-y-full opacity-0 invisible'}

            /* Desktop Styles: Floating Card (Left of buttons) */
            lg:fixed lg:bottom-8 lg:right-20 lg:left-auto lg:w-80 lg:rounded-xl lg:border lg:h-auto lg:max-h-[70vh]
            lg:max-w-[calc(100vw-2rem)]
            ${isOpen ? 'lg:translate-y-0 lg:opacity-100 lg:visible' : 'lg:translate-y-0 lg:translate-x-4 lg:opacity-0 lg:invisible'}
        `}
        style={{
            /* Mobile Height Limit */
            maxHeight: '70vh', 
        }}
      >
             {/* Header */}
             <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrinking-0">
                <h3 className="font-bold text-sm uppercase flex items-center gap-2 text-black">
                    {activeTab === 'toc' ? (
                        <>
                            <IconListTree size={16} className="text-black" />
                            <span>Table of Contents</span>
                        </>
                    ) : (
                        <>
                             <IconClock size={16} className="text-black" />
                             <span>Recent Logs</span>
                        </>
                    )}
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black">
                    <IconX size={18} />
                </button>
             </div>

             {/* Content Area */}
             <div 
                className="overflow-y-auto p-4 pb-24 lg:pb-4 flex-1" 
                style={{ scrollbarWidth: 'thin' }}
             >
                {activeTab === 'toc' && (
                    <nav className="space-y-1">
                        {toc && toc.map(t => {
                             const id = uuidToId(t.id)
                             const isActive = activeSection === id
                             return (
                                <a
                                  key={id}
                                  href={`#${id}`}
                                  className={`block py-1 text-xs transition-colors rounded px-2 -mx-2 ${isActive ? 'text-black font-bold bg-[#FFFA00]/10' : 'text-gray-500 hover:text-black hover:bg-white'}`}
                                  style={{ paddingLeft: `${(t.indentLevel || 0) * 12 + 8}px` }}
                                  onClick={() => {
                                      // Optional: Close on click for mobile?
                                      // setIsOpen(false) 
                                  }}
                                >
                                    {t.text}
                                </a>
                             )
                        })}
                    </nav>
                )}
                {activeTab === 'logs' && (
                    <SideBar {...props} showTitle={false} />
                )}
             </div>
      </div>

      {/* The Controls (Buttons) */}
      <div
        id='eds-floating-controls'
        className={`fixed right-4 z-50 flex flex-col items-end gap-2 pointer-events-none transition-[transform,opacity] duration-300 ease-out ${
          peekHidden ? 'translate-y-[160%] opacity-0' : 'translate-y-0 opacity-100'
        }`}
        style={{ bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* 窄屏入口：默认只露一个 40px 圆钮，避免整排浮层压住正文 */}
        <button
          type='button'
          onClick={() => setCompactOpen(v => !v)}
          aria-expanded={compactOpen}
          aria-controls='eds-floating-capsule'
          aria-label={compactOpen ? '收起浮动控件' : '展开浮动控件（日志 / 目录 / 评论 / 回到顶部）'}
          title={compactOpen ? '收起' : '日志 / 目录 / 评论 / 回到顶部'}
          className={`lg:hidden w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-[var(--endspace-border-base)] flex items-center justify-center pointer-events-auto transition-transform active:scale-95 ${
            compactOpen ? 'rotate-90' : ''
          }`}
        >
          <IconAdjustments size={20} stroke={2} className='text-black' />
        </button>

        {/* Capsule */}
        <div
          id='eds-floating-capsule'
          className={`${compactOpen ? 'flex' : 'hidden'} lg:flex bg-gray-400/80 backdrop-blur-sm p-1.5 rounded-full shadow-lg flex-row lg:flex-col gap-3 pointer-events-auto`}
        >
             {/* LOGS */}
             <ControlBtn 
                icon={IconClock} 
                label="Recent Logs" 
                active={activeTab === 'logs'}
                onClick={() => toggleDrawer('logs')}
                iconClassName="text-black"
                iconSize={24}
             />

             {/* TOC - Only on Article Pages */}
             {toc && toc.length > 0 && (
                 <ControlBtn 
                    icon={IconListTree} 
                    label="Table of Contents" 
                    active={activeTab === 'toc'}
                    onClick={() => toggleDrawer('toc')}
                    showPercent={true}
                    iconClassName="text-gray-500"
                    iconSize={28}
                 />
             )}

             {/* Comments - Only on Article Pages (approximated by TOC presence) */}
             {toc && toc.length > 0 && (
                 <ControlBtn 
                    icon={IconMessage} 
                    label="Jump to Comments" 
                    onClick={() => {
                        const comments = document.getElementById('comments')
                        if (comments) {
                            comments.scrollIntoView({ behavior: 'smooth' })
                        }
                    }}
                 />
             )}

             {/* Scroll To Top */}
             <ControlBtn 
                icon={IconArrowUp} 
                label="Scroll To Top" 
                onClick={handleScrollToTop}
             />
        </div>
      </div>
    </>
  )
}

export default FloatingControls

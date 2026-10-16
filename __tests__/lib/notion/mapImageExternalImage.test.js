/**
 * @jest-environment node
 */

import {
  compressImage,
  mapImgUrl,
  isKnownDeadImageUrl,
  normalizeDeadImageUrl
} from '@/lib/db/notion/mapImage'
import { siteConfig } from '@/lib/config'
import BLOG from '@/blog.config'

// issue 作者站点上被 Referer 防盗链拒绝的 smzdm 外链图
const hotlinkBlockedUrl =
  'https://am.zdmimg.com/202312/05/656f0a6482fbc4851.png_e1080.jpg'

const imageBlock = id => ({
  type: 'image',
  id,
  properties: { source: [['<SOURCE>']] }
})

const originalImageConfig = {
  NOTION_HOST: BLOG.NOTION_HOST,
  RANDOM_IMAGE_URL: BLOG.RANDOM_IMAGE_URL,
  RANDOM_IMAGE_REPLACE_TEXT: BLOG.RANDOM_IMAGE_REPLACE_TEXT
}

const proxySource = image =>
  decodeURIComponent(new URL(image).pathname.split('/image/')[1])

describe('mapImgUrl 外链图片', () => {
  beforeEach(() => {
    // 关闭随机图替换，聚焦外链转换逻辑
    BLOG.RANDOM_IMAGE_URL = ''
  })

  afterEach(() => {
    Object.assign(BLOG, originalImageConfig)
  })

  it('普通外链 image 块走 Notion /image/ 中转，避免源站 Referer 防盗链', () => {
    const block = imageBlock('block-id-1')
    const ret = mapImgUrl(hotlinkBlockedUrl, block, 'block', false)

    expect(ret).toContain(`${BLOG.NOTION_HOST}/image/`)
    expect(ret).toContain(encodeURIComponent(hotlinkBlockedUrl))
    expect(ret).toContain('table=block')
    expect(ret).toContain('id=block-id-1')
    // 原始外链不应直接出现（直出会被源站防盗链拒绝）
    expect(ret).not.toContain(hotlinkBlockedUrl)
  })

  it('page 类型封面的外链图同样走中转', () => {
    const block = {
      type: 'page',
      id: 'page-id-1',
      format: { page_cover: hotlinkBlockedUrl }
    }
    const ret = mapImgUrl(hotlinkBlockedUrl, block, 'collection', false)

    expect(ret).toContain(`${BLOG.NOTION_HOST}/image/`)
  })

  it('Notion 自有资源保持原有转换行为', () => {
    const block = imageBlock('block-id-2')
    const secureUrl = 'https://secure.notion-static.com/abc123/photo.png'
    const ret = mapImgUrl(secureUrl, block, 'block', false)

    expect(ret).toContain(`${BLOG.NOTION_HOST}/image/`)
  })

  it('attachment: 标识保持原有转换行为', () => {
    const block = imageBlock('block-id-3')
    const ret = mapImgUrl(
      'attachment:block-id-3:photo.png',
      block,
      'block',
      false
    )

    expect(ret).toContain(`${BLOG.NOTION_HOST}/image/`)
  })

  it('已转换的反代链接不被二次包装', () => {
    const block = imageBlock('block-id-4')
    const alreadyProxied = `${BLOG.NOTION_HOST}/image/${encodeURIComponent(
      hotlinkBlockedUrl
    )}?table=block&id=block-id-4`
    const ret = mapImgUrl(alreadyProxied, block, 'block', false)

    // 不应出现两层 /image/
    const occurrences = ret.split('/image/').length - 1
    expect(occurrences).toBe(1)
  })

  it('中转链接仍带去重参数 t=<blockId>', () => {
    const block = imageBlock('block-id-5')
    const ret = mapImgUrl(hotlinkBlockedUrl, block, 'block', false)

    expect(ret).toContain('t=block-id-5')
  })

  describe('外链压缩参数（回归：代理前需先做源站压缩）', () => {
    const unsplashUrl = 'https://images.unsplash.com/photo-1234567890'

    it('Unsplash 外链 + block_width 走中转后仍保留 width/q/fmt 参数', () => {
      const block = {
        type: 'image',
        id: 'unsplash-1',
        format: { block_width: 800 }
      }
      const ret = mapImgUrl(unsplashUrl, block, 'block', true)

      // 仍走防盗链中转
      expect(ret).toContain(`${BLOG.NOTION_HOST}/image/`)
      // 被编码进代理地址的源 URL 必须带上压缩参数，否则图片不再被压缩
      const encoded = ret.split('/image/')[1].split('?')[0]
      const source = decodeURIComponent(encoded)
      expect(source).toContain('width=800')
      expect(source).toContain('q=50')
      expect(source).toContain('fmt=webp')
      expect(source).toContain('fm=webp')
    })

    it('没有 block_width 时使用配置的默认压缩宽度', () => {
      const block = { type: 'image', id: 'unsplash-2' }
      const ret = mapImgUrl(unsplashUrl, block, 'block', true)

      const source = decodeURIComponent(ret.split('/image/')[1].split('?')[0])
      expect(source).toContain(`width=${siteConfig('IMAGE_COMPRESS_WIDTH')}`)
    })

    it('非 Unsplash 外链的中转行为不受影响', () => {
      const block = {
        type: 'image',
        id: 'smzdm-1',
        format: { block_width: 800 }
      }
      const ret = mapImgUrl(hotlinkBlockedUrl, block, 'block', true)

      expect(ret).toContain(`${BLOG.NOTION_HOST}/image/`)
      // 非 Unsplash 源站没有已知的压缩参数约定，源 URL 应保持原样
      const source = decodeURIComponent(ret.split('/image/')[1].split('?')[0])
      expect(source).toBe(hotlinkBlockedUrl)
    })

    it('needCompress=false 时不追加压缩参数', () => {
      const block = {
        type: 'image',
        id: 'unsplash-3',
        format: { block_width: 800 }
      }
      const ret = mapImgUrl(unsplashUrl, block, 'block', false)

      const source = decodeURIComponent(ret.split('/image/')[1].split('?')[0])
      expect(source).not.toContain('width=800')
    })
  })

  describe('Heo 图片放大后的高清参数', () => {
    it.each([
      'https://www.notion.so',
      'https://notion.example',
      'https://notion.example/proxy'
    ])('通过 %s 代理的 Unsplash 图片仍可放大到高清尺寸', host => {
      BLOG.NOTION_HOST = host
      const block = {
        ...imageBlock('zoom-image'),
        format: { block_width: 400 }
      }
      const thumbnail = mapImgUrl(
        'https://images.unsplash.com/photo-example?crop=faces',
        block
      )
      const zoomed = compressImage(thumbnail, 1920, 80, 'avif')
      const source = new URL(proxySource(zoomed))

      expect(new URL(proxySource(thumbnail)).searchParams.get('width')).toBe(
        '400'
      )
      expect(source.searchParams.get('width')).toBe('1920')
      expect(source.searchParams.get('q')).toBe('80')
      expect(source.searchParams.get('fmt')).toBe('avif')
      expect(source.searchParams.get('fm')).toBe('avif')
      expect(source.searchParams.get('crop')).toBe('faces')
      expect(zoomed.startsWith(`${host}/image/`)).toBe(true)
      expect(new URL(zoomed).search).toBe(new URL(thumbnail).search)
      expect(zoomed.split('/image/')).toHaveLength(2)
      expect(compressImage(zoomed, 1920, 80, 'avif')).toBe(zoomed)
    })

    it('更换代理域名后，旧 Notion 代理地址仍能更新源图并保留外层参数', () => {
      BLOG.NOTION_HOST = 'https://notion.example'
      const source = 'https://images.unsplash.com/photo-example?width=400'
      const image = `https://www.notion.so/image/${encodeURIComponent(source)}?table=block&id=zoom-image&t=zoom-image&cache=v2#preview`
      const zoomed = compressImage(image, 1920)

      expect(new URL(proxySource(zoomed)).searchParams.get('width')).toBe(
        '1920'
      )
      expect(new URL(zoomed).origin).toBe('https://www.notion.so')
      expect(new URL(zoomed).search).toBe(new URL(image).search)
      expect(new URL(zoomed).hash).toBe('#preview')
    })

    it('首次映射关闭压缩时，后续放大仍可指定 Unsplash 高清尺寸', () => {
      const image = mapImgUrl(
        'https://images.unsplash.com/photo-example',
        imageBlock('uncompressed-image'),
        'block',
        false
      )

      expect(new URL(proxySource(image)).searchParams.has('width')).toBe(false)
      expect(
        new URL(proxySource(compressImage(image, 1920))).searchParams.get(
          'width'
        )
      ).toBe('1920')
    })

    it('保留 Notion AWS 图片原有的代理宽度参数', () => {
      const source =
        'https://s3.us-west-2.amazonaws.com/secure.notion-static.com/id/photo.jpg'
      const image = mapImgUrl(source, imageBlock('aws-image'))
      const zoomed = compressImage(image, 1920)

      expect(new URL(zoomed).searchParams.get('width')).toBe('1920')
      expect(new URL(zoomed).searchParams.get('cache')).toBe('v2')
      expect(proxySource(zoomed)).toBe(source)
    })

    it.each([
      encodeURIComponent(hotlinkBlockedUrl),
      'https%3A%2F%2Fimages.unsplash.com%2Fbad%ZZ'
    ])('未知图床或无效编码保持原样：%s', encodedSource => {
      const image = `${BLOG.NOTION_HOST}/image/${encodedSource}?table=block&id=other-image`

      expect(compressImage(image, 1920)).toBe(image)
    })
  })

  describe('随机图片替换规则', () => {
    const original = 'https://old.example/covers/photo.jpg'
    const replacement = 'https://replacement.example/random?category=cover'

    it.each([
      'https://old.example/covers/',
      '/covers/',
      'old.example',
      'unmatched.example,https://old.example/covers/'
    ])('原图匹配 %s 时仍替换为随机图片', match => {
      BLOG.RANDOM_IMAGE_URL = replacement
      BLOG.RANDOM_IMAGE_REPLACE_TEXT = match

      expect(mapImgUrl(original, imageBlock('random-image'))).toBe(
        `${replacement}&t=random-image`
      )
    })

    it('仍支持匹配生成后的 Notion 代理地址', () => {
      BLOG.RANDOM_IMAGE_URL = replacement
      BLOG.RANDOM_IMAGE_REPLACE_TEXT = `${BLOG.NOTION_HOST}/image/`

      expect(mapImgUrl(original, imageBlock('random-image'))).toBe(
        `${replacement}&t=random-image`
      )
    })

    it('不匹配替换规则的外链仍正常走代理', () => {
      BLOG.RANDOM_IMAGE_URL = replacement
      BLOG.RANDOM_IMAGE_REPLACE_TEXT = 'https://another.example/covers/'

      const image = mapImgUrl(original, imageBlock('original-image'))
      expect(image.startsWith(`${BLOG.NOTION_HOST}/image/`)).toBe(true)
      expect(proxySource(image)).toBe(original)
    })

    it.each(['https://www.notion.so/images/page-cover/solid_blue.png', '🌄'])(
      '全部替换模式保留 Notion 内置封面或 emoji：%s',
      image => {
        BLOG.RANDOM_IMAGE_URL = replacement
        BLOG.RANDOM_IMAGE_REPLACE_TEXT = ''

        expect(mapImgUrl(image, imageBlock('builtin-image'))).toBe(image)
      }
    )
  })
})

describe('失效随机图源（source.unsplash.com）的确定性规范化', () => {
  // 与 mapImage 内部默认回退保持一致：项目自带中性底板
  const fallback = BLOG.HOME_BANNER_IMAGE || '/bg_image.jpg'

  it('直链随机图（含查询参数）回退到项目中性底板', () => {
    expect(
      normalizeDeadImageUrl(
        'https://source.unsplash.com/random/720x480/?encryption'
      )
    ).toBe(fallback)
  })

  it.each([
    'https://source.unsplash.com/random',
    'https://source.unsplash.com/random/1600x900/?nature,water',
    'https://source.unsplash.com/featured/?code&sig=1#frag',
    'http://source.unsplash.com/random/'
  ])('不同查询参数 / 形态同样回退：%s', url => {
    expect(isKnownDeadImageUrl(url)).toBe(true)
    expect(normalizeDeadImageUrl(url)).toBe(fallback)
  })

  it('Notion 图床代理形态（原地址被编码进 path）也回退', () => {
    const proxied = `${BLOG.NOTION_HOST}/image/${encodeURIComponent(
      'https://source.unsplash.com/random/720x480/?encryption'
    )}?table=block&id=abc&t=abc`

    expect(isKnownDeadImageUrl(proxied)).toBe(true)
    expect(normalizeDeadImageUrl(proxied)).toBe(fallback)
  })

  it('Notion CDN ext 代理形态也回退', () => {
    const cdn =
      'https://img.notionusercontent.com/ext/https://source.unsplash.com/random/720x480/?encryption/size/?mtd=so'

    expect(isKnownDeadImageUrl(cdn)).toBe(true)
    expect(normalizeDeadImageUrl(cdn)).toBe(fallback)
  })

  it('正常 Unsplash 图床 images.unsplash.com 绝不被误处理', () => {
    const ok =
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200'

    expect(isKnownDeadImageUrl(ok)).toBe(false)
    expect(normalizeDeadImageUrl(ok)).toBe(ok)
  })

  it('该域名只出现在 query 里时不算失效图源', () => {
    const ok =
      'https://images.unsplash.com/photo-1?ref=https://source.unsplash.com/random'

    expect(isKnownDeadImageUrl(ok)).toBe(false)
    expect(normalizeDeadImageUrl(ok)).toBe(ok)
  })

  it('相对路径与站点内路径原样保留', () => {
    ;['/bg_image.jpg', '/images/cover.png', 'images/cover.png'].forEach(p => {
      expect(isKnownDeadImageUrl(p)).toBe(false)
      expect(normalizeDeadImageUrl(p)).toBe(p)
    })
  })

  it('空值不做任何补图', () => {
    expect(normalizeDeadImageUrl('')).toBe('')
    expect(normalizeDeadImageUrl(null)).toBe('')
    expect(normalizeDeadImageUrl(undefined)).toBe('')
    expect(isKnownDeadImageUrl('')).toBe(false)
    expect(isKnownDeadImageUrl(null)).toBe(false)
    expect(isKnownDeadImageUrl(undefined)).toBe(false)
  })

  it('mapImgUrl 对失效直链直接给底板，不再生成代理请求', () => {
    const ret = mapImgUrl(
      'https://source.unsplash.com/random/720x480/?encryption',
      imageBlock('dead-cover'),
      'block',
      false
    )

    expect(ret).toBe(fallback)
    expect(ret).not.toContain('/image/')
  })

  it('mapImgUrl 对已落盘的旧代理地址同样回退（旧缓存场景）', () => {
    const proxied = `${BLOG.NOTION_HOST}/image/${encodeURIComponent(
      'https://source.unsplash.com/random/720x480/?encryption'
    )}?table=block&id=dead-cover`

    expect(mapImgUrl(proxied, imageBlock('dead-cover'), 'block', false)).toBe(
      fallback
    )
  })
})

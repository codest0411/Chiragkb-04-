import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

function lerp(a, b, n) {
  return (1 - n) * a + n * b
}

function getLocalPointerPos(e, rect) {
  let clientX = 0
  let clientY = 0
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  } else {
    clientX = e.clientX
    clientY = e.clientY
  }
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  }
}

function getMouseDistance(p1, p2) {
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y
  return Math.hypot(dx, dy)
}

class ImageItem {
  DOM = { el: null, inner: null }
  defaultStyle = { scale: 1, x: 0, y: 0, opacity: 0 }
  rect = null

  constructor(DOM_el) {
    this.DOM.el = DOM_el
    this.DOM.inner = this.DOM.el.querySelector('.content__img-inner')
    this.getRect()
    this.initEvents()
  }

  initEvents() {
    this.resize = () => {
      gsap.set(this.DOM.el, this.defaultStyle)
      this.getRect()
    }
    window.addEventListener('resize', this.resize)
  }

  getRect() {
    this.rect = this.DOM.el.getBoundingClientRect()
  }
}

class ImageTrailVariant1 {
  constructor(container) {
    this.container = container
    this.DOM = { el: container }
    this.images = [...this.DOM.el.querySelectorAll('.content__img')].map(
      (img) => new ImageItem(img)
    )
    this.imagesTotal = this.images.length
    this.imgPosition = 0
    this.zIndexVal = 1
    this.activeImagesCount = 0
    this.isIdle = true
    this.threshold = 80

    this.mousePos = { x: 0, y: 0 }
    this.lastMousePos = { x: 0, y: 0 }
    this.cacheMousePos = { x: 0, y: 0 }

    const handlePointerMove = (ev) => {
      const rect = this.container.getBoundingClientRect()
      this.mousePos = getLocalPointerPos(ev, rect)
    }
    container.addEventListener('mousemove', handlePointerMove)
    container.addEventListener('touchmove', handlePointerMove)

    const initRender = (ev) => {
      const rect = this.container.getBoundingClientRect()
      this.mousePos = getLocalPointerPos(ev, rect)
      this.cacheMousePos = { ...this.mousePos }

      requestAnimationFrame(() => this.render())

      container.removeEventListener('mousemove', initRender)
      container.removeEventListener('touchmove', initRender)
    }
    container.addEventListener('mousemove', initRender)
    container.addEventListener('touchmove', initRender)
  }

  render() {
    const distance = getMouseDistance(this.mousePos, this.lastMousePos)
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1)
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1)

    if (distance > this.threshold) {
      this.showNextImage()
      this.lastMousePos = { ...this.mousePos }
    }
    if (this.isIdle && this.zIndexVal !== 1) {
      this.zIndexVal = 1
    }
    requestAnimationFrame(() => this.render())
  }

  showNextImage() {
    ++this.zIndexVal
    this.imgPosition =
      this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0
    const img = this.images[this.imgPosition]

    gsap.killTweensOf(img.DOM.el)
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated(),
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
        },
        {
          duration: 0.4,
          ease: 'power1',
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'power3',
          opacity: 0,
          scale: 0.2,
        },
        0.4
      )
  }

  onImageActivated() {
    this.activeImagesCount++
    this.isIdle = false
  }

  onImageDeactivated() {
    this.activeImagesCount--
    if (this.activeImagesCount === 0) {
      this.isIdle = true
    }
  }
}

// Map of supported variants (for now only 1 is wired, but full map kept for compatibility)
const variantMap = {
  1: ImageTrailVariant1,
}

export default function ImageTrail({ items = [], variant = 1 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const Cls = variantMap[variant] || variantMap[1]
    const instance = new Cls(containerRef.current)

    return () => {
      // Basic cleanup: reset styles on unmount
      if (containerRef.current) {
        const imgs = containerRef.current.querySelectorAll('.content__img')
        imgs.forEach((el) => {
          gsap.killTweensOf(el)
        })
      }
      if (instance && instance.DOM && instance.DOM.el) {
        instance.DOM.el = null
      }
    }
  }, [variant, items])

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative z-[10] rounded-lg bg-transparent overflow-visible"
    >
      {items.map((url, i) => (
        <div
          className="content__img w-[190px] aspect-[1.1] rounded-[15px] absolute top-0 left-0 opacity-0 overflow-hidden [will-change:transform,filter]"
          key={i}
        >
          <div
            className="content__img-inner bg-center bg-cover w-[calc(100%+20px)] h-[calc(100%+20px)] absolute top-[-10px] left-[-10px]"
            style={{ backgroundImage: `url(${url})` }}
          />
        </div>
      ))}
    </div>
  )
}

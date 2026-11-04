import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronRight, Hexagon, ShieldCheck } from 'lucide-react'

const VIDEO_SRC = '/screen_guard.mp4'

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.15 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return { ref, visible }
}

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`will-change-transform transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}>{children}</div>
}

function ScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [cacheReady, setCacheReady] = useState(false)
  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!video || !canvas || !context) return
    let frames: ImageBitmap[] = [], target = 0, smooth = 0, raf = 0, extracting = false
    const resize = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr; canvas.style.width = `${window.innerWidth}px`; canvas.style.height = `${window.innerHeight}px` }
    const draw = (source: CanvasImageSource, width: number, height: number) => { const scale = Math.max(canvas.width / width, canvas.height / height); const drawWidth = width * scale; const drawHeight = height * scale; context.clearRect(0, 0, canvas.width, canvas.height); context.drawImage(source, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight) }
    const onScroll = () => { const max = document.documentElement.scrollHeight - window.innerHeight; target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0 }
    const extract = async () => {
      if (extracting || !video.duration || !('createImageBitmap' in window)) return
      extracting = true
      const count = Math.min(90, Math.max(24, Math.floor(video.duration * 12)))
      const offscreen = document.createElement('video'); offscreen.src = VIDEO_SRC; offscreen.muted = true; offscreen.preload = 'auto'
      await new Promise<void>((resolve) => { offscreen.onloadedmetadata = () => resolve(); offscreen.onerror = () => resolve() })
      for (let i = 0; i < count && offscreen.duration; i++) {
        offscreen.currentTime = (offscreen.duration - 0.05) * i / (count - 1)
        await new Promise<void>((resolve) => { offscreen.onseeked = () => resolve(); setTimeout(resolve, 300) })
        try { frames.push(await createImageBitmap(offscreen, { resizeWidth: 960, resizeHeight: Math.round(960 * offscreen.videoHeight / offscreen.videoWidth) })) } catch { break }
      }
      if (frames.length) setCacheReady(true)
    }
    const animate = () => {
      smooth += (target - smooth) * 0.12
      if (frames.length) draw(frames[Math.min(frames.length - 1, Math.round(smooth * (frames.length - 1)))], frames[0].width, frames[0].height)
      else if (video.readyState >= 2) { const time = smooth * Math.max(0, video.duration - 0.05); if (Math.abs(video.currentTime - time) > 0.04) video.currentTime = time; draw(video, video.videoWidth, video.videoHeight) }
      raf = requestAnimationFrame(animate)
    }
    const onLoaded = () => { setReady(true); setTimeout(extract, 300) }
    resize(); onScroll(); video.addEventListener('loadeddata', onLoaded); window.addEventListener('resize', resize); window.addEventListener('scroll', onScroll, { passive: true }); raf = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(raf); video.removeEventListener('loadeddata', onLoaded); window.removeEventListener('resize', resize); window.removeEventListener('scroll', onScroll); frames.forEach(frame => frame.close()) }
  }, [])
  return <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0a0a0a]"><div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,rgba(75,105,117,.35),transparent_52%),linear-gradient(140deg,#111b20,#090a0b)]" /><video ref={videoRef} src={VIDEO_SRC} muted playsInline preload="auto" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${ready && cacheReady ? 'opacity-0' : ready ? 'opacity-100' : 'opacity-0'}`} /><canvas ref={canvasRef} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`} /></div>
}

const services = ['/ AI SECURITY OPERATIONS', '/ THREAT INTELLIGENCE', '/ INCIDENT RESPONSE']
const capabilities = [['01', 'Real-time protection', 'Sees the signal as it happens and surfaces what matters before a threat becomes an incident.'], ['02', 'Layered intelligence', 'Moves from raw telemetry to a clear, actionable picture without losing the thread.'], ['03', 'Adaptive readiness', 'Learns your environment and tightens every response as your team works.']]

function Navbar() {
  return <nav className="fixed top-0 z-50 w-full border-b border-white/15 bg-black/10 backdrop-blur-md"><div className="flex items-center justify-between px-5 py-4 sm:px-8 md:px-12"><Reveal><a href="#" className="flex items-center gap-2 text-lg font-medium tracking-tight sm:text-xl"><Hexagon size={24} strokeWidth={1.5} />guardxel</a></Reveal><div className="hidden items-center gap-8 md:flex lg:gap-10">{['Systems', 'About', 'Insights', 'Contact'].map((link, i) => <Reveal key={link} delay={100 + i * 100}><a href={`#${link.toLowerCase()}`} className="text-sm text-white/85 transition-colors duration-300 hover:text-white">{link}{link === 'Systems' && <sup className="ml-1 font-mono text-[10px] text-white/60">3</sup>}</a></Reveal>)}</div><Reveal delay={500}><a href="#contact" className="rounded-md border border-white/20 bg-white/15 px-4 py-2 text-xs backdrop-blur-md transition-colors duration-300 hover:bg-white/25 sm:px-5 sm:text-sm">Request a briefing</a></Reveal></div></nav>
}

function App() {
  return <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white"><ScrollVideo /><div className="relative z-10"><Navbar /><main>
    <section className="flex min-h-screen flex-col justify-between px-5 pb-12 pt-24 sm:px-8 sm:pt-28 md:px-12 md:pb-16"><div className="flex flex-col justify-between gap-8 sm:flex-row"><div className="flex flex-col gap-2">{services.map((service, i) => <Reveal key={service} delay={150 + i * 120}><p className="font-mono text-xs uppercase tracking-[0.15em] text-white/90 drop-shadow-md">{service}</p></Reveal>)}</div><Reveal delay={300} className="max-w-xs sm:text-right"><p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">GuardXel turns complex security signals into calm, decisive action for the teams protecting what matters.</p></Reveal></div><div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"><div><Reveal delay={150}><div className="mb-5 inline-block border-l-2 border-white bg-white/15 px-3 py-1.5 backdrop-blur-md"><span className="font-mono text-[11px] uppercase tracking-[0.15em]">Security without blind spots</span></div></Reveal><Reveal delay={280}><h1 className="text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">See clearly.<br />Respond faster.</h1></Reveal></div><Reveal delay={420}><div className="flex max-w-sm items-center gap-4 rounded-xl bg-white/15 p-3 backdrop-blur-md"><div className="flex h-24 w-20 items-center justify-center rounded-lg border border-white/20 bg-black/20"><ShieldCheck size={34} strokeWidth={1.2} className="text-white/80" /></div><div className="flex flex-col gap-1.5 pr-2"><p className="text-sm font-medium">Talk with GuardXel</p><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60">Security intelligence, simplified</p><a href="#contact" className="mt-1.5 flex items-center gap-1 self-start rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85">Book a briefing <ChevronRight size={14} /></a></div></div></Reveal></div></section>
    <div aria-hidden="true" className="h-[80vh]" />
    <section className="flex min-h-screen flex-col justify-between px-5 pb-12 pt-24 sm:px-8 sm:pt-28 md:px-12 md:pb-16"><div className="flex flex-col justify-between gap-8 sm:flex-row"><Reveal delay={120}><div className="inline-block border-l-2 border-white bg-white/15 px-3 py-1.5 backdrop-blur-md"><span className="font-mono text-[11px] uppercase tracking-[0.15em]">Intelligence on demand</span></div></Reveal><Reveal delay={220} className="max-w-sm sm:text-right"><p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">Your security stack should not create more noise. It should sharpen the signal and give your team room to act.</p></Reveal></div><div className="flex flex-1 flex-col justify-end gap-12 md:flex-row md:items-end md:justify-between md:gap-16"><div className="max-w-xl"><Reveal delay={180}><h2 className="text-5xl font-normal leading-[1.05] tracking-tight drop-shadow-lg sm:text-6xl lg:text-7xl">Protect with<br />precision.</h2></Reveal><Reveal delay={320}><p className="mt-6 max-w-md text-sm leading-relaxed text-white/80 drop-shadow-md sm:text-base">From the first alert to the final resolution, GuardXel turns fragmented events into decisions your team can trust — quietly, precisely, at speed.</p></Reveal><Reveal delay={420}><div className="mt-8 flex flex-wrap gap-3"><a href="#demo" className="flex items-center gap-1 rounded-full bg-white px-5 py-2.5 text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85 sm:text-sm">Run the demo <ChevronRight size={14} /></a><a href="#contact" className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs backdrop-blur-md transition-colors duration-300 hover:bg-white/20 sm:text-sm">Free consultation</a></div></Reveal></div><div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 px-5 backdrop-blur-md sm:px-6">{capabilities.map(([index, title, body], i) => <Reveal key={index} delay={300 + i * 110} className={i < capabilities.length - 1 ? 'border-b border-white/15' : ''}><div className="flex gap-5 py-5"><span className="font-mono text-[11px] tracking-[0.15em] text-white/55">{index}</span><div><h3 className="flex items-center gap-2 text-base font-medium text-white sm:text-lg">{title}<ChevronRight size={16} className="text-white/40" /></h3><p className="mt-1.5 text-sm leading-relaxed text-white/70">{body}</p></div></div></Reveal>)}</div></div></section>
  </main></div></div>
}

export default App

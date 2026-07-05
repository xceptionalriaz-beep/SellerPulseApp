// components/admin/RichEditor.tsx
'use client'
import React, { useRef, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link, Image, Undo, Redo,
  Highlighter, Superscript, Subscript, Minus, X, Clipboard,
  Table, Video, Download, ChevronsRight, ChevronsLeft,
  Scissors, FileText, SpellCheck, CheckCircle, HelpCircle,
  Lightbulb, AlertTriangle, ListChecks, Zap, ChevronDown,
  Sparkles, BarChart2, ShoppingBag, Columns, Trash2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

const C = {
  lime:'#8fff00', limeDeep:'#4a8f00', limeTint:'#f4ffe6',
  dark:'#1a2410', border:'#e8ede2', muted:'#8a9e78',
  surface:'#fafcf7', bg:'#f7f9f5', text:'#1a2410',
  green:'#16a34a', amber:'#d97706', red:'#dc2626', blue:'#2563eb',
}

function ToolBtn({ icon: Icon, title, onClick, active=false, color }: {
  icon:any; title:string; onClick:()=>void; active?:boolean; color?:string
}) {
  return (
    <button onMouseDown={e=>{e.preventDefault();onClick()}} title={title}
      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5 transition-all"
      style={{color:color||(active?C.limeDeep:C.muted),backgroundColor:active?C.limeTint:'transparent'}}>
      <Icon size={13}/>
    </button>
  )
}

function TDiv() {
  return <div className="w-px h-5 mx-1 shrink-0" style={{backgroundColor:C.border}}/>
}

function parseAdvancedBlocks(html: string): string {
  return html
    .replace(/:::faq([\s\S]*?):::/g, (_:string,body:string)=>{
      const pairs=body.trim().split(/\n(?=Q:)/)
      const items=pairs.map((p:string)=>{
        const lines=p.split('\n').map((l:string)=>l.trim()).filter(Boolean)
        const q=lines.find((l:string)=>l.startsWith('Q:'))?.replace('Q:','').trim()||''
        const a=lines.find((l:string)=>l.startsWith('A:'))?.replace('A:','').trim()||''
        return `<details style="margin:8px 0;border:1px solid ${C.border};border-radius:10px;overflow:hidden"><summary style="padding:12px 16px;font-weight:700;cursor:pointer;background:${C.bg};font-size:14px">${q}</summary><div style="padding:12px 16px;font-size:13px;line-height:1.7;color:#374151">${a}</div></details>`
      })
      return `<div style="margin:16px 0"><div style="font-size:10px;font-weight:900;letter-spacing:0.1em;color:${C.muted};margin-bottom:8px">FAQ</div>${items.join('')}</div>`
    })
    .replace(/:::info([\s\S]*?):::/g,(_:string,body:string)=>
      `<div style="display:flex;gap:12px;align-items:flex-start;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px 16px;margin:14px 0"><div style="width:22px;height:22px;border-radius:6px;background:#1d4ed8;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:900">i</div><div style="font-size:13px;color:#1e40af;line-height:1.6">${body.trim()}</div></div>`
    )
    .replace(/:::warning([\s\S]*?):::/g,(_:string,body:string)=>
      `<div style="display:flex;gap:12px;align-items:flex-start;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 16px;margin:14px 0"><div style="width:22px;height:22px;border-radius:6px;background:#d97706;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:900">!</div><div style="font-size:13px;color:#92400e;line-height:1.6">${body.trim()}</div></div>`
    )
    .replace(/\[CTA:(free|starter|growth)\]/g,(_:string,tier:string)=>{
      const plans:Record<string,{label:string;desc:string}>={
        free:{label:'Start Free',desc:'No credit card required'},
        starter:{label:'Get Starter Plan',desc:'Perfect for growing sellers'},
        growth:{label:'Get Growth Plan',desc:'For serious eBay businesses'},
      }
      const p=plans[tier]
      return `<div style="display:flex;align-items:center;justify-content:space-between;background:#1a2410;border-radius:14px;padding:18px 22px;margin:16px 0;gap:16px"><div><strong style="color:#8fff00;font-size:15px;font-weight:800;display:block">${p.label}</strong><span style="color:rgba(255,255,255,0.6);font-size:12px">${p.desc}</span></div><a href="/pricing" style="background:#8fff00;color:#1a2410;font-weight:800;font-size:13px;padding:10px 20px;border-radius:10px;text-decoration:none;white-space:nowrap">Get Started</a></div>`
    })
}

function generateToC(html: string): string {
  const matches=[...html.matchAll(/<h([23])[^>]*>(.*?)<\/h[23]>/gi)]
  if(matches.length<2)return''
  const items=matches.map((m,i)=>{
    const level=m[1];const text=m[2].replace(/<[^>]+>/g,'')
    return `<li style="margin:4px 0;padding-left:${level==='3'?'16px':'0'}"><a href="#toc-${i}" style="color:#4a8f00;text-decoration:none;font-size:13px">${text}</a></li>`
  }).join('')
  return `<div style="background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:12px;padding:16px 20px;margin-bottom:20px"><strong style="color:#4a8f00;font-size:13px;display:block;margin-bottom:8px">Table of Contents</strong><ol style="list-style:decimal;padding-left:20px;margin:0">${items}</ol></div>`
}

interface RichEditorProps {
  value?: string
  onChange?: (html: string) => void
  onStats?: (stats:{wordCount:number;charCount:number;readingTime:number;bodyText:string;bodyHtml:string;missingAltCount:number}) => void
  enableToC?: boolean
  minHeight?: number
  focusMode?: boolean
  placeholder?: string
  className?: string
  editorRef?: React.RefObject<HTMLDivElement>
}

export default function RichEditor({
  value='',onChange,onStats,enableToC=false,minHeight=480,
  focusMode=false,placeholder='Start writing your post here...',
  className='',editorRef:externalRef,
}: RichEditorProps): JSX.Element {
  const supabase=createClient()
  const internalRef=useRef<HTMLDivElement>(null)
  const editorRef=(externalRef??internalRef) as React.RefObject<HTMLDivElement>
  const toolbarRef=useRef<HTMLDivElement>(null)
  const toolbarRef2=useRef<HTMLDivElement>(null)
  const dragOffset=useRef({x:0,y:0})
  const isDragging=useRef(false)

  // Toolbar state
  const [showColorPick,setShowColorPick]=useState(false)
  const [showFontSize,setShowFontSize]=useState(false)
  const [showLinkInput,setShowLinkInput]=useState(false)
  const [showStyleDrop,setShowStyleDrop]=useState(false)
  const [currentStyle,setCurrentStyle]=useState('Normal')
  const [showFontDrop,setShowFontDrop]=useState(false)
  const [currentFont,setCurrentFont]=useState('Inter')
  const [linkUrl,setLinkUrl]=useState('')
  const [tableRows,setTableRows]=useState(3)
  const [tableCols,setTableCols]=useState(3)
  const [showTableInput,setShowTableInput]=useState(false)
  const [showEmbedInput,setShowEmbedInput]=useState(false)
  const [embedUrl,setEmbedUrl]=useState('')
  const [spellCheckOn,setSpellCheckOn]=useState(false)
  const [showWordGoal,setShowWordGoal]=useState(false)
  const [wordGoal,setWordGoal]=useState(2000)
  const [wordCount,setWordCount]=useState(0)
  const [charCount,setCharCount]=useState(0)
  const [uploading,setUploading]=useState(false)
  // Image picker
  const [showImgPicker,setShowImgPicker]=useState(false)
  const [imgPickerUrl,setImgPickerUrl]=useState('')
  const [imgPickerTarget,setImgPickerTarget]=useState<HTMLElement|null>(null)
  // Image toolbar
  const [selectedImg,setSelectedImg]=useState<HTMLImageElement|null>(null)
  const [imgToolbarPos,setImgToolbarPos]=useState({top:0,left:0})
  const [showImgToolbar,setShowImgToolbar]=useState(false)
  const [showCornerHandle,setShowCornerHandle]=useState(false)
  const [cornerHandlePos,setCornerHandlePos]=useState({top:0,left:0})
  const [cornerRadius,setCornerRadius]=useState(0)
  const isDraggingCorner=useRef(false)
  const cornerDragStart=useRef({x:0,radius:0})
  const cornerRafRef=useRef<number|null>(null)
  // Annotation state
  const [annoRect,setAnnoRect]=useState({top:0,left:0,width:0,height:0})
  const [showAnnotator,setShowAnnotator]=useState(false)
  const [annoTool,setAnnoTool]=useState<'select'|'arrow'|'circle'|'rect'|'text'|'pen'|'line'|'blur'>('arrow')
  const [annoColor,setAnnoColor]=useState('#8fff00')
  const [annoSize,setAnnoSize]=useState(3)
  const [annoImg,setAnnoImg]=useState<HTMLImageElement|null>(null)
  const annoCanvasRef=useRef<HTMLCanvasElement>(null)
  const annoDrawing=useRef(false)
  const annoStart=useRef({x:0,y:0})
  const annoPenPath=useRef<{x:number,y:number}[]>([])
  const annoSnapshot=useRef<ImageData|null>(null)
  const [annoTextVal,setAnnoTextVal]=useState('')
  const [annoTextPos,setAnnoTextPos]=useState<{x:number,y:number}|null>(null)
  const [annoTextSize,setAnnoTextSize]=useState<'S'|'M'|'L'|'XL'>('M')
  const [annoTextBold,setAnnoTextBold]=useState(false)
  const [annoTextItalic,setAnnoTextItalic]=useState(false)
  const [annoTextBg,setAnnoTextBg]=useState<'none'|'dark'|'light'>('none')
  // History stack for undo/redo
  const annoHistory=useRef<ImageData[]>([])
  const annoHistoryIdx=useRef(-1)
  // Selected object for move
  const [annoSelectedObj,setAnnoSelectedObj]=useState<number>(-1)
  const annoObjects=useRef<any[]>([])
  const annoMoving=useRef(false)
  const annoMoveStart=useRef({x:0,y:0,objX:0,objY:0})

  // Load image when annotator opens
  useEffect(()=>{if(showAnnotator&&annoImg)annoLoadImage()},[showAnnotator,annoImg])

  // Continuously track image position so handle follows on scroll/resize
  useEffect(()=>{
    if(!showCornerHandle||!selectedImg)return
    function track(){
      if(!selectedImg)return
      const rect=selectedImg.getBoundingClientRect()
      setCornerHandlePos({top:rect.top+8,left:rect.left+8})
      cornerRafRef.current=requestAnimationFrame(track)
    }
    cornerRafRef.current=requestAnimationFrame(track)
    return()=>{if(cornerRafRef.current)cancelAnimationFrame(cornerRafRef.current)}
  },[showCornerHandle,selectedImg])
  const [isDraggingBar,setIsDraggingBar]=useState(false)
  const [showAltInput,setShowAltInput]=useState(false)
  const [altInputVal,setAltInputVal]=useState('')
  const [showLinkOnImg,setShowLinkOnImg]=useState(false)
  const [imgLinkUrl,setImgLinkUrl]=useState('')
  const [showImgStyleDrop,setShowImgStyleDrop]=useState(false)
  const [currentImgStyle,setCurrentImgStyle]=useState('Normal')

  // Close all dropdowns on outside click
  useEffect(()=>{
    function handleOutside(e:MouseEvent){
      if(toolbarRef.current&&!toolbarRef.current.contains(e.target as Node)){
        setShowColorPick(false);setShowFontSize(false);setShowLinkInput(false)
        setShowStyleDrop(false);setShowFontDrop(false);setShowTableInput(false)
        setShowEmbedInput(false);setShowWordGoal(false)
      }
    }
    document.addEventListener('mousedown',handleOutside)
    return()=>document.removeEventListener('mousedown',handleOutside)
  },[])

  // Init value — also fires onChange so parent state stays in sync
  useEffect(()=>{
    if(editorRef.current&&value!==undefined&&editorRef.current.innerHTML!==value){
      editorRef.current.innerHTML=value
      setTimeout(()=>{
        if(editorRef.current){
          onChange?.(editorRef.current.innerHTML)
          updateStats()
        }
      },0)
    }
  },[value])

  // Auto-delete Supabase images on removal
  useEffect(()=>{
    if(!editorRef.current)return
    function getImgs():Set<string>{
      const s=new Set<string>()
      editorRef.current?.querySelectorAll('img').forEach(img=>{
        if(img.src.includes('supabase')&&img.src.includes('/blog/'))s.add(img.src)
      })
      return s
    }
    let tracked=getImgs()
    const obs=new MutationObserver(async()=>{
      const cur=getImgs()
      const deleted=[...tracked].filter(u=>!cur.has(u))
      for(const url of deleted){
        const match=url.match(/\/public\/([^?]+)/)
        if(match)await supabase.storage.from('public').remove([match[1]])
      }
      tracked=cur
    })
    obs.observe(editorRef.current,{childList:true,subtree:true,attributes:true,attributeFilter:['src']})
    return()=>obs.disconnect()
  },[])

  useEffect(()=>{updateStats()},[enableToC])

  // Stats
  const updateStats=useCallback(()=>{
    if(!editorRef.current)return
    const html=editorRef.current.innerHTML
    const text=editorRef.current.innerText.trim()
    const wc=text.split(/\s+/).filter(Boolean).length
    const cc=text.length
    setWordCount(wc);setCharCount(cc)
    const missing=[...html.matchAll(/<img[^>]*>/gi)].filter(m=>!m[0].match(/alt="[^"]+"/)).length
    let parsed=parseAdvancedBlocks(html)
    if(enableToC){const toc=generateToC(parsed);if(toc)parsed=toc+parsed}
    onChange?.(html)
    onStats?.({wordCount:wc,charCount:cc,readingTime:Math.max(1,Math.ceil(wc/200)),bodyText:text,bodyHtml:html,missingAltCount:missing})
  },[enableToC,onChange,onStats])

  function exec(cmd:string,val?:string){editorRef.current?.focus();document.execCommand(cmd,false,val);updateStats()}
  function insertHtml(html:string){editorRef.current?.focus();document.execCommand('insertHTML',false,html);updateStats()}
  function handleKeyDown(e:React.KeyboardEvent){
    if(e.ctrlKey||e.metaKey){
      if(e.key==='z'){e.preventDefault();exec('undo')}
      if(e.key==='y'){e.preventDefault();exec('redo')}
    }
  }

  const savedSelection=useRef<Range|null>(null)

  function openLinkInput(){
    // Save current selection before popup opens and focuses input
    const sel=window.getSelection()
    if(sel&&sel.rangeCount>0){
      savedSelection.current=sel.getRangeAt(0).cloneRange()
    }
    setShowLinkInput(s=>!s)
  }

  function insertLink(){
    if(!linkUrl)return
    editorRef.current?.focus()
    // Restore saved selection
    if(savedSelection.current){
      const sel=window.getSelection()
      if(sel){
        sel.removeAllRanges()
        sel.addRange(savedSelection.current)
      }
    }
    const sel=window.getSelection()
    if(sel&&sel.toString().trim()){
      document.execCommand('createLink',false,linkUrl)
    } else {
      insertHtml(`<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color:#4a8f00;text-decoration:underline;font-weight:500">${linkUrl}</a>`)
    }
    savedSelection.current=null
    setLinkUrl('');setShowLinkInput(false)
    updateStats()
  }

  function insertTable(){
    const header=`<tr>${Array.from({length:tableCols},(_,i)=>`<th style="border:1px solid #e8ede2;padding:8px 12px;background:#f7f9f5;font-weight:700;font-size:13px">Header ${i+1}</th>`).join('')}</tr>`
    const rows=Array.from({length:tableRows-1},(_,r)=>`<tr>${Array.from({length:tableCols},(_,c)=>`<td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">Row ${r+1}, Col ${c+1}</td>`).join('')}</tr>`).join('')
    insertHtml(`<table style="border-collapse:collapse;width:100%;margin:16px 0">${header}${rows}</table><p></p>`)
    setShowTableInput(false)
  }

  function insertEmbed(){
    if(!embedUrl.trim())return
    if(embedUrl.includes('youtube.com')||embedUrl.includes('youtu.be')){
      const id=embedUrl.match(/(?:v=|youtu\.be\/|\/shorts\/)([^&?/\s]+)/)?.[1]??''
      if(id)insertHtml(`<div style="position:relative;cursor:pointer;margin:16px 0;border-radius:12px;overflow:hidden" onclick="this.innerHTML='<iframe width=100% height=400 src=https://www.youtube.com/embed/${id}?autoplay=1 frameborder=0 allowfullscreen style=border-radius:12px></iframe>'"><img src="https://img.youtube.com/vi/${id}/maxresdefault.jpg" style="width:100%;height:400px;object-fit:cover;display:block" alt="Video"/><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3)"><div style="width:64px;height:64px;background:#ff0000;border-radius:50%;display:flex;align-items:center;justify-content:center"><div style="width:0;height:0;border-top:12px solid transparent;border-bottom:12px solid transparent;border-left:20px solid white;margin-left:4px"></div></div></div></div><p></p>`)
    }else{
      insertHtml(`<iframe src="${embedUrl}" width="100%" height="400" frameborder="0" style="border-radius:12px;margin:16px 0" allowfullscreen></iframe><p></p>`)
    }
    setEmbedUrl('');setShowEmbedInput(false)
  }

  async function pasteFromWord(){
    try{
      const raw=await navigator.clipboard.readText()
      const clean=raw.replace(/<o:p>.*?<\/o:p>/gi,'').replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/\u2013/g,'-').replace(/\u2014/g,'--').trim()
      insertHtml(clean||raw)
    }catch{alert('Allow clipboard access first')}
  }

  function insertPageBreak(){insertHtml('<div style="page-break-after:always;border-top:2px dashed #e8ede2;margin:24px 0;padding-top:8px"><span style="font-size:10px;color:#8a9e78;font-weight:700;letter-spacing:0.1em">PAGE BREAK</span></div>')}

  function exportPDF(){
    const win=window.open('','_blank');if(!win)return
    win.document.write(`<html><head><title>Export</title><style>body{font-family:Inter,sans-serif;max-width:800px;margin:40px auto;padding:0 24px;line-height:1.7}h1,h2,h3{color:#1a2410}@media print{body{margin:0}}</style></head><body>${editorRef.current?.innerHTML??''}</body></html>`)
    win.document.close();win.print()
  }

  // ── Image compression ────────────────────────────────────────
  async function compressImage(file:File, maxWidth=1200, quality=0.82):Promise<Blob>{
    return new Promise((resolve)=>{
      const img=new window.Image()
      const url=URL.createObjectURL(file)
      img.onload=()=>{
        URL.revokeObjectURL(url)
        const scale=Math.min(1,maxWidth/img.width)
        const w=Math.round(img.width*scale)
        const h=Math.round(img.height*scale)
        const canvas=document.createElement('canvas')
        canvas.width=w;canvas.height=h
        canvas.getContext('2d')!.drawImage(img,0,0,w,h)
        canvas.toBlob(blob=>resolve(blob??file),'image/jpeg',quality)
      }
      img.onerror=()=>resolve(file)
      img.src=url
    })
  }

  async function uploadImage(e:React.ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0];if(!file)return
    setUploading(true)
    try{
      const compressed=await compressImage(file)
      const path=`blog/${Date.now()}.jpg`
      const{error}=await supabase.storage.from('public').upload(path,compressed,{upsert:true,contentType:'image/jpeg'})
      if(!error){
        const{data:{publicUrl}}=supabase.storage.from('public').getPublicUrl(path)
        insertHtml(`<img src="${publicUrl}" alt="${file.name}" style="max-width:100%;border-radius:8px;margin:8px 0;display:block"/>`)
      } else {
        insertHtml(`<img src="${URL.createObjectURL(file)}" alt="${file.name}" style="max-width:100%;border-radius:8px;margin:8px 0;display:block"/>`)
      }
    }catch{
      insertHtml(`<img src="${URL.createObjectURL(file)}" alt="${file.name}" style="max-width:100%;border-radius:8px;margin:8px 0;display:block"/>`)
    }
    setUploading(false)
    e.target.value=''
  }

  // SEO blocks
  function insertFAQ(){insertHtml('<p>:::faq</p><p>Q: Your question here?</p><p>A: Your answer here.</p><p>Q: Another question?</p><p>A: Another answer.</p><p>:::</p>')}
  function insertCallout(type:'info'|'warning'){insertHtml(`<p>:::${type}</p><p>Your note goes here.</p><p>:::</p>`)}
  function insertCTA(tier:string){insertHtml(`<p>[CTA:${tier}]</p>`)}
  function insertHowToStep(n:number){insertHtml(`<h3>Step ${n}: Step title here</h3><p>Describe this step clearly.</p>`)}

  function insertProsConsBlock(){insertHtml(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0"><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:16px"><p style="font-size:11px;font-weight:900;letter-spacing:0.08em;color:#16a34a;margin:0 0 10px">PROS</p><ul style="margin:0;padding-left:18px;color:#15803d;font-size:13px;line-height:1.8"><li>First pro here</li><li>Second pro here</li><li>Third pro here</li></ul></div><div style="background:#fef2f2;border:1px solid #fecaca;border-radius:14px;padding:16px"><p style="font-size:11px;font-weight:900;letter-spacing:0.08em;color:#dc2626;margin:0 0 10px">CONS</p><ul style="margin:0;padding-left:18px;color:#b91c1c;font-size:13px;line-height:1.8"><li>First con here</li><li>Second con here</li><li>Third con here</li></ul></div></div><p></p>`)}

  function insertKeyTakeaway(){insertHtml(`<div style="background:#f4ffe6;border-left:4px solid #8fff00;border-radius:0 14px 14px 0;padding:16px 20px;margin:20px 0"><p style="font-size:11px;font-weight:900;letter-spacing:0.08em;color:#4a8f00;margin:0 0 6px">KEY TAKEAWAY</p><p style="font-size:14px;font-weight:600;color:#1a2410;margin:0;line-height:1.6">Add your key takeaway here.</p></div><p></p>`)}

  function insertStatBox(){insertHtml(`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0"><div style="background:#1a2410;border-radius:14px;padding:16px 20px;text-align:center"><p style="font-size:28px;font-weight:900;color:#8fff00;margin:0">$2,400</p><p style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.6);margin:4px 0 0">AVG MONTHLY PROFIT</p></div><div style="background:#1a2410;border-radius:14px;padding:16px 20px;text-align:center"><p style="font-size:28px;font-weight:900;color:#8fff00;margin:0">3.2x</p><p style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.6);margin:4px 0 0">AVG ROI</p></div><div style="background:#1a2410;border-radius:14px;padding:16px 20px;text-align:center"><p style="font-size:28px;font-weight:900;color:#8fff00;margin:0">87%</p><p style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.6);margin:4px 0 0">SUCCESS RATE</p></div></div><p></p>`)}

  function insertProductShowcase(){insertHtml(`<div style="display:flex;gap:16px;background:#fff;border:1px solid #e8ede2;border-radius:16px;padding:16px;margin:20px 0;align-items:flex-start"><img src="https://via.placeholder.com/120x120?text=Product" alt="Product" style="width:120px;height:120px;object-fit:cover;border-radius:10px;border:1px solid #e8ede2;flex-shrink:0"/><div style="flex:1"><p style="font-size:11px;font-weight:900;letter-spacing:0.08em;color:#8a9e78;margin:0 0 4px">PRODUCT SPOTLIGHT</p><p style="font-size:16px;font-weight:800;color:#1a2410;margin:0 0 6px">Product Name Here</p><p style="font-size:13px;color:#8a9e78;margin:0 0 10px;line-height:1.5">Short product description here.</p><div style="display:flex;gap:16px;flex-wrap:wrap"><div><p style="font-size:10px;font-weight:700;color:#8a9e78;margin:0">BUY</p><p style="font-size:15px;font-weight:900;color:#1a2410;margin:0">$XX</p></div><div><p style="font-size:10px;font-weight:700;color:#8a9e78;margin:0">SELL</p><p style="font-size:15px;font-weight:900;color:#1a2410;margin:0">$XX</p></div><div><p style="font-size:10px;font-weight:700;color:#8a9e78;margin:0">PROFIT</p><p style="font-size:15px;font-weight:900;color:#16a34a;margin:0">$XX</p></div><div><p style="font-size:10px;font-weight:700;color:#8a9e78;margin:0">ROI</p><p style="font-size:15px;font-weight:900;color:#16a34a;margin:0">XX%</p></div></div></div></div><p></p>`)}

  function insertComparisonTable(){insertHtml(`<div style="margin:20px 0;overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr><th style="padding:10px 14px;text-align:left;background:#1a2410;color:#8fff00;font-size:11px;font-weight:900;letter-spacing:0.08em">FEATURE</th><th style="padding:10px 14px;text-align:center;background:#1a2410;color:#fff;font-size:11px;font-weight:900">OPTION A</th><th style="padding:10px 14px;text-align:center;background:#1a2410;color:#fff;font-size:11px;font-weight:900">OPTION B</th></tr></thead><tbody><tr style="background:#f7f9f5"><td style="padding:10px 14px;font-weight:600;color:#1a2410;border-bottom:1px solid #e8ede2">Price</td><td style="padding:10px 14px;text-align:center;border-bottom:1px solid #e8ede2">$XX</td><td style="padding:10px 14px;text-align:center;border-bottom:1px solid #e8ede2">$XX</td></tr><tr><td style="padding:10px 14px;font-weight:600;color:#1a2410;border-bottom:1px solid #e8ede2">Profit Margin</td><td style="padding:10px 14px;text-align:center;color:#16a34a;font-weight:700;border-bottom:1px solid #e8ede2">XX%</td><td style="padding:10px 14px;text-align:center;color:#16a34a;font-weight:700;border-bottom:1px solid #e8ede2">XX%</td></tr><tr style="background:#f7f9f5"><td style="padding:10px 14px;font-weight:600;color:#1a2410">Recommended</td><td style="padding:10px 14px;text-align:center">Yes</td><td style="padding:10px 14px;text-align:center">No</td></tr></tbody></table></div><p></p>`)}

  // Image placeholder click
  function handleEditorClick(e:React.MouseEvent){
    const target=e.target as HTMLElement
    if(target.tagName==='IMG'){
      const img=target as HTMLImageElement
      const rect=img.getBoundingClientRect()
      setSelectedImg(img);setAltInputVal(img.alt||'');setImgLinkUrl(img.closest('a')?.href||'')
      setShowImgToolbar(true);setShowAltInput(false);setShowLinkOnImg(false)
      setShowImgStyleDrop(false);setCurrentImgStyle('Normal')
      setImgToolbarPos({top:rect.top-52+window.scrollY,left:rect.left+window.scrollX})
      return
    }
    if(showImgToolbar){setShowImgToolbar(false);setSelectedImg(null)}
    const ph=(target.closest('div[style*="border: 2px dashed"]')||target.closest('div[style*="border:2px dashed"]')||target.closest('div[style*="dashed #e8ede2"]')||target.closest('div[style*="linear-gradient(135deg,#1a2410"]')) as HTMLElement|null
    if(ph){e.preventDefault();setImgPickerTarget(ph);setImgPickerUrl('');setShowImgPicker(true)}
  }

  function applyImageToPlaceholder(url:string){
    if(!url||!editorRef.current)return
    const figure=imgPickerTarget?.closest('figure') as HTMLElement|null
    const target=(figure||imgPickerTarget) as HTMLElement|null
    if(!target)return
    const caption=figure?.querySelector('figcaption')?.textContent??''
    const isHero=target.style.background?.includes('linear-gradient')||target.innerHTML?.includes('Featured Image')
    const newHtml=isHero
      ?`<img src="${url}" alt="Featured image" style="width:100%;height:320px;object-fit:cover;border-radius:16px;display:block;margin:16px 0"/>`
      :`<figure style="margin:20px 0"><img src="${url}" alt="${caption}" style="width:100%;border-radius:12px;display:block"/>${caption?`<figcaption style="text-align:center;font-size:12px;color:#8a9e78;margin-top:8px;font-style:italic">${caption}</figcaption>`:''}</figure>`
    const wrapper=document.createElement('div');wrapper.innerHTML=newHtml
    const newNode=wrapper.firstElementChild as HTMLElement
    if(newNode&&target.parentNode)target.parentNode.replaceChild(newNode,target)
    setShowImgPicker(false);setImgPickerTarget(null);setImgPickerUrl('');updateStats()
  }

  async function uploadImageToPlaceholder(e:React.ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0];if(!file)return
    setUploading(true)
    try{
      const compressed=await compressImage(file)
      const path=`blog/${Date.now()}.jpg`
      const{error}=await supabase.storage.from('public').upload(path,compressed,{upsert:true,contentType:'image/jpeg'})
      applyImageToPlaceholder(error?URL.createObjectURL(file):(()=>{const{data:{publicUrl}}=supabase.storage.from('public').getPublicUrl(path);return publicUrl})())
    }catch{applyImageToPlaceholder(URL.createObjectURL(file))}
    setUploading(false)
  }

  // Image toolbar drag
  function onToolbarMouseDown(e:React.MouseEvent){
    if((e.target as HTMLElement).tagName==='BUTTON'||(e.target as HTMLElement).tagName==='INPUT')return
    e.preventDefault();e.stopPropagation()
    const rect=toolbarRef2.current!.getBoundingClientRect()
    dragOffset.current={x:e.clientX-rect.left,y:e.clientY-rect.top}
    isDragging.current=true;setIsDraggingBar(true)
    function onMove(e:MouseEvent){
      if(!isDragging.current)return
      setImgToolbarPos({left:e.clientX-dragOffset.current.x+window.scrollX,top:e.clientY-dragOffset.current.y+window.scrollY})
    }
    function onUp(){isDragging.current=false;setIsDraggingBar(false);document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp)}
    document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp)
  }

  // Image toolbar actions
  function imgSetSize(s:'full'|'half'|'third'){
    if(!selectedImg)return
    const w=s==='full'?'100%':s==='half'?'50%':'33%'
    selectedImg.style.width=w;selectedImg.style.display='block';selectedImg.style.margin=s==='full'?'12px 0':'12px auto';updateStats()
  }
  function imgSetFloat(d:'left'|'right'|'none'){
    if(!selectedImg)return
    selectedImg.style.float=d==='none'?'':d;selectedImg.style.margin=d==='left'?'8px 16px 8px 0':d==='right'?'8px 0 8px 16px':'12px 0';selectedImg.style.width=d==='none'?'100%':'45%';updateStats()
  }
  function imgHighlight(col:string){if(!selectedImg)return;selectedImg.style.outline=col==='transparent'?'none':`4px solid ${col}`;selectedImg.style.outlineOffset='3px';updateStats()}
  function imgSetAlt(){if(!selectedImg)return;selectedImg.alt=altInputVal;setShowAltInput(false);updateStats()}
  function imgAddLink(){
    if(!selectedImg||!imgLinkUrl)return
    const ex=selectedImg.closest('a') as HTMLAnchorElement|null
    if(ex){ex.href=imgLinkUrl}else{const a=document.createElement('a');a.href=imgLinkUrl;a.target='_blank';a.rel='noopener noreferrer';selectedImg.parentNode?.insertBefore(a,selectedImg);a.appendChild(selectedImg)}
    setShowLinkOnImg(false);updateStats()
  }
  function imgDelete(){
    if(!selectedImg)return
    const fig=selectedImg.closest('figure');const t=fig||selectedImg;t.parentNode?.removeChild(t)
    setShowImgToolbar(false);setSelectedImg(null);setShowCornerHandle(false);updateStats()
  }
  function imgReplace(){if(!selectedImg)return;setImgPickerTarget(selectedImg);setImgPickerUrl('');setShowImgPicker(true);setShowImgToolbar(false)}

  function openAnnotator(){
    if(!selectedImg)return
    const rect=selectedImg.getBoundingClientRect()
    setAnnoRect({top:rect.top+window.scrollY,left:rect.left+window.scrollX,width:rect.width,height:rect.height})
    setAnnoImg(selectedImg);setShowAnnotator(true)
    setShowImgToolbar(false);setShowCornerHandle(false)
    annoHistory.current=[];annoHistoryIdx.current=-1
    annoObjects.current=[]
  }

  function getCanvasPos(e:React.MouseEvent<HTMLCanvasElement>){
    const canvas=annoCanvasRef.current!
    const rect=canvas.getBoundingClientRect()
    return{x:(e.clientX-rect.left)*(canvas.width/rect.width),y:(e.clientY-rect.top)*(canvas.height/rect.height)}
  }

  function annoSaveHistory(){
    const canvas=annoCanvasRef.current;if(!canvas)return
    const ctx=canvas.getContext('2d')!
    const snap=ctx.getImageData(0,0,canvas.width,canvas.height)
    // Trim redo history
    annoHistory.current=annoHistory.current.slice(0,annoHistoryIdx.current+1)
    annoHistory.current.push(snap)
    annoHistoryIdx.current=annoHistory.current.length-1
  }

  function annoUndo(){
    const canvas=annoCanvasRef.current;if(!canvas)return
    if(annoHistoryIdx.current<=0){
      // Restore original image
      annoLoadImage();annoHistoryIdx.current=-1
      annoObjects.current=[];setAnnoSelectedObj(-1);return
    }
    annoHistoryIdx.current--
    canvas.getContext('2d')!.putImageData(annoHistory.current[annoHistoryIdx.current],0,0)
    if(annoObjects.current.length>0){annoObjects.current.pop();setAnnoSelectedObj(-1)}
  }

  function annoRedo(){
    const canvas=annoCanvasRef.current;if(!canvas)return
    if(annoHistoryIdx.current>=annoHistory.current.length-1)return
    annoHistoryIdx.current++
    canvas.getContext('2d')!.putImageData(annoHistory.current[annoHistoryIdx.current],0,0)
  }

  function redrawCanvas(){
    const canvas=annoCanvasRef.current;if(!canvas)return
    const ctx=canvas.getContext('2d')!
    // Start from base image
    const base=annoHistory.current[0]
    if(base)ctx.putImageData(base,0,0)
    // Redraw all objects
    annoObjects.current.forEach((obj,i)=>{
      drawObject(ctx,obj,i===annoSelectedObj)
    })
  }

  function drawObject(ctx:CanvasRenderingContext2D,obj:any,selected=false){
    ctx.strokeStyle=obj.color;ctx.fillStyle=obj.color;ctx.lineWidth=obj.size;ctx.lineCap='round';ctx.lineJoin='round'
    if(obj.type==='arrow'){
      const dx=obj.x2-obj.x1,dy=obj.y2-obj.y1
      const angle=Math.atan2(dy,dx),headLen=20+obj.size*3
      ctx.beginPath();ctx.moveTo(obj.x1,obj.y1);ctx.lineTo(obj.x2,obj.y2);ctx.stroke()
      ctx.beginPath();ctx.moveTo(obj.x2,obj.y2)
      ctx.lineTo(obj.x2-headLen*Math.cos(angle-Math.PI/6),obj.y2-headLen*Math.sin(angle-Math.PI/6))
      ctx.lineTo(obj.x2-headLen*Math.cos(angle+Math.PI/6),obj.y2-headLen*Math.sin(angle+Math.PI/6))
      ctx.closePath();ctx.fill()
    } else if(obj.type==='line'){
      ctx.beginPath();ctx.moveTo(obj.x1,obj.y1);ctx.lineTo(obj.x2,obj.y2);ctx.stroke()
    } else if(obj.type==='rect'){
      ctx.strokeRect(obj.x1,obj.y1,obj.x2-obj.x1,obj.y2-obj.y1)
    } else if(obj.type==='circle'){
      const rx=(obj.x2-obj.x1)/2,ry=(obj.y2-obj.y1)/2
      ctx.beginPath();ctx.ellipse(obj.x1+rx,obj.y1+ry,Math.abs(rx),Math.abs(ry),0,0,Math.PI*2);ctx.stroke()
    } else if(obj.type==='pen'){
      ctx.beginPath();ctx.moveTo(obj.points[0].x,obj.points[0].y)
      obj.points.forEach((p:any)=>ctx.lineTo(p.x,p.y));ctx.stroke()
    } else if(obj.type==='text'){
      const sizeMap:Record<string,number>={'S':14,'M':20,'L':28,'XL':40}
      const fs=sizeMap[obj.fontSize||'M']||(14+obj.size*3)
      const weight=obj.bold?'900':'700'
      const style=obj.italic?'italic ':''
      ctx.font=`${style}${weight} ${fs}px Inter, sans-serif`
      const tw=ctx.measureText(obj.text).width
      const th=fs
      // Background pill
      if(obj.bg==='dark'){
        ctx.save();ctx.fillStyle='rgba(0,0,0,0.65)';const pad=8
        const rx=obj.x1-pad,ry=obj.y1-th,rw=tw+pad*2,rh=th+pad*1.5
        ctx.beginPath();ctx.roundRect(rx,ry,rw,rh,8);ctx.fill();ctx.restore()
      } else if(obj.bg==='light'){
        ctx.save();ctx.fillStyle='rgba(255,255,255,0.75)';const pad=8
        const rx=obj.x1-pad,ry=obj.y1-th,rw=tw+pad*2,rh=th+pad*1.5
        ctx.beginPath();ctx.roundRect(rx,ry,rw,rh,8);ctx.fill();ctx.restore()
      }
      // Text shadow
      ctx.save();ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=4;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1
      ctx.fillStyle=obj.color;ctx.fillText(obj.text,obj.x1,obj.y1)
      ctx.restore()
    }
    // Selection indicator
    if(selected){
      ctx.save();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.setLineDash([4,4])
      const pad=8
      const x1=Math.min(obj.x1??0,obj.x2??0)-pad,y1=Math.min(obj.y1??0,obj.y2??0)-pad
      const w=Math.abs((obj.x2??obj.x1)-obj.x1)+pad*2,h=Math.abs((obj.y2??obj.y1)-obj.y1)+pad*2
      ctx.strokeRect(x1,y1,w,h);ctx.restore()
    }
  }

  function hitTest(obj:any,px:number,py:number):boolean{
    const pad=15
    const x1=Math.min(obj.x1??0,obj.x2??0)-pad,y1=Math.min(obj.y1??0,obj.y2??0)-pad
    const x2=Math.max(obj.x1??0,obj.x2??0)+pad,y2=Math.max(obj.y1??0,obj.y2??0)+pad
    return px>=x1&&px<=x2&&py>=y1&&py<=y2
  }

  function annoMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
    const canvas=annoCanvasRef.current!
    const ctx=canvas.getContext('2d')!
    const pos=getCanvasPos(e)

    if(annoTool==='select'){
      // Find clicked object (reverse order = top first)
      const idx=annoObjects.current.slice().reverse().findIndex(o=>hitTest(o,pos.x,pos.y))
      const realIdx=idx>=0?annoObjects.current.length-1-idx:-1
      setAnnoSelectedObj(realIdx)
      if(realIdx>=0){
        const obj=annoObjects.current[realIdx]
        annoMoving.current=true
        annoMoveStart.current={x:pos.x,y:pos.y,objX:obj.x1,objY:obj.y1}
      }
      return
    }

    if(annoTool==='text'){setAnnoTextPos(pos);setAnnoTextVal('');return}

    annoDrawing.current=true
    annoStart.current=pos
    annoPenPath.current=[pos]
    annoSnapshot.current=ctx.getImageData(0,0,canvas.width,canvas.height)
  }

  function annoMouseMove(e:React.MouseEvent<HTMLCanvasElement>){
    const canvas=annoCanvasRef.current!
    const ctx=canvas.getContext('2d')!
    const pos=getCanvasPos(e)

    // Moving selected object
    if(annoTool==='select'&&annoMoving.current&&annoSelectedObj>=0){
      const obj=annoObjects.current[annoSelectedObj]
      const dx=pos.x-annoMoveStart.current.x
      const dy=pos.y-annoMoveStart.current.y
      const w=(obj.x2??obj.x1)-obj.x1
      const h=(obj.y2??obj.y1)-obj.y1
      obj.x1=annoMoveStart.current.objX+dx
      obj.y1=annoMoveStart.current.objY+dy
      if(obj.x2!==undefined)obj.x2=obj.x1+w
      if(obj.y2!==undefined)obj.y2=obj.y1+h
      if(obj.points)obj.points=obj.points.map((p:any)=>({x:p.x+dx-((annoMoving.current?0:0)),y:p.y+dy-((annoMoving.current?0:0))}))
      redrawCanvas();return
    }

    if(!annoDrawing.current||annoTool==='text')return
    const s=annoStart.current
    ctx.putImageData(annoSnapshot.current!,0,0)
    // Redraw committed objects
    annoObjects.current.forEach(obj=>drawObject(ctx,obj))
    ctx.strokeStyle=annoColor;ctx.fillStyle=annoColor;ctx.lineWidth=annoSize;ctx.lineCap='round';ctx.lineJoin='round'

    if(annoTool==='pen'){
      annoPenPath.current.push(pos)
      ctx.beginPath();ctx.moveTo(annoPenPath.current[0].x,annoPenPath.current[0].y)
      annoPenPath.current.forEach(p=>ctx.lineTo(p.x,p.y));ctx.stroke()
    } else if(annoTool==='line'){
      ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(pos.x,pos.y);ctx.stroke()
    } else if(annoTool==='rect'){
      ctx.strokeRect(s.x,s.y,pos.x-s.x,pos.y-s.y)
    } else if(annoTool==='circle'){
      const rx=(pos.x-s.x)/2,ry=(pos.y-s.y)/2
      ctx.beginPath();ctx.ellipse(s.x+rx,s.y+ry,Math.abs(rx),Math.abs(ry),0,0,Math.PI*2);ctx.stroke()
    } else if(annoTool==='arrow'){
      const dx=pos.x-s.x,dy=pos.y-s.y
      const angle=Math.atan2(dy,dx),headLen=20+annoSize*3
      ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(pos.x,pos.y);ctx.stroke()
      ctx.beginPath();ctx.moveTo(pos.x,pos.y)
      ctx.lineTo(pos.x-headLen*Math.cos(angle-Math.PI/6),pos.y-headLen*Math.sin(angle-Math.PI/6))
      ctx.lineTo(pos.x-headLen*Math.cos(angle+Math.PI/6),pos.y-headLen*Math.sin(angle+Math.PI/6))
      ctx.closePath();ctx.fill()
    } else if(annoTool==='blur'){
      ctx.save();ctx.filter='blur(8px)'
      ctx.drawImage(canvas,s.x,s.y,Math.abs(pos.x-s.x),Math.abs(pos.y-s.y),Math.min(s.x,pos.x),Math.min(s.y,pos.y),Math.abs(pos.x-s.x),Math.abs(pos.y-s.y))
      ctx.restore()
    }
  }

  function annoMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
    if(annoTool==='select'){annoMoving.current=false;return}
    if(!annoDrawing.current)return
    annoDrawing.current=false
    const pos=getCanvasPos(e)
    const s=annoStart.current
    // Save object to list
    let obj:any=null
    if(annoTool==='pen')obj={type:'pen',points:[...annoPenPath.current],color:annoColor,size:annoSize,x1:annoPenPath.current[0]?.x??0,y1:annoPenPath.current[0]?.y??0,x2:pos.x,y2:pos.y}
    else if(annoTool==='text')return
    else obj={type:annoTool,x1:s.x,y1:s.y,x2:pos.x,y2:pos.y,color:annoColor,size:annoSize}
    if(obj){annoObjects.current.push(obj);annoSaveHistory()}
  }

  function annoAddText(){
    if(!annoTextPos||!annoTextVal.trim())return
    const obj={
      type:'text',x1:annoTextPos.x,y1:annoTextPos.y,
      text:annoTextVal,color:annoColor,size:annoSize,
      fontSize:annoTextSize,bold:annoTextBold,italic:annoTextItalic,bg:annoTextBg
    }
    annoObjects.current.push(obj)
    const canvas=annoCanvasRef.current;if(!canvas)return
    drawObject(canvas.getContext('2d')!,obj)
    annoSaveHistory()
    setAnnoTextPos(null);setAnnoTextVal('')
  }

  function annoSave(){
    if(!annoImg||!annoCanvasRef.current)return
    // Deselect before saving
    setAnnoSelectedObj(-1)
    redrawCanvas()
    setTimeout(()=>{
      const dataUrl=annoCanvasRef.current!.toDataURL('image/png')
      annoImg.src=dataUrl;annoImg.style.maxWidth='100%'
      setShowAnnotator(false);setAnnoImg(null);updateStats()
    },50)
  }

  function annoLoadImage(){
    if(!annoImg||!annoCanvasRef.current)return
    const canvas=annoCanvasRef.current
    const ctx=canvas.getContext('2d')!
    const img=new window.Image()
    img.crossOrigin='anonymous'
    img.onload=()=>{
      canvas.width=annoImg.naturalWidth||annoImg.width||800
      canvas.height=annoImg.naturalHeight||annoImg.height||600
      ctx.drawImage(img,0,0,canvas.width,canvas.height)
      annoSaveHistory()
    }
    img.src=annoImg.src
  }

  function applyImgStyle(name:string){
    if(!selectedImg)return
    const img=selectedImg
    // Reset all
    img.style.borderRadius='';img.style.filter='';img.style.boxShadow='';img.style.border=''
    img.style.outline='';img.style.padding='';img.style.background='';img.style.objectFit=''
    img.style.width='100%';img.style.height='';img.style.display='block';img.style.margin='12px 0'
    img.style.float='';img.style.transform='';img.style.webkitMaskImage='';img.style.maskImage=''
    // Original 10
    if(name==='Rounded'){img.style.borderRadius='16px'}
    else if(name==='Circle'){img.style.borderRadius='50%';img.style.width='200px';img.style.height='200px';img.style.objectFit='cover';img.style.margin='12px auto'}
    else if(name==='Polaroid'){img.style.padding='10px 10px 40px 10px';img.style.background='#fff';img.style.boxShadow='0 4px 24px rgba(0,0,0,0.15)';img.style.borderRadius='4px';img.style.margin='20px auto'}
    else if(name==='Banner'){img.style.width='100%';img.style.height='220px';img.style.objectFit='cover';img.style.borderRadius='12px'}
    else if(name==='Square'){img.style.width='300px';img.style.height='300px';img.style.objectFit='cover';img.style.margin='12px auto'}
    else if(name==='Grayscale'){img.style.filter='grayscale(100%)';img.style.borderRadius='8px'}
    else if(name==='Sepia'){img.style.filter='sepia(80%)';img.style.borderRadius='8px'}
    else if(name==='Shadow'){img.style.borderRadius='12px';img.style.boxShadow='0 12px 40px rgba(0,0,0,0.2)'}
    else if(name==='Dark Frame'){img.style.border='4px solid #1a2410';img.style.outline='2px solid #8fff00';img.style.outlineOffset='3px';img.style.borderRadius='8px'}
    // New 8
    else if(name==='Top Round'){img.style.borderRadius='16px 16px 0 0'}
    else if(name==='Bottom Round'){img.style.borderRadius='0 0 16px 16px'}
    else if(name==='Left Round'){img.style.borderRadius='16px 0 0 16px'}
    else if(name==='One Corner'){img.style.borderRadius='24px 0 0 0'}
    else if(name==='Neon'){img.style.borderRadius='12px';img.style.boxShadow='0 0 0 3px #8fff00, 0 0 20px rgba(143,255,0,0.5), 0 0 40px rgba(143,255,0,0.2)'}
    else if(name==='Double Border'){img.style.borderRadius='8px';img.style.border='3px solid #1a2410';img.style.outline='3px solid #e8ede2';img.style.outlineOffset='4px';img.style.margin='20px auto'}
    else if(name==='Tilt Left'){img.style.borderRadius='8px';img.style.transform='rotate(-3deg)';img.style.boxShadow='0 8px 24px rgba(0,0,0,0.15)';img.style.margin='20px auto'}
    else if(name==='Tilt Right'){img.style.borderRadius='8px';img.style.transform='rotate(3deg)';img.style.boxShadow='0 8px 24px rgba(0,0,0,0.15)';img.style.margin='20px auto'}
    else if(name==='Vintage'){img.style.filter='sepia(60%) contrast(1.1) brightness(0.95)';img.style.border='6px solid #fff';img.style.boxShadow='0 4px 20px rgba(0,0,0,0.3)';img.style.transform='rotate(-1.5deg)';img.style.margin='20px auto'}
    setCurrentImgStyle(name);setShowImgStyleDrop(false);updateStats()
    // Show corner handle for styles with border-radius
    const cornerStyles=['Normal','Rounded','Top Round','Bottom Round','Left Round','One Corner','Shadow','Dark Frame','Neon','Double Border','Tilt Left','Tilt Right','Vintage','Grayscale','Sepia','Banner']
    if(cornerStyles.includes(name)&&img){
      const current=parseInt(img.style.borderRadius?.split('px')[0]||'0')||0
      setCornerRadius(current)
      setShowCornerHandle(true)
    } else {
      setShowCornerHandle(false)
    }
  }

  function onCornerHandleMouseDown(e:React.MouseEvent){
    e.preventDefault();e.stopPropagation()
    isDraggingCorner.current=true
    cornerDragStart.current={x:e.clientX,radius:cornerRadius}
    function onMove(e:MouseEvent){
      if(!isDraggingCorner.current||!selectedImg)return
      const diff=e.clientX-cornerDragStart.current.x
      const newRadius=Math.max(0,Math.min(100,cornerDragStart.current.radius+Math.round(diff/2)))
      setCornerRadius(newRadius)
      const name=currentImgStyle
      if(name==='Top Round')selectedImg.style.borderRadius=`${newRadius}px ${newRadius}px 0 0`
      else if(name==='Bottom Round')selectedImg.style.borderRadius=`0 0 ${newRadius}px ${newRadius}px`
      else if(name==='Left Round')selectedImg.style.borderRadius=`${newRadius}px 0 0 ${newRadius}px`
      else if(name==='One Corner')selectedImg.style.borderRadius=`${newRadius}px 0 0 0`
      else selectedImg.style.borderRadius=`${newRadius}px`
    }
    function onUp(){
      isDraggingCorner.current=false
      document.removeEventListener('mousemove',onMove)
      document.removeEventListener('mouseup',onUp)
      updateStats()
    }
    document.addEventListener('mousemove',onMove)
    document.addEventListener('mouseup',onUp)
  }

  const readingTime=Math.max(1,Math.ceil(wordCount/200))
  const imgStyles=[
    {name:'Normal',desc:'Default'},
    {name:'Rounded',desc:'Soft corners'},
    {name:'Circle',desc:'Circular crop'},
    {name:'Polaroid',desc:'Photo frame'},
    {name:'Banner',desc:'Wide crop'},
    {name:'Square',desc:'1:1 crop'},
    {name:'Grayscale',desc:'Black & white'},
    {name:'Sepia',desc:'Vintage warm'},
    {name:'Shadow',desc:'Floating'},
    {name:'Dark Frame',desc:'Branded'},
    {name:'Top Round',desc:'Top corners'},
    {name:'Bottom Round',desc:'Bottom corners'},
    {name:'Left Round',desc:'Left side'},
    {name:'One Corner',desc:'Single corner'},
    {name:'Neon',desc:'Glowing outline'},
    {name:'Double Border',desc:'Two borders'},
    {name:'Tilt Left',desc:'Rotate left'},
    {name:'Tilt Right',desc:'Rotate right'},
    {name:'Vintage',desc:'Old photo'},
  ]

  return (
    <div className={'rounded-2xl border overflow-visible flex flex-col relative '+className}
         style={{borderColor:C.border,minHeight:focusMode?'calc(100vh - 120px)':minHeight,fontFamily:'Inter, sans-serif'}}>

      {/* Toolbar Row 1 */}
      <div ref={toolbarRef} className="border-b px-3 py-2 flex flex-wrap items-center gap-0.5"
           style={{backgroundColor:C.bg,borderColor:C.border}}>

        {/* Style dropdown */}
        <div className="relative">
          <button onMouseDown={e=>{e.preventDefault();setShowStyleDrop(s=>!s);setShowColorPick(false);setShowFontSize(false)}}
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-[11px] font-bold hover:opacity-80 min-w-[110px] justify-between"
            style={{borderColor:C.border,color:C.dark,backgroundColor:C.surface}}>
            {currentStyle}<ChevronDown size={10} style={{color:C.muted}}/>
          </button>
          {showStyleDrop&&(
            <div className="absolute top-9 left-0 z-50 rounded-xl border shadow-lg overflow-hidden"
                 style={{backgroundColor:C.surface,borderColor:C.border,minWidth:200}}>
              {[
                {label:'Normal',tag:'p',fs:13,fw:400},
                {label:'Heading 1',tag:'h1',fs:20,fw:900},
                {label:'Heading 2',tag:'h2',fs:16,fw:800},
                {label:'Heading 3',tag:'h3',fs:14,fw:700},
                {label:'Heading 4',tag:'h4',fs:13,fw:700},
                {label:'Quote',tag:'blockquote',fs:13,fw:400,italic:true,col:C.limeDeep},
                {label:'Code Block',tag:'pre',fs:11,fw:400,mono:true},
              ].map(({label,tag,fs,fw,italic,col,mono})=>(
                <button key={tag} onMouseDown={e=>{e.preventDefault();exec('formatBlock',tag);setCurrentStyle(label);setShowStyleDrop(false)}}
                  className="w-full px-3 py-2 text-left hover:opacity-80 flex items-center justify-between"
                  style={{backgroundColor:currentStyle===label?C.limeTint:C.surface}}>
                  <span style={{fontSize:fs,fontWeight:fw,fontStyle:italic?'italic':'normal',color:col||C.dark,fontFamily:mono?'monospace':'inherit'}}>{label}</span>
                  {currentStyle===label&&<CheckCircle size={11} style={{color:C.green}}/>}
                </button>
              ))}
            </div>
          )}
        </div>
        <TDiv/>

        {/* Font dropdown */}
        <div className="relative">
          <button onMouseDown={e=>{e.preventDefault();setShowFontDrop(s=>!s);setShowStyleDrop(false);setShowColorPick(false);setShowFontSize(false)}}
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-[11px] font-bold hover:opacity-80 min-w-[100px] justify-between"
            style={{borderColor:C.border,color:C.dark,backgroundColor:C.surface,fontFamily:currentFont}}>
            {currentFont}<ChevronDown size={10} style={{color:C.muted}}/>
          </button>
          {showFontDrop&&(
            <div className="absolute top-9 left-0 z-50 rounded-xl border shadow-lg overflow-hidden"
                 style={{backgroundColor:C.surface,borderColor:C.border,minWidth:220}}>
              {[
                {name:'Inter',stack:'Inter, sans-serif',label:'Inter — Default'},
                {name:'Georgia',stack:'Georgia, serif',label:'Georgia — Classic'},
                {name:'Merriweather',stack:'Merriweather, serif',label:'Merriweather — Editorial'},
                {name:'Roboto',stack:'Roboto, sans-serif',label:'Roboto — Clean'},
                {name:'Lato',stack:'Lato, sans-serif',label:'Lato — Friendly'},
                {name:'Montserrat',stack:'Montserrat, sans-serif',label:'Montserrat — Modern'},
                {name:'Open Sans',stack:'"Open Sans", sans-serif',label:'Open Sans — Readable'},
                {name:'Courier',stack:'"Courier New", Courier, monospace',label:'Courier — Code'},
              ].map(({name,stack,label})=>(
                <button key={name} onMouseDown={e=>{e.preventDefault();exec('fontName',stack);setCurrentFont(name);setShowFontDrop(false)}}
                  className="w-full px-3 py-2.5 text-left hover:opacity-80 flex items-center justify-between"
                  style={{backgroundColor:currentFont===name?C.limeTint:C.surface}}>
                  <span style={{fontFamily:stack,fontSize:13,color:C.dark}}>{label}</span>
                  {currentFont===name&&<CheckCircle size={11} style={{color:C.green}}/>}
                </button>
              ))}
            </div>
          )}
        </div>
        <TDiv/>

        {/* Formatting */}
        <ToolBtn icon={Bold} title="Bold" onClick={()=>exec('bold')}/>
        <ToolBtn icon={Italic} title="Italic" onClick={()=>exec('italic')}/>
        <ToolBtn icon={Underline} title="Underline" onClick={()=>exec('underline')}/>
        <ToolBtn icon={Strikethrough} title="Strikethrough" onClick={()=>exec('strikeThrough')}/>
        <TDiv/>

        {/* Font size */}
        <div className="relative">
          <button onMouseDown={e=>{e.preventDefault();setShowFontSize(s=>!s);setShowColorPick(false)}}
            className="flex items-center gap-0.5 px-2 h-7 rounded-md text-[10px] font-bold hover:opacity-70 border"
            style={{borderColor:C.border,color:C.muted}}>
            Aa<ChevronDown size={9}/>
          </button>
          {showFontSize&&(
            <div className="absolute top-9 left-0 z-50 p-2 rounded-xl border shadow-lg grid grid-cols-4 gap-1"
                 style={{backgroundColor:C.surface,borderColor:C.border,minWidth:160}}>
              {[10,12,13,14,15,16,18,20,24,28,32,36].map(s=>(
                <button key={s} onMouseDown={e=>{e.preventDefault();exec('fontSize','7');setShowFontSize(false)}}
                  className="px-1.5 py-1 rounded-lg text-[11px] font-bold hover:opacity-70"
                  style={{backgroundColor:C.bg,color:C.dark}}>{s}</button>
              ))}
            </div>
          )}
        </div>

        {/* Color */}
        <div className="relative">
          <button onMouseDown={e=>{e.preventDefault();setShowColorPick(s=>!s);setShowFontSize(false)}}
            className="flex items-center gap-0.5 px-2 h-7 rounded-md hover:opacity-70">
            <span className="font-black text-[13px]" style={{color:C.dark}}>A</span>
            <div className="w-4 h-1 rounded-full" style={{backgroundColor:C.lime}}/>
            <ChevronDown size={9} style={{color:C.muted}}/>
          </button>
          {showColorPick&&(
            <div className="absolute top-9 left-0 z-50 p-2 rounded-xl border shadow-lg"
                 style={{backgroundColor:C.surface,borderColor:C.border}}>
              <div className="grid grid-cols-6 gap-1">
                {['#1a2410','#dc2626','#d97706','#16a34a','#2563eb','#7c3aed','#8fff00','#ff6b6b','#fbbf24','#34d399','#60a5fa','#a78bfa','#ffffff','#f3f4f6','#e5e7eb','#9ca3af','#4b5563','#111827'].map(col=>(
                  <button key={col} onMouseDown={e=>{e.preventDefault();exec('foreColor',col);setShowColorPick(false)}}
                    className="w-6 h-6 rounded-md border hover:scale-110 transition-all"
                    style={{backgroundColor:col,borderColor:C.border}}/>
                ))}
              </div>
            </div>
          )}
        </div>
        <TDiv/>

        {/* Align */}
        <ToolBtn icon={AlignLeft} title="Left" onClick={()=>exec('justifyLeft')}/>
        <ToolBtn icon={AlignCenter} title="Center" onClick={()=>exec('justifyCenter')}/>
        <ToolBtn icon={AlignRight} title="Right" onClick={()=>exec('justifyRight')}/>
        <TDiv/>

        {/* Lists */}
        <ToolBtn icon={List} title="Bullet list" onClick={()=>exec('insertUnorderedList')}/>
        <ToolBtn icon={ListOrdered} title="Numbered list" onClick={()=>exec('insertOrderedList')}/>
        <TDiv/>

        {/* Link */}
        <div className="relative">
          <ToolBtn icon={Link} title="Link" onClick={openLinkInput}/>
          {showLinkInput&&(
            <div className="absolute top-9 left-0 z-50 p-3 rounded-xl border shadow-lg"
                 style={{backgroundColor:C.surface,borderColor:C.border,minWidth:280}}>
              <p className="text-[10px] mb-2" style={{color:C.muted}}>
                {savedSelection.current&&savedSelection.current.toString().trim() ? '🔗 Linking selected text' : 'Tip: Select text first to make it a link'}
              </p>
              <div className="flex gap-1">
                <input value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&insertLink()}
                  placeholder="https://..." autoFocus className="flex-1 h-8 px-2 rounded-lg border text-[11px] outline-none"
                  style={{borderColor:C.border,color:C.dark}}/>
                <button onMouseDown={e=>{e.preventDefault();insertLink()}} className="px-3 h-8 rounded-lg text-[11px] font-bold"
                  style={{backgroundColor:C.lime,color:C.dark}}>Add</button>
              </div>
              <button onMouseDown={e=>{e.preventDefault();exec('unlink')}} className="text-[10px] mt-2 hover:opacity-70" style={{color:C.red}}>
                Remove link from selection
              </button>
            </div>
          )}
        </div>

        {/* Image upload */}
        <label title="Insert image" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5 cursor-pointer"
               style={{color:C.muted}}>
          <Image size={13}/>
          <input type="file" accept="image/*" className="hidden" onChange={uploadImage}/>
        </label>
        <TDiv/>

        <ToolBtn icon={Undo} title="Undo" onClick={()=>exec('undo')}/>
        <ToolBtn icon={Redo} title="Redo" onClick={()=>exec('redo')}/>
        <TDiv/>

        <ToolBtn icon={Highlighter} title="Highlight" onClick={()=>exec('backColor','#8fff00')}/>
        <ToolBtn icon={Superscript} title="Superscript" onClick={()=>exec('superscript')}/>
        <ToolBtn icon={Subscript} title="Subscript" onClick={()=>exec('subscript')}/>
        <button onMouseDown={e=>{e.preventDefault();exec('insertHorizontalRule')}}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5" style={{color:C.muted}}>
          <Minus size={13}/>
        </button>
        <ToolBtn icon={X} title="Clear format" onClick={()=>{editorRef.current?.focus();document.execCommand('removeFormat')}}/>
        <button onMouseDown={e=>{e.preventDefault()}} title="Plain paste"
          className="flex items-center gap-1 px-2 h-7 rounded-md text-[10px] font-bold border hover:opacity-70"
          style={{color:C.muted,borderColor:C.border}}>
          <Clipboard size={11}/>Plain
        </button>
        <TDiv/>

        {/* Table */}
        <div className="relative">
          <ToolBtn icon={Table} title="Table" onClick={()=>{setShowTableInput(s=>!s);setShowEmbedInput(false)}}/>
          {showTableInput&&(
            <div className="absolute top-9 left-0 z-50 p-3 rounded-xl border shadow-lg"
                 style={{backgroundColor:C.surface,borderColor:C.border,minWidth:200}}>
              <p className="text-[10px] font-black tracking-wider mb-2" style={{color:C.muted}}>INSERT TABLE</p>
              <div className="flex gap-2 mb-2">
                <div><p className="text-[9px] mb-1" style={{color:C.muted}}>ROWS</p>
                  <input type="number" value={tableRows} onChange={e=>setTableRows(parseInt(e.target.value)||2)} min={2} max={10}
                    className="w-16 h-7 px-2 rounded-lg border text-[11px] outline-none" style={{borderColor:C.border,color:C.dark}}/></div>
                <div><p className="text-[9px] mb-1" style={{color:C.muted}}>COLS</p>
                  <input type="number" value={tableCols} onChange={e=>setTableCols(parseInt(e.target.value)||2)} min={2} max={8}
                    className="w-16 h-7 px-2 rounded-lg border text-[11px] outline-none" style={{borderColor:C.border,color:C.dark}}/></div>
              </div>
              <button onMouseDown={e=>{e.preventDefault();insertTable()}} className="w-full h-8 rounded-xl text-[11px] font-bold"
                style={{backgroundColor:C.lime,color:C.dark}}>Insert {tableRows}x{tableCols}</button>
            </div>
          )}
        </div>

        {/* Embed */}
        <div className="relative">
          <ToolBtn icon={Video} title="Embed" onClick={()=>{setShowEmbedInput(s=>!s);setShowTableInput(false)}}/>
          {showEmbedInput&&(
            <div className="absolute top-9 left-0 z-50 p-3 rounded-xl border shadow-lg"
                 style={{backgroundColor:C.surface,borderColor:C.border,minWidth:280}}>
              <p className="text-[10px] font-black tracking-wider mb-2" style={{color:C.muted}}>EMBED VIDEO / URL</p>
              <input value={embedUrl} onChange={e=>setEmbedUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&insertEmbed()}
                placeholder="YouTube URL or embed URL..." autoFocus
                className="w-full h-8 px-3 rounded-xl border text-[12px] outline-none mb-2" style={{borderColor:C.border,color:C.dark}}/>
              <button onMouseDown={e=>{e.preventDefault();insertEmbed()}} className="w-full h-8 rounded-xl text-[11px] font-bold"
                style={{backgroundColor:C.lime,color:C.dark}}>Embed</button>
            </div>
          )}
        </div>

        <ToolBtn icon={Download} title="Export PDF" onClick={exportPDF}/>
        <TDiv/>
        <ToolBtn icon={ChevronsRight} title="Indent" onClick={()=>exec('indent')}/>
        <ToolBtn icon={ChevronsLeft} title="Outdent" onClick={()=>exec('outdent')}/>
        <TDiv/>

        <button onMouseDown={e=>{e.preventDefault();pasteFromWord()}}
          className="flex items-center gap-1 px-2 h-7 rounded-md hover:opacity-80 text-[10px] font-bold border"
          style={{color:C.muted,borderColor:C.border,backgroundColor:C.surface}}>
          <FileText size={11}/>Word
        </button>
        <button onMouseDown={e=>{e.preventDefault();setSpellCheckOn(s=>!s)}}
          className="flex items-center gap-1 px-2 h-7 rounded-md hover:opacity-80 text-[10px] font-bold border"
          style={{color:spellCheckOn?C.limeDeep:C.muted,borderColor:spellCheckOn?C.lime:C.border,backgroundColor:spellCheckOn?C.limeTint:C.surface}}>
          <SpellCheck size={11}/>ABC
        </button>
        <button onMouseDown={e=>{e.preventDefault();insertPageBreak()}}
          className="flex items-center gap-1 px-2 h-7 rounded-md hover:opacity-80 text-[10px] font-bold border"
          style={{color:C.muted,borderColor:C.border,backgroundColor:C.surface}}>
          <Scissors size={11}/>Break
        </button>
      </div>

      {/* Word count bar */}
      <div className="px-4 py-1.5 border-b flex items-center gap-3" style={{backgroundColor:C.bg,borderColor:C.border}}>
        <span className="text-[10px] font-bold shrink-0" style={{color:C.muted}}>{wordCount}/{wordGoal} words</span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{backgroundColor:C.border}}>
          <div className="h-full rounded-full transition-all"
               style={{width:`${Math.min((wordCount/wordGoal)*100,100)}%`,backgroundColor:wordCount>=wordGoal?C.green:wordCount>=wordGoal*0.7?C.amber:C.lime}}/>
        </div>
        <span className="text-[10px] shrink-0" style={{color:C.muted}}>{charCount} chars</span>
        <span className="text-[10px] shrink-0" style={{color:C.muted}}>{readingTime} min read</span>
        <div className="relative">
          <button onClick={()=>setShowWordGoal(s=>!s)} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md hover:opacity-70"
            style={{color:C.muted,border:`1px solid ${C.border}`}}>Goal</button>
          {showWordGoal&&(
            <div className="absolute top-7 right-0 z-50 p-3 rounded-xl border shadow-lg"
                 style={{backgroundColor:C.surface,borderColor:C.border,minWidth:180}}>
              <p className="text-[10px] font-black tracking-wider mb-2" style={{color:C.muted}}>SET WORD GOAL</p>
              <div className="grid grid-cols-3 gap-1 mb-2">
                {[500,1000,1500,2000,2500,3000].map(g=>(
                  <button key={g} onClick={()=>{setWordGoal(g);setShowWordGoal(false)}}
                    className="py-1 rounded-lg text-[10px] font-bold border transition-all"
                    style={{backgroundColor:wordGoal===g?C.lime:C.bg,borderColor:wordGoal===g?C.lime:C.border,color:wordGoal===g?C.dark:C.muted}}>{g}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="number" placeholder="Custom..." min={100} max={10000}
                  className="flex-1 h-7 px-2 rounded-lg border text-[11px] outline-none" style={{borderColor:C.border,color:C.dark}}
                  onKeyDown={e=>{if(e.key==='Enter'){const v=parseInt((e.target as HTMLInputElement).value);if(v>0){setWordGoal(v);setShowWordGoal(false)}}}}/>
                <span className="text-[10px] self-center" style={{color:C.muted}}>words</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SEO Blocks row */}
      <div className="border-b px-3 py-1.5 flex items-center gap-1 flex-wrap" style={{backgroundColor:C.bg,borderColor:C.border}}>
        <span className="text-[9px] font-black tracking-wider mr-1" style={{color:C.limeDeep}}>SEO BLOCKS:</span>
        {[
          {label:'FAQ Block',icon:HelpCircle,col:C.limeDeep,action:insertFAQ},
          {label:'Info Callout',icon:Lightbulb,col:C.blue,action:()=>insertCallout('info')},
          {label:'Warning',icon:AlertTriangle,col:C.amber,action:()=>insertCallout('warning')},
          {label:'How-To Step',icon:ListChecks,col:C.green,action:()=>insertHowToStep(1)},
          {label:'Calc Block',icon:Zap,col:C.blue,action:()=>insertHtml('<p>:::calculator:::</p>')},
          {label:'Pros & Cons',icon:CheckCircle,col:C.green,action:insertProsConsBlock},
          {label:'Key Takeaway',icon:Sparkles,col:C.limeDeep,action:insertKeyTakeaway},
          {label:'Stat Box',icon:BarChart2,col:C.dark,action:insertStatBox},
          {label:'Product',icon:ShoppingBag,col:C.blue,action:insertProductShowcase},
          {label:'Compare',icon:Columns,col:C.amber,action:insertComparisonTable},
        ].map(({label,icon:Icon,col,action})=>(
          <button key={label} onMouseDown={e=>{e.preventDefault();action()}}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border hover:opacity-80"
            style={{backgroundColor:'#fff',borderColor:col,color:col}}>
            <Icon size={11}/>{label}
          </button>
        ))}
        <TDiv/>
        <span className="text-[9px] font-black tracking-wider mr-0.5" style={{color:C.muted}}>CTA:</span>
        {(['free','starter','growth'] as const).map(tier=>(
          <button key={tier} onMouseDown={e=>{e.preventDefault();insertCTA(tier)}}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize"
            style={{backgroundColor:C.lime,color:C.dark}}>
            <Zap size={10}/>{tier}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div ref={editorRef} contentEditable suppressContentEditableWarning spellCheck={spellCheckOn}
        data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false"
        onInput={updateStats} onKeyUp={updateStats} onKeyDown={handleKeyDown} onClick={handleEditorClick}
        className="flex-1 p-5 outline-none overflow-y-auto"
        style={{minHeight:focusMode?'calc(100vh - 200px)':minHeight,fontSize:15,lineHeight:1.8,color:C.dark,fontFamily:'Inter, sans-serif'}}
        data-placeholder={placeholder}/>

      {/* Editor styles */}
      <style dangerouslySetInnerHTML={{__html:[
        '[data-placeholder]:empty:before{content:attr(data-placeholder);color:#8a9e78;pointer-events:none}',
        '[contenteditable] h1{font-size:28px;font-weight:900;margin:20px 0 10px;color:#1a2410}',
        '[contenteditable] h2{font-size:22px;font-weight:800;margin:18px 0 8px;color:#1a2410}',
        '[contenteditable] h3{font-size:17px;font-weight:700;margin:14px 0 6px;color:#1a2410}',
        '[contenteditable] p{margin:8px 0}',
        '[contenteditable] a{color:#4a8f00;text-decoration:underline;font-weight:500}',
        '[contenteditable] blockquote{border-left:3px solid #8fff00;padding:8px 16px;margin:12px 0;color:#4a8f00;font-style:italic}',
        '[contenteditable] pre{background:#f7f9f5;border:1px solid #e8ede2;border-radius:8px;padding:12px 16px;font-family:monospace;font-size:13px;overflow-x:auto}',
        '[contenteditable] table{border-collapse:collapse;width:100%;margin:16px 0}',
        '[contenteditable] th,td{border:1px solid #e8ede2;padding:8px 12px;font-size:13px}',
        '[contenteditable] th{background:#f7f9f5;font-weight:700}',
        '[contenteditable] ul{list-style:disc;padding-left:24px;margin:8px 0}',
        '[contenteditable] ol{list-style:decimal;padding-left:24px;margin:8px 0}',
        'div[style*="dashed"]{cursor:pointer;transition:all 0.2s ease}',
        'div[style*="dashed"] *{pointer-events:none}',
      ].join(' ')}}/>

      {/* Image toolbar portal */}
      {showImgToolbar&&selectedImg&&typeof window!=='undefined'&&createPortal(
        <div ref={toolbarRef2} className="flex flex-col gap-1"
             style={{position:'fixed',top:imgToolbarPos.top-window.scrollY,left:imgToolbarPos.left-window.scrollX,zIndex:99999,cursor:isDraggingBar?'grabbing':'default'}}>
          <div onMouseDown={onToolbarMouseDown} className="flex items-center gap-1 px-2 py-1.5 rounded-xl shadow-2xl border flex-wrap"
               style={{backgroundColor:'#1a2410',borderColor:'#2d4020',maxWidth:480,cursor:isDraggingBar?'grabbing':'grab',userSelect:'none'}}>
            <div className="px-1 mr-1" style={{color:'rgba(255,255,255,0.3)',fontSize:16}}>⠿</div>

            <span className="text-[9px] font-black tracking-wider px-1" style={{color:'rgba(255,255,255,0.4)'}}>SIZE</span>
            {([['Full','full'],['½','half'],['⅓','third']] as const).map(([l,v])=>(
              <button key={v} onClick={()=>imgSetSize(v)} className="px-2 py-1 rounded-lg text-[10px] font-bold hover:opacity-80"
                style={{backgroundColor:'rgba(143,255,0,0.15)',color:'#8fff00'}}>{l}</button>
            ))}

            <div className="w-px h-4 mx-1" style={{backgroundColor:'rgba(255,255,255,0.1)'}}/>
            <span className="text-[9px] font-black tracking-wider px-1" style={{color:'rgba(255,255,255,0.4)'}}>ALIGN</span>
            {([['←','left'],['■','none'],['→','right']] as const).map(([l,v])=>(
              <button key={v} onClick={()=>imgSetFloat(v)} className="w-6 h-6 rounded-lg text-[11px] font-bold hover:opacity-80 flex items-center justify-center"
                style={{backgroundColor:'rgba(255,255,255,0.1)',color:'#fff'}}>{l}</button>
            ))}

            <div className="w-px h-4 mx-1" style={{backgroundColor:'rgba(255,255,255,0.1)'}}/>
            <span className="text-[9px] font-black tracking-wider px-1" style={{color:'rgba(255,255,255,0.4)'}}>STYLE</span>
            <div className="relative">
              <button onClick={()=>setShowImgStyleDrop(s=>!s)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold hover:opacity-80"
                style={{backgroundColor:'rgba(255,255,255,0.1)',color:'#fff',minWidth:80}}>
                {currentImgStyle}<ChevronDown size={9}/>
              </button>
              {showImgStyleDrop&&(
                <div className="absolute top-9 left-0 rounded-xl border shadow-2xl overflow-hidden"
                     style={{backgroundColor:'#1a2410',borderColor:'#3d5a2c',minWidth:240,zIndex:100000}}>
                  <div className="grid grid-cols-3">
                  {imgStyles.map(({name})=>{
                    const r=name==='Rounded'?'10px':name==='Circle'?'50%':name==='Top Round'?'8px 8px 0 0':name==='Bottom Round'?'0 0 8px 8px':name==='Left Round'?'8px 0 0 8px':name==='One Corner'?'16px 0 0 0':name==='Polaroid'?'2px':name==='Vintage'?'2px':'3px'
                    const sh=name==='Shadow'?'0 4px 10px rgba(0,0,0,0.4)':name==='Neon'?'0 0 0 2px #8fff00,0 0 8px rgba(143,255,0,0.6)':name==='Polaroid'||name==='Vintage'?'0 3px 10px rgba(0,0,0,0.4)':name==='Double Border'?'0 0 0 2px #e8ede2':'none'
                    const b=name==='Dark Frame'?'2px solid #8fff00':name==='Double Border'?'2px solid #1a2410':name==='Vintage'?'3px solid #fff':'none'
                    const tr=name==='Tilt Left'?'rotate(-6deg)':name==='Tilt Right'?'rotate(6deg)':name==='Vintage'?'rotate(-3deg)':'none'
                    const fi=name==='Grayscale'?'grayscale(100%)':name==='Sepia'||name==='Vintage'?'sepia(80%)':'none'
                    return(
                    <button key={name} onClick={()=>applyImgStyle(name)}
                      className="flex flex-col items-center gap-1 px-2 py-2 hover:opacity-80"
                      style={{backgroundColor:currentImgStyle===name?'rgba(143,255,0,0.1)':'transparent'}}>
                      <div style={{width:36,height:24,flexShrink:0,borderRadius:r,overflow:'hidden',background:'#4a8f00',border:b,boxShadow:sh,transform:tr,filter:fi,padding:name==='Polaroid'?'2px 2px 8px':''}}/>
                      <p className="text-[9px] font-bold text-center whitespace-nowrap" style={{color:currentImgStyle===name?'#8fff00':'rgba(255,255,255,0.8)'}}>{name}</p>
                    </button>
                  )})}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-4 mx-1" style={{backgroundColor:'rgba(255,255,255,0.1)'}}/>
            {['#8fff00','#3b82f6','#f59e0b','#ef4444','transparent'].map(col=>(
              <button key={col} onClick={()=>imgHighlight(col)} title={col==='transparent'?'Remove':'Highlight'}
                className="w-5 h-5 rounded-full border hover:scale-110 transition-all flex items-center justify-center"
                style={{backgroundColor:col==='transparent'?'#374151':col,borderColor:'rgba(255,255,255,0.2)'}}>
                {col==='transparent'&&<X size={8} color="#fff"/>}
              </button>
            ))}

            <div className="w-px h-4 mx-1" style={{backgroundColor:'rgba(255,255,255,0.1)'}}/>
            <button onClick={()=>setShowAltInput(s=>!s)} title="Alt text"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
              style={{backgroundColor:showAltInput?'#8fff00':'rgba(255,255,255,0.1)',color:showAltInput?'#1a2410':'#fff'}}>
              <FileText size={13}/>
            </button>
            <button onClick={()=>setShowLinkOnImg(s=>!s)} title="Add link"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
              style={{backgroundColor:showLinkOnImg?'#8fff00':'rgba(255,255,255,0.1)',color:showLinkOnImg?'#1a2410':'#fff'}}>
              <Link size={13}/>
            </button>
            <button onClick={imgReplace} title="Replace image"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
              style={{backgroundColor:'rgba(255,255,255,0.1)',color:'#fff'}}>
              <Redo size={13}/>
            </button>
            <button onClick={openAnnotator} title="Annotate image"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold hover:opacity-80"
              style={{backgroundColor:'rgba(143,255,0,0.2)',color:'#8fff00'}}>
              <Highlighter size={12}/>Anno
            </button>
            <button onClick={imgDelete} title="Delete image"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
              style={{backgroundColor:'rgba(220,38,38,0.3)',color:'#fca5a5'}}>
              <Trash2 size={13}/>
            </button>
          </div>

          {showAltInput&&(
            <div className="flex gap-1 px-2 py-2 rounded-xl shadow-lg border" style={{backgroundColor:'#1a2410',borderColor:'#2d4020'}}>
              <input value={altInputVal} onChange={e=>setAltInputVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&imgSetAlt()}
                placeholder="Alt text for SEO & accessibility..." autoFocus
                className="flex-1 h-7 px-2 rounded-lg text-[11px] outline-none"
                style={{backgroundColor:'#2d4020',color:'#fff',border:'1px solid #3d5a2c'}}/>
              <button onClick={imgSetAlt} className="px-3 h-7 rounded-lg text-[11px] font-bold"
                style={{backgroundColor:'#8fff00',color:'#1a2410'}}>Save</button>
            </div>
          )}
          {showLinkOnImg&&(
            <div className="flex gap-1 px-2 py-2 rounded-xl shadow-lg border" style={{backgroundColor:'#1a2410',borderColor:'#2d4020'}}>
              <input value={imgLinkUrl} onChange={e=>setImgLinkUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&imgAddLink()}
                placeholder="https://..." autoFocus
                className="flex-1 h-7 px-2 rounded-lg text-[11px] outline-none"
                style={{backgroundColor:'#2d4020',color:'#fff',border:'1px solid #3d5a2c'}}/>
              <button onClick={imgAddLink} className="px-3 h-7 rounded-lg text-[11px] font-bold"
                style={{backgroundColor:'#8fff00',color:'#1a2410'}}>Add</button>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Corner radius handle — tracks image corner via RAF */}
      {showCornerHandle&&selectedImg&&typeof window!=='undefined'&&createPortal(
        <div style={{position:'fixed',top:cornerHandlePos.top,left:cornerHandlePos.left,zIndex:99998,pointerEvents:'none'}}>
          {/* Radius indicator lines */}
          <div style={{position:'absolute',top:0,left:0,width:cornerRadius,height:2,backgroundColor:'#8fff00',opacity:0.7}}/>
          <div style={{position:'absolute',top:0,left:0,width:2,height:cornerRadius,backgroundColor:'#8fff00',opacity:0.7}}/>
          {/* Drag handle dot */}
          <div onMouseDown={onCornerHandleMouseDown}
               style={{position:'absolute',top:Math.max(0,cornerRadius-6),left:Math.max(0,cornerRadius-6),width:14,height:14,borderRadius:'50%',backgroundColor:'#8fff00',border:'2px solid #1a2410',cursor:'ew-resize',pointerEvents:'all',boxShadow:'0 2px 8px rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:4,height:4,borderRadius:'50%',backgroundColor:'#1a2410'}}/>
          </div>
          {/* Radius label */}
          <div style={{position:'absolute',top:Math.max(0,cornerRadius)+4,left:Math.max(0,cornerRadius)+4,backgroundColor:'#1a2410',color:'#8fff00',fontSize:9,fontWeight:700,padding:'2px 5px',borderRadius:4,pointerEvents:'none',whiteSpace:'nowrap'}}>
            {cornerRadius}px
          </div>
        </div>,
        document.body
      )}

      {/* Annotation Overlay — appears over the image with left sidebar toolbar */}
      {showAnnotator&&annoImg&&typeof window!=='undefined'&&createPortal(
        <div style={{position:'absolute',top:annoRect.top-window.scrollY,left:annoRect.left-window.scrollX,width:annoRect.width,height:annoRect.height,zIndex:99990}}>

          {/* Canvas over image */}
          <div className="relative w-full h-full">
            <canvas ref={annoCanvasRef}
              onMouseDown={annoMouseDown} onMouseMove={annoMouseMove} onMouseUp={annoMouseUp} onMouseLeave={annoMouseUp}
              tabIndex={0}
              onKeyDown={e=>{
                if(e.ctrlKey&&e.key==='z'){e.preventDefault();annoUndo()}
                if(e.ctrlKey&&e.key==='y'){e.preventDefault();annoRedo()}
                if(e.key==='Delete'&&annoSelectedObj>=0){annoObjects.current.splice(annoSelectedObj,1);setAnnoSelectedObj(-1);redrawCanvas();annoSaveHistory()}
              }}
              style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',cursor:annoTool==='select'?'move':annoTool==='text'?'text':'crosshair',outline:'none',borderRadius:4}}/>

            {/* Rich Text Input Panel */}
            {annoTextPos&&(
              <div style={{
                position:'fixed',
                left:Math.min(annoRect.left-window.scrollX+annoTextPos.x*(annoRect.width/(annoCanvasRef.current?.width||1)),window.innerWidth-340),
                top:Math.min(annoRect.top-window.scrollY+annoTextPos.y*(annoRect.height/(annoCanvasRef.current?.height||1))+20,window.innerHeight-220),
                zIndex:100001,width:320
              }}>
                <div className="rounded-2xl border shadow-2xl overflow-hidden" style={{backgroundColor:'#1a2410',borderColor:'#3d5a2c'}}>
                  {/* Text input */}
                  <textarea autoFocus value={annoTextVal}
                    onChange={e=>{
                      setAnnoTextVal(e.target.value)
                      // Live preview on canvas
                      if(!annoCanvasRef.current||!annoTextPos)return
                      const canvas=annoCanvasRef.current
                      const ctx=canvas.getContext('2d')!
                      if(annoHistory.current[annoHistoryIdx.current])ctx.putImageData(annoHistory.current[annoHistoryIdx.current],0,0)
                      annoObjects.current.forEach(o=>drawObject(ctx,o))
                      if(e.target.value.trim()){
                        drawObject(ctx,{type:'text',x1:annoTextPos.x,y1:annoTextPos.y,text:e.target.value,color:annoColor,size:annoSize,fontSize:annoTextSize,bold:annoTextBold,italic:annoTextItalic,bg:annoTextBg})
                      }
                    }}
                    onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();annoAddText()}if(e.key==='Escape'){setAnnoTextPos(null);setAnnoTextVal('')}}}
                    placeholder="Type your text here..."
                    rows={2}
                    className="w-full px-4 pt-3 pb-2 outline-none resize-none text-[15px] font-bold bg-transparent"
                    style={{color:annoColor,caretColor:annoColor,fontFamily:'Inter,sans-serif',borderBottom:'1px solid #2d4020'}}/>

                  {/* Controls */}
                  <div className="px-3 py-2 flex items-center gap-2 flex-wrap">
                    {/* Font size */}
                    <div className="flex items-center gap-1">
                      {(['S','M','L','XL'] as const).map(s=>(
                        <button key={s} onClick={()=>setAnnoTextSize(s)}
                          className="px-2 py-0.5 rounded-md text-[10px] font-black transition-all"
                          style={{backgroundColor:annoTextSize===s?'#8fff00':'rgba(255,255,255,0.08)',color:annoTextSize===s?'#1a2410':'rgba(255,255,255,0.6)'}}>
                          {s}
                        </button>
                      ))}
                    </div>

                    <div className="w-px h-4" style={{backgroundColor:'rgba(255,255,255,0.1)'}}/>

                    {/* Bold / Italic */}
                    <button onClick={()=>setAnnoTextBold(b=>!b)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-black transition-all"
                      style={{backgroundColor:annoTextBold?'#8fff00':'rgba(255,255,255,0.08)',color:annoTextBold?'#1a2410':'rgba(255,255,255,0.6)'}}>
                      B
                    </button>
                    <button onClick={()=>setAnnoTextItalic(i=>!i)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-black italic transition-all"
                      style={{backgroundColor:annoTextItalic?'#8fff00':'rgba(255,255,255,0.08)',color:annoTextItalic?'#1a2410':'rgba(255,255,255,0.6)'}}>
                      I
                    </button>

                    <div className="w-px h-4" style={{backgroundColor:'rgba(255,255,255,0.1)'}}/>

                    {/* Background */}
                    {([['none','No bg'],['dark','Dark'],['light','Light']] as const).map(([v,l])=>(
                      <button key={v} onClick={()=>setAnnoTextBg(v)}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold transition-all"
                        style={{backgroundColor:annoTextBg===v?'#8fff00':'rgba(255,255,255,0.08)',color:annoTextBg===v?'#1a2410':'rgba(255,255,255,0.6)'}}>
                        {l}
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="px-3 pb-3 flex items-center gap-2">
                    <p className="text-[10px] flex-1" style={{color:'rgba(255,255,255,0.3)'}}>Enter to place • Shift+Enter newline • Esc cancel</p>
                    <button onClick={()=>{setAnnoTextPos(null);setAnnoTextVal('')}}
                      className="px-3 py-1 rounded-lg text-[11px] font-bold"
                      style={{backgroundColor:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.5)'}}>Cancel</button>
                    <button onClick={annoAddText} disabled={!annoTextVal.trim()}
                      className="px-3 py-1 rounded-lg text-[11px] font-bold"
                      style={{backgroundColor:annoTextVal.trim()?'#8fff00':'rgba(255,255,255,0.1)',color:annoTextVal.trim()?'#1a2410':'rgba(255,255,255,0.3)'}}>Place</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Left vertical toolbar */}
          <div className="flex flex-col items-center gap-1.5 py-2 px-1.5 rounded-xl shadow-2xl"
               style={{position:'absolute',top:'50%',left:-52,transform:'translateY(-50%)',backgroundColor:'#1a2410',border:'1px solid #2d4020',minWidth:44}}>

            {/* Tools */}
            {([
              {id:'select',icon:'⊹',title:'Move'},
              {id:'arrow',icon:'→',title:'Arrow'},
              {id:'line',icon:'╱',title:'Line'},
              {id:'rect',icon:'□',title:'Box'},
              {id:'circle',icon:'○',title:'Circle'},
              {id:'pen',icon:'✏',title:'Pen'},
              {id:'text',icon:'T',title:'Text'},
              {id:'blur',icon:'◫',title:'Blur'},
            ] as {id:typeof annoTool,icon:string,title:string}[]).map(({id,icon,title})=>(
              <button key={id} onClick={()=>setAnnoTool(id)} title={title}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-bold hover:opacity-80 transition-all"
                style={{backgroundColor:annoTool===id?'#8fff00':'rgba(255,255,255,0.08)',color:annoTool===id?'#1a2410':'rgba(255,255,255,0.7)'}}>
                {icon}
              </button>
            ))}

            <div className="w-5 h-px my-0.5" style={{backgroundColor:'rgba(255,255,255,0.1)'}}/>

            {/* Colors */}
            {['#8fff00','#ffffff','#ff4444','#3b82f6','#f59e0b','#000000'].map(col=>(
              <button key={col} onClick={()=>setAnnoColor(col)} title={col}
                className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-all"
                style={{backgroundColor:col,borderColor:annoColor===col?'#fff':'rgba(255,255,255,0.2)'}}/>
            ))}

            <div className="w-5 h-px my-0.5" style={{backgroundColor:'rgba(255,255,255,0.1)'}}/>

            {/* Size */}
            {[1,3,6,10].map(s=>(
              <button key={s} onClick={()=>setAnnoSize(s)} title={`Size ${s}`}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80"
                style={{backgroundColor:annoSize===s?'rgba(143,255,0,0.2)':'rgba(255,255,255,0.05)'}}>
                <div className="rounded-full" style={{width:s*1.5+2,height:s*1.5+2,backgroundColor:annoColor}}/>
              </button>
            ))}

            <div className="w-5 h-px my-0.5" style={{backgroundColor:'rgba(255,255,255,0.1)'}}/>

            {/* Undo / Redo */}
            <button onClick={annoUndo} title="Undo (Ctrl+Z)"
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80"
              style={{backgroundColor:'rgba(255,255,255,0.08)'}}>
              <Undo size={13} style={{color:'rgba(255,255,255,0.7)'}}/>
            </button>
            <button onClick={annoRedo} title="Redo (Ctrl+Y)"
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80"
              style={{backgroundColor:'rgba(255,255,255,0.08)'}}>
              <Redo size={13} style={{color:'rgba(255,255,255,0.7)'}}/>
            </button>

            <div className="w-5 h-px my-0.5" style={{backgroundColor:'rgba(255,255,255,0.1)'}}/>

            {/* Save / Close */}
            <button onClick={annoSave} title="Save" className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80"
              style={{backgroundColor:'#8fff00',color:'#1a2410'}}>
              <CheckCircle size={14}/>
            </button>
            <button onClick={()=>{setShowAnnotator(false);setAnnoImg(null)}} title="Cancel"
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80"
              style={{backgroundColor:'rgba(220,38,38,0.3)',color:'#fca5a5'}}>
              <X size={13}/>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Image picker modal */}
      {showImgPicker&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backgroundColor:'rgba(0,0,0,0.4)'}}
             onClick={()=>setShowImgPicker(false)}>
          <div className="rounded-2xl border shadow-2xl p-5" style={{backgroundColor:'#fff',borderColor:C.border,width:360}}
               onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-black" style={{color:C.dark}}>Add Image</p>
              <button onClick={()=>setShowImgPicker(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70"
                style={{backgroundColor:C.bg}}><X size={13} style={{color:C.muted}}/></button>
            </div>
            <label className="flex flex-col items-center justify-center gap-2 w-full h-24 rounded-xl border-2 border-dashed cursor-pointer hover:opacity-80 mb-3"
                   style={{borderColor:C.lime,backgroundColor:C.limeTint}}>
              {uploading?<p className="text-[12px] font-bold" style={{color:C.limeDeep}}>Uploading...</p>:<>
                <svg width="24" height="24" fill="none" stroke={C.limeDeep} strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p className="text-[12px] font-bold" style={{color:C.limeDeep}}>Click to Upload</p>
                <p className="text-[10px]" style={{color:C.muted}}>PNG, JPG, WebP</p>
              </>}
              <input type="file" accept="image/*" className="hidden" onChange={uploadImageToPlaceholder}/>
            </label>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px" style={{backgroundColor:C.border}}/>
              <span className="text-[10px] font-bold" style={{color:C.muted}}>OR</span>
              <div className="flex-1 h-px" style={{backgroundColor:C.border}}/>
            </div>
            <div className="flex gap-2">
              <input value={imgPickerUrl} onChange={e=>setImgPickerUrl(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&applyImageToPlaceholder(imgPickerUrl)}
                placeholder="Paste image URL..." autoFocus
                className="flex-1 h-9 px-3 rounded-xl border text-[12px] outline-none"
                style={{borderColor:imgPickerUrl?C.lime:C.border,color:C.dark}}/>
              <button onClick={()=>applyImageToPlaceholder(imgPickerUrl)} disabled={!imgPickerUrl}
                className="px-4 h-9 rounded-xl text-[12px] font-bold"
                style={{backgroundColor:imgPickerUrl?C.lime:C.border,color:C.dark}}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'
// components/EditableSection.tsx
import React from 'react'
// Wraps any section to make it editable in the Page Editor
import { useEffect, useRef, useState } from 'react'
import { Edit2 } from 'lucide-react'

interface Field {
  key:   string
  label: string
  value: string
  type:  'text' | 'textarea'
}

interface EditableSectionProps {
  sectionId: string  // e.g. "hero" or "hero.headline"
  label:     string  // human readable label
  fields:    Field[]
  children:  React.ReactNode
}

export default function EditableSection({ sectionId, label, fields, children }: EditableSectionProps) {
  const ref                       = useRef<HTMLDivElement>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isHovered, setIsHovered]   = useState(false)
  const [liveValues, setLiveValues] = useState<Record<string, string>>({})

  useEffect(() => {
    // Check if we're in edit mode (loaded in iframe with ?edit=true)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setIsEditMode(params.get('edit') === 'true')
    }
  }, [])

  useEffect(() => {
    if (!isEditMode) return

    // Tell parent we're ready
    window.parent.postMessage({ type: 'RIAZIFY_PAGE_READY' }, '*')

    // Listen for live updates from admin
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'RIAZIFY_LIVE_UPDATE' && e.data.sectionId === sectionId) {
        setLiveValues(prev => ({ ...prev, [e.data.key]: e.data.value }))
      }
      if (e.data?.type === 'RIAZIFY_RESET_SECTION' && e.data.sectionId === sectionId) {
        setLiveValues({})
      }
      if (e.data?.type === 'RIAZIFY_RESTORE_CHANGES') {
        // Restore previously saved changes
        const changes = e.data.changes ?? {}
        const myChanges: Record<string, string> = {}
        for (const [key, value] of Object.entries(changes)) {
          if (key.startsWith(sectionId + '.')) {
            const fieldKey = key.replace(sectionId + '.', '')
            myChanges[fieldKey] = value as string
          }
        }
        if (Object.keys(myChanges).length > 0) {
          setLiveValues(myChanges)
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [isEditMode, sectionId])

  function handleClick(e: React.MouseEvent) {
    if (!isEditMode) return
    e.stopPropagation()
    // Send click to parent admin
    const fieldsWithLiveValues = fields.map(f => ({
      ...f,
      value: liveValues[f.key] ?? f.value
    }))
    window.parent.postMessage({
      type:      'RIAZIFY_EDIT_CLICK',
      sectionId,
      label,
      fields:    fieldsWithLiveValues,
    }, '*')
  }

  // Get display value (live update overrides original)
  function get(key: string, defaultVal: string) {
    return liveValues[key] ?? defaultVal
  }

  if (!isEditMode) {
    return <div>{children}</div>
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position:  'relative',
        outline:   isHovered ? '2px solid #8fff00' : '2px solid transparent',
        outlineOffset: 2,
        cursor:    'pointer',
        transition: 'outline-color 0.15s ease',
        borderRadius: 4,
      }}>
      {/* Edit badge */}
      {isHovered && (
        <div style={{
          position:        'absolute',
          top:             -1,
          left:            -1,
          backgroundColor: '#8fff00',
          color:           '#1a2410',
          fontSize:        11,
          fontWeight:      700,
          padding:         '3px 8px 3px 6px',
          borderRadius:    '4px 0 4px 0',
          display:         'flex',
          alignItems:      'center',
          gap:             4,
          zIndex:          9999,
          whiteSpace:      'nowrap',
          fontFamily:      'Inter, sans-serif',
          pointerEvents:   'none',
        }}>
          <Edit2 size={10}/>
          {label}
        </div>
      )}
      {children}
    </div>
  )
}

// Hook to get live value in edit mode
export function useEditableValue(sectionId: string, fieldKey: string, defaultValue: string) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('edit') !== 'true') return

    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'RIAZIFY_LIVE_UPDATE' &&
          e.data.sectionId === sectionId &&
          e.data.key === fieldKey) {
        setValue(e.data.value)
      }
      if (e.data?.type === 'RIAZIFY_RESET_SECTION' && e.data.sectionId === sectionId) {
        setValue(defaultValue)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [sectionId, fieldKey, defaultValue])

  return value
}
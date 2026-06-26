'use client'
// components/ui/UserAvatar.tsx

import { useState } from 'react'

interface UserAvatarProps {
  name:       string
  userId?:    string
  email?:     string
  gender?:    string
  photoUrl?:  string | null
  avatarStyle?: string
  size?:      number
  className?: string
}

const AVATAR_COLORS = [
  { bg: '#8fff00', text: '#0a0d08' },
  { bg: '#0ea5e9', text: '#ffffff' },
  { bg: '#8b5cf6', text: '#ffffff' },
  { bg: '#f97316', text: '#ffffff' },
  { bg: '#ec4899', text: '#ffffff' },
  { bg: '#14b8a6', text: '#ffffff' },
  { bg: '#ef4444', text: '#ffffff' },
  { bg: '#6366f1', text: '#ffffff' },
]

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % AVATAR_COLORS.length
}

function getInitials(name: string): string {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.length >= 2 ? name.substring(0, 2).toUpperCase() : name[0].toUpperCase()
}

export default function UserAvatar({
  name,
  userId,
  email,
  gender = 'Unspecified',
  photoUrl,
  avatarStyle = 'avataaars',
  size = 40,
  className = '',
}: UserAvatarProps) {
  const [photoError,    setPhotoError]    = useState(false)
  const [dicebearError, setDicebearError] = useState(false)

  const initials    = getInitials(name || email || '?')
  const colorIdx    = hashName(name || email || '?')
  const colors      = AVATAR_COLORS[colorIdx]
  const seed        = encodeURIComponent(userId || email || name || 'default')
  const STYLE_BG: Record<string, string> = {
    'avataaars':  'b6e3f4',
    'big-smile':  'ffd5dc',
    'adventurer': 'c0aede',
    'notionists': 'd1fae5',
    'lorelei':    'ffdfbf',
    'micah':      'dbeafe',
    'open-peeps': 'fde68a',
    'personas':   'e0e7ff',
  }
  const bg          = STYLE_BG[avatarStyle] ?? 'b6e3f4'
  const dicebearUrl = `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${seed}&backgroundColor=${bg}&backgroundType=solid`
  const fontSize  = Math.round(size * 0.36)

  const containerStyle: React.CSSProperties = {
    width:           size,
    height:          size,
    borderRadius:    '50%',
    overflow:        'hidden',
    flexShrink:      0,
    display:         'inline-flex',
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: colors.bg,
  }

  if (photoUrl && !photoError) {
    return (
      <div style={containerStyle} className={className}>
        <img src={photoUrl} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
          onError={() => setPhotoError(true)} />
      </div>
    )
  }

  if (!dicebearError) {
    return (
      <div style={containerStyle} className={className}>
        <img src={dicebearUrl} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
          onError={() => setDicebearError(true)} />
      </div>
    )
  }

  return (
    <div style={containerStyle} className={className}>
      <span style={{ fontFamily:'Inter,sans-serif', fontSize, fontWeight:700, color:colors.text, userSelect:'none', lineHeight:1 }}>
        {initials}
      </span>
    </div>
  )
}
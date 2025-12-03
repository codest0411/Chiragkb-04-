import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { linksAPI } from '../utils/supabase'

const STORAGE_KEY = 'portfolio-links'

const defaultLinks = {
  contact: {
    email: 'chiragbhandarkar780@gmail.com',
    phone: '+91 9632961796',
    location: 'Ugar Khurd, Belagavi',
    locationMapUrl: 'https://maps.google.com/?q=Ugar+Khurd,Belagavi',
    locationDirectionsUrl: 'https://maps.google.com/maps/dir//Ugar+Khurd,+Belagavi,+Karnataka,+India',
    locationEmbedUrl: 'https://maps.google.com/maps?q=Ugar+Khurd,+Belagavi,+Karnataka,+India&t=&z=13&ie=UTF8&iwloc=&output=embed',
    whatsappNumber: '919632961796',
    instagramHandle: 'gurub04'
  },
  social: {
    github: 'https://github.com/codest0411',
    linkedin: 'http://www.linkedin.com/in/chiragkb04',
    email: 'mailto:chiragbhandarkar780@gmail.com',
    instagram: 'https://www.instagram.com/gurub04'
  }
}

const mergeWithDefaults = (payload) => ({
  contact: { ...defaultLinks.contact, ...(payload?.contact || {}) },
  social: { ...defaultLinks.social, ...(payload?.social || {}) }
})

const parseStoredLinks = () => {
  if (typeof window === 'undefined') return defaultLinks

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultLinks

    const parsed = JSON.parse(stored)
    return mergeWithDefaults(parsed)
  } catch (error) {
    console.error('Failed to parse stored links, using defaults.', error)
    return defaultLinks
  }
}

const LinksContext = createContext()

export const LinksProvider = ({ children }) => {
  const [links, setLinks] = useState(() => parseStoredLinks())
  const hasLoadedRemote = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
  }, [links])

  useEffect(() => {
    let isMounted = true

    const fetchRemoteLinks = async () => {
      try {
        const remote = await linksAPI.getLinks()
        if (remote && isMounted) {
          setLinks(mergeWithDefaults(remote))
        }
      } catch (error) {
        console.warn('Unable to load remote links, falling back to local values.')
      } finally {
        if (isMounted) {
          hasLoadedRemote.current = true
        }
      }
    }

    fetchRemoteLinks()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (!hasLoadedRemote.current) return

    const saveRemoteLinks = async () => {
      try {
        await linksAPI.saveLinks(links)
      } catch (error) {
        console.warn('Unable to sync links to Supabase:', error.message)
      }
    }

    saveRemoteLinks()
  }, [links])

  const updateContactLinks = (updates) => {
    setLinks((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        ...updates
      }
    }))
  }

  const updateSocialLinks = (updates) => {
    setLinks((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        ...updates
      }
    }))
  }

  const resetLinks = () => setLinks(defaultLinks)

  const value = useMemo(() => ({ links, updateContactLinks, updateSocialLinks, resetLinks }), [links])

  return <LinksContext.Provider value={value}>{children}</LinksContext.Provider>
}

export const useLinks = () => {
  const context = useContext(LinksContext)
  if (!context) {
    throw new Error('useLinks must be used within a LinksProvider')
  }
  return context
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Create Supabase client with fallback for development
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if we're using placeholder values
const isUsingPlaceholders = supabaseUrl === 'https://placeholder.supabase.co'
export const isSupabaseConfigured = !isUsingPlaceholders

if (isUsingPlaceholders && import.meta.env.DEV) {
  console.warn('⚠️ Using placeholder Supabase credentials. Please set up your .env file with real Supabase credentials for full functionality.')
}

export const linksAPI = {
  async getLinks() {
    if (!isSupabaseConfigured) return null

    try {
      const { data, error } = await supabase
        .from('site_links')
        .select('contact, social')
        .eq('id', 1)
        .maybeSingle()

      if (error) {
        if (error.code === 'PGRST116' || /404/.test(error.message)) {
          return null
        }
        throw error
      }
      return data || null
    } catch (error) {
      console.warn('Unable to fetch site links from Supabase:', error.message)
      return null
    }
  },

  async saveLinks(payload) {
    if (!isSupabaseConfigured) return

    try {
      await supabase
        .from('site_links')
        .upsert({
          id: 1,
          contact: payload.contact,
          social: payload.social,
          updated_at: new Date().toISOString()
        })
    } catch (error) {
      if (error.code === 'PGRST116' || /404/.test(error.message)) {
        console.warn('site_links table was not found. Create it to enable remote link syncing.')
        return
      }
      console.warn('Unable to save site links to Supabase:', error.message)
      throw error
    }
  }
}

// Database helper functions
export const projectsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching projects:', error)
      return []
    }
    return data || []
  },

  async getByCategory(category) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(project) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

export const blogsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching blogs:', error)
      return []
    }
    return data || []
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error) throw error
    return data
  },

  async create(blog) {
    const { data, error } = await supabase
      .from('blogs')
      .insert([blog])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('blogs')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

export const experienceAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .order('start_date', { ascending: false })
    
    if (error) {
      console.error('Error fetching experience:', error)
      return []
    }
    return data || []
  },

  async create(experience) {
    const { data, error } = await supabase
      .from('experience')
      .insert([experience])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('experience')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('experience')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

export const messagesAPI = {
  async create(message) {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getAll() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }
    return data || []
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return data[0]
  }
}

export const skillsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true })
    
    if (error) {
      console.error('Error fetching skills:', error)
      return []
    }
    return data || []
  },

  async getByCategory() {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true })
    
    if (error) {
      console.error('Error fetching skills:', error)
      return []
    }
    
    // Group skills by category
    const grouped = {}
    data?.forEach(skill => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = []
      }
      grouped[skill.category].push(skill.name)
    })
    
    return Object.entries(grouped).map(([category, technologies]) => ({
      category,
      technologies,
      color: category === 'Frontend' ? 'from-blue-500 to-purple-600' :
             category === 'Backend' ? 'from-green-500 to-teal-600' :
             'from-orange-500 to-red-600'
    }))
  }
}

export const achievementsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) {
      console.error('Error fetching achievements:', error)
      return []
    }
    return data || []
  },

  async create(achievement) {
    const { data, error } = await supabase
      .from('achievements')
      .insert([achievement])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('achievements')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

export const galleryAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching gallery items:', error)
      return []
    }
    return data || []
  },

  async create(item) {
    const { data, error } = await supabase
      .from('gallery')
      .insert([item])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('gallery')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async clearFolder(folderId) {
    const { error } = await supabase
      .from('gallery')
      .update({ folder_id: null })
      .eq('folder_id', folderId)
    
    if (error) throw error
  }
}

export const galleryFoldersAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('gallery_folders')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching gallery folders:', error)
      return []
    }
    return data || []
  },

  async create(folder) {
    const { data, error } = await supabase
      .from('gallery_folders')
      .insert([folder])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('gallery_folders')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('gallery_folders')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Storage helper functions
export const storageAPI = {
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    
    if (error) throw error
    return data
  },

  async getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  },

  async deleteFile(bucket, path) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
  }
}

// Auth helper functions
export const visitorAPI = {
  async trackVisitor(visitorData) {
    const { data, error } = await supabase
      .from('visitor_stats')
      .insert([visitorData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getVisitorCount() {
    const { data, error } = await supabase
      .from('visitor_stats')
      .select('visitor_id')
    
    if (error) {
      console.error('Error fetching visitor count:', error)
      return 0
    }
    
    // Count unique visitors
    const uniqueVisitors = new Set(data?.map(visit => visit.visitor_id) || [])
    return uniqueVisitors.size
  },

  async getTodayVisitors() {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('visitor_stats')
      .select('visitor_id')
      .gte('visited_at', `${today}T00:00:00.000Z`)
      .lt('visited_at', `${today}T23:59:59.999Z`)
    
    if (error) {
      console.error('Error fetching today visitors:', error)
      return 0
    }
    
    const uniqueVisitors = new Set(data?.map(visit => visit.visitor_id) || [])
    return uniqueVisitors.size
  },

  async getVisitorByIdToday(visitorId) {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('visitor_stats')
      .select('*')
      .eq('visitor_id', visitorId)
      .gte('visited_at', `${today}T00:00:00.000Z`)
      .lt('visited_at', `${today}T23:59:59.999Z`)
      .order('visited_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching visitor by id for today:', error)
      return null
    }
    return data
  },

  async updateVisitorVisit(id, updates) {
    const { data, error } = await supabase
      .from('visitor_stats')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }
}

// Auth helper functions
// Statistics API for Home page stats
export const statisticsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('statistics')
      .select('*')
      .order('order', { ascending: true })
    
    if (error) {
      console.error('Error fetching statistics:', error)
      throw error
    }
    
    return data || []
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('statistics')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error updating statistic:', error)
      throw error
    }
    
    return data[0]
  },

  async create(statistic) {
    const { data, error } = await supabase
      .from('statistics')
      .insert([{
        ...statistic,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
    
    if (error) {
      console.error('Error creating statistic:', error)
      throw error
    }
    
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('statistics')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting statistic:', error)
      throw error
    }
  }
}

// Resume API for managing resume file (supports Full Stack & UI/UX profiles)
export const resumeAPI = {

  getDefaultResumes() {
    const base = { resume_url: '/resume.pdf', filename: 'resume.pdf', description: null }
    return {
      fullstack: { ...base },
      uiux: { ...base }
    }
  },

  getLocalResume(profile) {
    try {
      const safeProfile = profile === 'uiux' ? 'uiux' : 'fullstack'
      const prefix = safeProfile === 'uiux' ? 'uiux' : 'fullstack'
      if (typeof localStorage === 'undefined') {
        return null
      }

      // New scheme: store the exact URL (http or data:) and filename
      const storedUrl = localStorage.getItem(`resume_${prefix}_url`)
      const storedName = localStorage.getItem(`resume_${prefix}_filename`)

      if (!storedUrl || !storedName) {
        return null
      }

      return {
        resume_url: storedUrl,
        filename: storedName,
        description: null
      }
    } catch (error) {
      console.warn('Failed to load resume from localStorage for profile:', profile, error)
      return null
    }
  },

  async getAllResumes() {
    const defaults = this.getDefaultResumes()
    let fullstackFromDb = null
    let uiuxFromDb = null

    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('resume_settings')
        .select('resume_url, filename, description, fullstack_resume_url, fullstack_filename, fullstack_description, uiux_resume_url, uiux_filename, uiux_description')
        .eq('id', 1)
        .maybeSingle()

      if (!error && data) {
        // Legacy single-resume values (used as fallback for Full Stack only)
        const legacyResumeUrl = data.resume_url || defaults.fullstack.resume_url
        const legacyFilename = data.filename || defaults.fullstack.filename
        const legacyDescription = data.description ?? defaults.fullstack.description

        fullstackFromDb = {
          // Prefer dedicated fullstack_* columns, then fall back to legacy single-resume values
          resume_url: data.fullstack_resume_url || legacyResumeUrl,
          filename: data.fullstack_filename || legacyFilename,
          description: data.fullstack_description ?? legacyDescription
        }

        uiuxFromDb = {
          // UI/UX is completely independent. If no uiux_* values exist yet,
          // fall back to its own defaults instead of the legacy/Full Stack resume.
          resume_url: data.uiux_resume_url || defaults.uiux.resume_url,
          filename: data.uiux_filename || defaults.uiux.filename,
          description: data.uiux_description ?? defaults.uiux.description
        }
      } else if (error) {
        console.warn('Resume settings query failed, falling back to local storage/defaults:', error)
      }
    } catch (error) {
      console.warn('Error fetching resume URLs from Supabase, falling back to local storage/defaults:', error)
    }

    // Per-profile localStorage fallbacks
    const fullstackLocal = this.getLocalResume('fullstack')
    const uiuxLocal = this.getLocalResume('uiux')

    const fullstack = fullstackFromDb || fullstackLocal || defaults.fullstack
    const uiux = uiuxFromDb || uiuxLocal || defaults.uiux

    return { fullstack, uiux }
  },

  async getResume(profile = 'fullstack') {
    const all = await this.getAllResumes()
    return all[profile] || all.fullstack
  },

  // Backward-compatible wrapper (old name)
  async getResumeUrl(profile) {
    if (profile) {
      return this.getResume(profile)
    }
    return this.getResume('fullstack')
  },

  async uploadResume(file, profile = 'fullstack') {
    try {
      const safeProfile = profile === 'uiux' ? 'uiux' : 'fullstack'
      const prefix = safeProfile === 'uiux' ? 'uiux' : 'fullstack'

      // First, delete any existing custom resume for this profile
      await this.deleteOldResume(safeProfile)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `resume_${safeProfile}_${Date.now()}.${fileExt}`
      const filePath = `resumes/${fileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      let resumeUrl

      if (uploadError) {
        // Fallback to base64 storage for development (or when Supabase Storage is not configured)
        console.warn('Supabase storage upload failed, using base64 fallback')
        const base64Data = await this.fileToBase64(file)

        // Store the full data URL so we can use it directly later (and avoid corrupt files)
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(`resume_${prefix}_url`, base64Data)
          localStorage.setItem(`resume_${prefix}_filename`, file.name)
        }
        
        // Use the exact data URL returned by FileReader (includes the correct MIME type)
        resumeUrl = base64Data
        
        // Try to save to database
        try {
          await this.saveResumeSettingsForProfile(safeProfile, resumeUrl, file.name)
        } catch (dbError) {
          console.warn('Database save failed, using localStorage only')
        }
        
        const resume = { resume_url: resumeUrl, filename: file.name }
        return { profile: safeProfile, ...resume }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      resumeUrl = urlData.publicUrl

      // Save resume settings to database
      try {
        await this.saveResumeSettingsForProfile(safeProfile, resumeUrl, file.name)
      } catch (dbError) {
        console.warn('Database save failed, but file uploaded successfully:', dbError)
        // Continue anyway - file is uploaded to storage
      }

      const resume = { resume_url: resumeUrl, filename: file.name }
      // Also store in localStorage so UI keeps working even if Supabase is misconfigured
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`resume_${prefix}_url`, resumeUrl)
        localStorage.setItem(`resume_${prefix}_filename`, file.name)
      }

      return { profile: safeProfile, ...resume }
    } catch (error) {
      console.error('Error uploading resume:', error)
      throw error
    }
  },

  async deleteOldResume(profile = 'fullstack') {
    try {
      const safeProfile = profile === 'uiux' ? 'uiux' : 'fullstack'
      // Get current resume info for this profile
      const currentResume = await this.getResume(safeProfile)
      
      // Only delete if it's a custom resume (not the default)
      if (currentResume.resume_url !== '/resume.pdf' && currentResume.resume_url.startsWith('http')) {
        // Extract file path from URL for Supabase storage
        const urlParts = currentResume.resume_url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const filePath = `resumes/${fileName}`

        // Delete from storage (don't throw error if it fails)
        try {
          await supabase.storage
            .from('documents')
            .remove([filePath])
        } catch (storageError) {
          console.warn('Failed to delete old resume from storage:', storageError)
        }
      }

      // Clear localStorage fallback for this profile
      const prefix = safeProfile === 'uiux' ? 'uiux' : 'fullstack'
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`resume_${prefix}_url`)
        localStorage.removeItem(`resume_${prefix}_filename`)
      }
    } catch (error) {
      console.warn('Failed to delete old resume:', error)
      // Don't throw error, just continue with upload
    }
  },

  async saveResumeSettingsForProfile(profile, resumeUrl, filename, description = null) {
    const safeProfile = profile === 'uiux' ? 'uiux' : 'fullstack'
    const prefix = safeProfile === 'uiux' ? 'uiux' : 'fullstack'

    const updateData = {
      id: 1,
      [`${prefix}_resume_url`]: resumeUrl,
      [`${prefix}_filename`]: filename,
      updated_at: new Date().toISOString()
    }
    
    if (description !== null) {
      updateData[`${prefix}_description`] = description
    }

    const { data, error } = await supabase
      .from('resume_settings')
      .upsert(updateData)
      .select()

    if (error) {
      console.warn('Resume settings table not found. Please create the table using the SQL in create_resume_table.sql')
      throw new Error('Resume settings table not found. Please set up your database.')
    }
    return data[0]
  },

  // Backward-compatible metadata update (defaults to fullstack)
  async updateResumeMetadata(metadata) {
    return this.updateResumeMetadataForProfile('fullstack', metadata)
  },

  async updateResumeMetadataForProfile(profile, metadata) {
    const safeProfile = profile === 'uiux' ? 'uiux' : 'fullstack'
    const prefix = safeProfile === 'uiux' ? 'uiux' : 'fullstack'

    const updates = {
      updated_at: new Date().toISOString()
    }

    if (metadata.filename !== undefined) {
      updates[`${prefix}_filename`] = metadata.filename
    }

    if (metadata.description !== undefined) {
      updates[`${prefix}_description`] = metadata.description
    }

    const { data, error } = await supabase
      .from('resume_settings')
      .update(updates)
      .eq('id', 1)
      .select()

    if (error) throw error
    return data[0]
  },

  async deleteResume(profile = 'fullstack') {
    try {
      const safeProfile = profile === 'uiux' ? 'uiux' : 'fullstack'
      // Get current resume info
      const currentResume = await this.getResume(safeProfile)
      
      if (currentResume.resume_url.startsWith('http')) {
        // Extract file path from URL for Supabase storage
        const urlParts = currentResume.resume_url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const filePath = `resumes/${fileName}`

        // Delete from storage
        await supabase.storage
          .from('documents')
          .remove([filePath])
      }

      // Reset to default in database for this profile
      const prefix = safeProfile === 'uiux' ? 'uiux' : 'fullstack'
      const updateData = {
        id: 1,
        [`${prefix}_resume_url`]: '/resume.pdf',
        [`${prefix}_filename`]: 'resume.pdf',
        [`${prefix}_description`]: null,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('resume_settings')
        .upsert(updateData)
        .select()

      if (error) {
        console.warn('Resume settings table not found. Please create the table using the SQL in create_resume_table.sql')
        throw new Error('Resume settings table not found. Please set up your database.')
      }

      // Clear localStorage fallback
      localStorage.removeItem(`${prefix}_resume_file`)
      localStorage.removeItem(`${prefix}_resume_filename`)

      return { profile: safeProfile, resume_url: '/resume.pdf', filename: 'resume.pdf' }
    } catch (error) {
      console.error('Error deleting resume:', error)
      throw error
    }
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  },

  // Utility function to force download
  forceDownload(url, filename) {
    try {
      // Create a temporary link element
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      
      // For cross-origin URLs, try to fetch and create blob URL
      if (url.startsWith('http') && !url.includes(window.location.hostname)) {
        this.downloadCrossOrigin(url, filename)
        return
      }
      
      // Add to DOM temporarily
      document.body.appendChild(link)
      
      // Trigger download
      link.click()
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link)
      }, 100)
    } catch (error) {
      console.warn('Force download failed, falling back to window.open:', error)
      // Fallback: open in new tab
      window.open(url, '_blank')
    }
  },

  // Handle cross-origin downloads
  async downloadCrossOrigin(url, filename) {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      }, 100)
    } catch (error) {
      console.warn('Cross-origin download failed:', error)
      // Final fallback
      window.open(url, '_blank')
    }
  }
}

export const feedbackAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching feedback:', error)
      return []
    }
    return data || []
  },

  async create(feedback) {
    const { data, error } = await supabase
      .from('feedback')
      .insert([{
        ...feedback,
        created_at: new Date().toISOString()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('feedback')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async markAsRead(id) {
    return this.update(id, { status: 'read' })
  },

  async archive(id) {
    return this.update(id, { status: 'archived' })
  }
}

export const commentsAPI = {
  async getApproved() {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching approved comments:', error)
      return []
    }
    return data || []
  },

  async getAll() {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching comments:', error)
      return []
    }
    return data || []
  },

  async create(comment) {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        ...comment,
        created_at: new Date().toISOString()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('comments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async approve(id) {
    return this.update(id, { status: 'approved' })
  },

  async reject(id) {
    return this.update(id, { status: 'rejected' })
  },

  async likeComment(commentId, userIdentifier) {
    try {
      // Check if user already liked this comment
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_identifier', userIdentifier)
        .single()

      if (existingLike) {
        // Unlike - remove the like
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_identifier', userIdentifier)
        
        if (error) throw error
        return { liked: false }
      } else {
        // Like - add the like
        const { error } = await supabase
          .from('comment_likes')
          .insert([{
            comment_id: commentId,
            user_identifier: userIdentifier,
            created_at: new Date().toISOString()
          }])
        
        if (error) throw error
        return { liked: true }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      throw error
    }
  },

  async getUserLikes(userIdentifier) {
    const { data, error } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_identifier', userIdentifier)
    
    if (error) {
      console.error('Error fetching user likes:', error)
      return []
    }
    return data?.map(like => like.comment_id) || []
  }
}

export const authAPI = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

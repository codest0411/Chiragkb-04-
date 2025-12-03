import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { 
  LogOut, Plus, Edit, Trash2, Save, X,
  BarChart3, Users, FileText, Briefcase, Mail, Sun, Moon, Upload, Download, File, Award, Link, Image, MessageCircle
} from 'lucide-react'
import { projectsAPI, experienceAPI, authAPI, statisticsAPI, resumeAPI, messagesAPI, achievementsAPI, galleryAPI, galleryFoldersAPI, storageAPI, feedbackAPI, commentsAPI, supabase } from '../utils/supabase'
import { useTheme } from '../contexts/ThemeContext'
import { LinksManager } from './LinksAdmin'

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()

  // Custom Image Component for handling uploaded images
  const ProjectImage = ({ src, alt, className }) => {
    const [imageSrc, setImageSrc] = useState(src)
    
    useEffect(() => {
      if (src && src.startsWith('/images/')) {
        const fileName = src.replace('/images/', '')
        const storedImage = localStorage.getItem(`project_image_${fileName}`)
        if (storedImage) {
          setImageSrc(storedImage)
        } else {
          setImageSrc(src)
        }
      } else {
        setImageSrc(src)
      }
    }, [src])
    
    return <img src={imageSrc} alt={alt} className={className} />
  }

  // Edit states
  const [editingProject, setEditingProject] = useState(null)
  const [editingExperience, setEditingExperience] = useState(null)
  
  // Modal states
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showExperienceModal, setShowExperienceModal] = useState(false)
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  const [showEditExperienceModal, setShowEditExperienceModal] = useState(false)
  
  // Form states
  const getEmptyProjectForm = () => ({
    title: '',
    description: '',
    category: [],
    technologies: [],
    github_url: '',
    demo_url: '',
    image_url: '',
    featured: false,
    project_type: 'fullstack'
  })

  const [projectForm, setProjectForm] = useState(getEmptyProjectForm())
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [galleryForm, setGalleryForm] = useState({ story: '', image_url: '', folder_id: null })
  const [galleryImageFile, setGalleryImageFile] = useState(null)
  const [galleryImagePreview, setGalleryImagePreview] = useState(null)
  const [experienceForm, setExperienceForm] = useState({
    title: '', company: '', location: '', type: 'work', description: '', achievements: [], technologies: [], 
    start_date: '', end_date: '', current: false
  })
  const [technologyInput, setTechnologyInput] = useState('')
  const [achievementInput, setAchievementInput] = useState('')
  const [experienceTechInput, setExperienceTechInput] = useState('')

  // Data states
  const [projects, setProjects] = useState([])
  const [experiences, setExperiences] = useState([])
  const [statistics, setStatistics] = useState([])
  const [resumes, setResumes] = useState({
    fullstack: { resume_url: '/resume.pdf', filename: 'resume.pdf' },
    uiux: { resume_url: '/resume.pdf', filename: 'resume.pdf' }
  })
  const [activeResumeProfile, setActiveResumeProfile] = useState('fullstack')
  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [messagesRefreshing, setMessagesRefreshing] = useState(false)
  const [certifications, setCertifications] = useState([])

  const [galleryItems, setGalleryItems] = useState([])
  const [editingGalleryItem, setEditingGalleryItem] = useState(null)
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [showEditGalleryModal, setShowEditGalleryModal] = useState(false)

  const [galleryFolders, setGalleryFolders] = useState([])
  const [folderForm, setFolderForm] = useState({ name: '', color: '#5227FF' })
  const [editingFolder, setEditingFolder] = useState(null)
  const [showFolderModal, setShowFolderModal] = useState(false)

  // Statistics editing states
  const [editingStatistic, setEditingStatistic] = useState(null)
  const [showStatisticsModal, setShowStatisticsModal] = useState(false)
  const [statisticForm, setStatisticForm] = useState({
    number: '', label: '', order: 1
  })
  const [editingCertification, setEditingCertification] = useState(null)
  const [showCertificationModal, setShowCertificationModal] = useState(false)
  const [certificationForm, setCertificationForm] = useState({
    title: '', issuer: '', date: '', credential_id: '', url: ''
  })

  // Resume states
  const [uploadingResume, setUploadingResume] = useState(false)
  const [selectedResumeFile, setSelectedResumeFile] = useState(null)

  // Feedback states
  const [feedbackList, setFeedbackList] = useState([])
  const [selectedFeedback, setSelectedFeedback] = useState(null)

  // Comments state
  const [commentsList, setCommentsList] = useState([])
  const [selectedComment, setSelectedComment] = useState(null)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      // Check if user is already authenticated
      const currentUser = await authAPI.getCurrentUser()
      
      if (currentUser && currentUser.email === 'Admin@gmail.com') {
        setUser(currentUser)
        setIsAuthenticated(true)
        await loadDashboardData()
      } else {
        // Auto-login the admin user
        try {
          const { user: adminUser } = await authAPI.signIn('Admin@gmail.com', 'Chirag@00')
          setUser(adminUser)
          setIsAuthenticated(true)
          await loadDashboardData()
        } catch (authError) {
          console.error('Admin authentication failed:', authError)
          // Fallback to localStorage check for development
          const isAdminAuth = localStorage.getItem('isAdminAuthenticated')
          if (isAdminAuth) {
            setIsAuthenticated(true)
            await loadDashboardData()
          } else {
            navigate('/admin/login')
          }
        }
      }
    } catch (error) {
      console.error('Authentication check failed:', error)
      // Fallback for development
      const isAdminAuth = localStorage.getItem('isAdminAuthenticated')
      if (isAdminAuth) {
        setIsAuthenticated(true)
        await loadDashboardData()
      } else {
        navigate('/admin/login')
      }
    }
  }

  const loadDashboardData = async () => {
    try {
      // Load real data from Supabase
      const [projectsData, experiencesData, statisticsData, resumeData, messagesData, achievementsData, galleryData, folderData, feedbackData, commentsData] = await Promise.all([
        projectsAPI.getAll(),
        experienceAPI.getAll(),
        statisticsAPI.getAll(),
        resumeAPI.getAllResumes(),
        messagesAPI.getAll(),
        achievementsAPI.getAll(),
        galleryAPI.getAll(),
        galleryFoldersAPI.getAll(),
        feedbackAPI.getAll(),
        commentsAPI.getAll()
      ])
      
      setProjects(projectsData || [])
      setExperiences(experiencesData || [])
      setStatistics(statisticsData || [])
      setResumes(resumeData || resumeAPI.getDefaultResumes())
      setMessages(messagesData || [])
      setCertifications(achievementsData || [])
      setGalleryItems(galleryData || [])
      setGalleryFolders(folderData || [])
      setFeedbackList(feedbackData || [])
      setCommentsList(commentsData || [])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Set empty arrays to show real data only
      setProjects([])
      setExperiences([])
      setStatistics([])
      setMessages([])
      setCertifications([])
      setGalleryItems([])
      setGalleryFolders([])
      setFeedbackList([])
      setCommentsList([])
    } finally {
      setLoading(false)
    }
  }

  const refreshMessages = async () => {
    try {
      const data = await messagesAPI.getAll()
      setMessages(data || [])
    } catch (error) {
      console.error('Failed to refresh messages:', error)
    }
  }

  const handleRefreshMessages = async () => {
    setMessagesRefreshing(true)
    await refreshMessages()
    setMessagesRefreshing(false)
  }

  useEffect(() => {
    if (!messages.length) {
      setSelectedMessage(null)
      return
    }
    setSelectedMessage((prev) => {
      if (!prev) return messages[0]
      const updated = messages.find(msg => msg.id === prev.id)
      return updated || messages[0]
    })
  }, [messages])

  const formatDateTime = (value) => {
    if (!value) return '—'
    try {
      return new Date(value).toLocaleString()
    } catch (error) {
      return value
    }
  }

  const buildGmailComposeLink = (message) => {
    if (!message?.email) return 'https://mail.google.com/mail/'

    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to: message.email,
      su: message.subject || '',
      body: `Hi ${message.name || ''},\n\n`
    })

    return `https://mail.google.com/mail/?${params.toString()}`
  }

  const buildOutlookComposeLink = (message) => {
    if (!message?.email) return 'https://outlook.office.com/mail/'

    const params = new URLSearchParams({
      rru: 'compose',
      to: message.email,
      subject: message.subject || '',
      body: `Hi ${message.name || ''},\n\n`
    })

    return `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`
  }

  const extractStoragePathFromUrl = (url) => {
    if (!url || typeof url !== 'string') return null
    if (!url.includes('/storage/v1/object/public/')) return null
    try {
      const parts = url.split('/storage/v1/object/public/')[1]
      if (!parts) return null
      const segments = parts.split('/')
      if (segments.length < 2) return null
      const path = segments.slice(1).join('/')
      return path
    } catch {
      return null
    }
  }

  const getFolderNameById = (id) => {
    if (!id) return '—'
    const folder = galleryFolders.find((f) => f.id === id)
    return folder ? folder.name : '—'
  }


  const handleLogout = async () => {
    try {
      await authAPI.signOut()
      localStorage.removeItem('isAdminAuthenticated')
      localStorage.removeItem('rememberAdmin')
      setUser(null)
      setIsAuthenticated(false)
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
      // Force logout even if Supabase fails
      localStorage.removeItem('isAdminAuthenticated')
      localStorage.removeItem('rememberAdmin')
      setUser(null)
      setIsAuthenticated(false)
      navigate('/')
    }
  }

  // Edit modal functions
  const openEditProjectModal = (project) => {
    setEditingProject(project)
    setProjectForm({
      title: project.title || '',
      description: project.description || '',
      category: Array.isArray(project.category) ? project.category : (project.category ? [project.category] : []),
      technologies: project.technologies || [],
      github_url: project.github_url || '',
      demo_url: project.demo_url || '',
      image_url: project.image_url || '',
      featured: project.featured || false,
      project_type: project.project_type || 'fullstack'
    })
    setShowEditProjectModal(true)
  }

  const handleUpdateProject = async (e) => {
    e.preventDefault()
    try {
      const updatedProject = {
        ...editingProject,
        ...projectForm,
        updated_at: new Date().toISOString()
      }

      await projectsAPI.update(editingProject.id, updatedProject)
      
      // Update local state for immediate visibility
      setProjects(prev => prev.map(p => 
        p.id === editingProject.id ? updatedProject : p
      ))
      
      setShowEditProjectModal(false)
      setEditingProject(null)
      setProjectForm(getEmptyProjectForm())
      alert('Project updated successfully!')
    } catch (error) {
      console.error('Failed to update project:', error)
      alert('Failed to update project: ' + error.message)
    }
  }

  // Edit modal functions for Experience
  const openEditExperienceModal = (experience) => {
    setEditingExperience(experience)
    setExperienceForm({
      title: experience.title || '',
      company: experience.company || '',
      location: experience.location || '',
      type: experience.type || 'work',
      description: experience.description || '',
      achievements: experience.achievements || [],
      technologies: experience.technologies || [],
      start_date: experience.start_date || '',
      end_date: experience.end_date || '',
      current: experience.current || false
    })
    setShowEditExperienceModal(true)
  }

  const handleUpdateExperience = async (e) => {
    e.preventDefault()
    try {
      const updatedExperience = {
        ...editingExperience,
        ...experienceForm,
        start_date: experienceForm.start_date || null,
        end_date: experienceForm.end_date || null,
        updated_at: new Date().toISOString()
      }

      await experienceAPI.update(editingExperience.id, updatedExperience)
      
      // Update local state for immediate visibility
      setExperiences(prev => prev.map(e => 
        e.id === editingExperience.id ? updatedExperience : e
      ))
      
      setShowEditExperienceModal(false)
      setEditingExperience(null)
      setExperienceForm({
        title: '', company: '', location: '', type: 'work', description: '', achievements: [], technologies: [], 
        start_date: '', end_date: '', current: false
      })
      setAchievementInput('')
      setExperienceTechInput('')
      alert('Experience updated successfully!')
    } catch (error) {
      console.error('Failed to update experience:', error)
      alert('Failed to update experience: ' + error.message)
    }
  }

  // Real-time edit functions (keeping for compatibility)
  const handleEditProject = async (project) => {
    try {
      await projectsAPI.update(project.id, project)
      setProjects(prev => prev.map(p => p.id === project.id ? project : p))
      setEditingProject(null)
      alert('Project updated successfully!')
    } catch (error) {
      console.error('Failed to update project:', error)
      alert('Failed to update project: ' + error.message)
    }
  }

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        // Try Supabase first, fallback to local state update
        try {
          await projectsAPI.delete(id)
        } catch (supabaseError) {
          console.warn('Supabase delete failed, using local fallback:', supabaseError)
          // Remove from local state as fallback
          setProjects(prev => prev.filter(p => p.id !== id))
        }
        // Don't reload data to preserve the delete changes
        alert('Project deleted successfully!')
      } catch (error) {
        console.error('Failed to delete project:', error)
        alert('Failed to delete project. Please try again.')
      }
    }
  }


  const handleEditExperience = async (experience) => {
    try {
      // Try Supabase first, fallback to local state update
      try {
        await experienceAPI.update(experience.id, experience)
      } catch (supabaseError) {
        console.warn('Supabase update failed, using local fallback:', supabaseError)
        // Update local state as fallback
        setExperiences(prev => prev.map(e => e.id === experience.id ? experience : e))
      }
      // Don't reload data to preserve the edit changes
      setEditingExperience(null)
      alert('Experience updated successfully!')
    } catch (error) {
      console.error('Failed to update experience:', error)
      alert('Failed to update experience. Please try again.')
    }
  }

  const handleDeleteExperience = async (id) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      try {
        // Try Supabase first, fallback to local state update
        try {
          await experienceAPI.delete(id)
        } catch (supabaseError) {
          console.warn('Supabase delete failed, using local fallback:', supabaseError)
          // Remove from local state as fallback
          setExperiences(prev => prev.filter(e => e.id !== id))
        }
        // Don't reload data to preserve the delete changes
        alert('Experience deleted successfully!')
      } catch (error) {
        console.error('Failed to delete experience:', error)
        alert('Failed to delete experience. Please try again.')
      }
    }
  }


  // Image handling functions
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      
      // Generate image URL based on project title
      const fileName = projectForm.title ? 
        projectForm.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') + '.png' :
        'project-' + Date.now() + '.png'
      setProjectForm({...projectForm, image_url: `/images/${fileName}`})
    }
  }

  const handleGalleryImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setGalleryImageFile(file)
      const previewUrl = URL.createObjectURL(file)
      setGalleryImagePreview(previewUrl)
    }
  }

  const uploadImageToPublic = async (file, fileName) => {
    try {
      // Create a FormData object to handle file upload
      const formData = new FormData()
      formData.append('image', file)
      formData.append('fileName', fileName)
      
      // For client-side only approach, we'll convert to base64 and store
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          // Store the base64 image data
          const base64Data = reader.result
          localStorage.setItem(`project_image_${fileName}`, base64Data)
          resolve(`/images/${fileName}`)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('Image upload failed:', error)
      throw error
    }
  }

  const handleCreateGalleryItem = async (e) => {
    e.preventDefault()
    if (!galleryForm.story || !galleryForm.story.trim()) {
      alert('Please enter story text')
      return
    }

    try {
      let imageUrl = galleryForm.image_url || null

      if (galleryImageFile) {
        const imageExt = galleryImageFile.name.split('.').pop() || 'png'
        const safeStory = galleryForm.story.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'image'
        const imagePath = `gallery/${Date.now()}-${safeStory}.${imageExt}`
        await storageAPI.uploadFile('gallery-images', imagePath, galleryImageFile)
        imageUrl = await storageAPI.getPublicUrl('gallery-images', imagePath)
      }

      const newItem = await galleryAPI.create({
        story: galleryForm.story.trim(),
        image_url: imageUrl,
        folder_id: galleryForm.folder_id || null,
        created_at: new Date().toISOString()
      })

      setGalleryItems(prev => [newItem, ...prev])
      setShowGalleryModal(false)
      setGalleryForm({ story: '', image_url: '', folder_id: null })
      setGalleryImageFile(null)
      setGalleryImagePreview(null)

      window.dispatchEvent(new CustomEvent('galleryUpdated'))
    } catch (error) {
      console.error('Failed to create gallery item:', error)
      alert('Failed to create gallery item: ' + error.message)
    }
  }

  // Create functions
  const handleCreateProject = async (e) => {
    e.preventDefault()
    try {
      let finalImageUrl = projectForm.image_url

      // Automatically handle image upload if an image was selected
      if (selectedImage) {
        const fileName = projectForm.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') + '.png'
        finalImageUrl = await uploadImageToPublic(selectedImage, fileName)
      }

      // Create project with authenticated user
      const newProject = await projectsAPI.create({
        ...projectForm,
        image_url: finalImageUrl,
        created_at: new Date().toISOString()
      })
      
      // Add to local state for immediate visibility
      setProjects(prev => [newProject, ...prev])
      setShowProjectModal(false)
      setProjectForm(getEmptyProjectForm())
      setSelectedImage(null)
      setImagePreview(null)
      alert('Project created successfully with image!')
    } catch (error) {
      console.error('Failed to create project:', error)
      alert('Failed to create project: ' + error.message)
    }
  }

  const handleCreateExperience = async (e) => {
    e.preventDefault()
    try {
      // Prepare experience data with proper date handling
      const experienceData = {
        ...experienceForm,
        start_date: experienceForm.start_date || null,
        end_date: experienceForm.end_date || null,
        created_at: new Date().toISOString()
      }

      // Create experience with authenticated user
      const newExperience = await experienceAPI.create(experienceData)
      
      // Add to local state for immediate visibility
      setExperiences(prev => [newExperience, ...prev])
      setShowExperienceModal(false)
      setExperienceForm({
        title: '', company: '', location: '', type: 'work', description: '', achievements: [], technologies: [], 
        start_date: '', end_date: '', current: false
      })
      setAchievementInput('')
      setExperienceTechInput('')
      alert('Experience created successfully!')
    } catch (error) {
      console.error('Failed to create experience:', error)
      alert('Failed to create experience: ' + error.message)
    }
  }

  const openEditGalleryModal = (item) => {
    setEditingGalleryItem(item)
    setGalleryForm({
      story: item.story || '',
      image_url: item.image_url || '',
      folder_id: item.folder_id || null
    })
    setGalleryImageFile(null)
    setGalleryImagePreview(null)
    setShowEditGalleryModal(true)
  }

  const handleUpdateGalleryItem = async (e) => {
    e.preventDefault()
    if (!editingGalleryItem) return
    if (!galleryForm.story || !galleryForm.story.trim()) {
      alert('Please enter story text')
      return
    }

    try {
      let imageUrl = galleryForm.image_url || null

      if (galleryImageFile) {
        const existingPath = extractStoragePathFromUrl(editingGalleryItem.image_url)
        if (existingPath) {
          try {
            await storageAPI.deleteFile('gallery-images', existingPath)
          } catch (storageError) {
            console.warn('Failed to delete existing gallery image:', storageError)
          }
        }

        const imageExt = galleryImageFile.name.split('.').pop() || 'png'
        const safeStory = galleryForm.story.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'image'
        const imagePath = `gallery/${Date.now()}-${safeStory}.${imageExt}`
        await storageAPI.uploadFile('gallery-images', imagePath, galleryImageFile)
        imageUrl = await storageAPI.getPublicUrl('gallery-images', imagePath)
      }

      const updatedItem = await galleryAPI.update(editingGalleryItem.id, {
        story: galleryForm.story.trim(),
        image_url: imageUrl,
        folder_id: galleryForm.folder_id || null,
        updated_at: new Date().toISOString()
      })

      setGalleryItems(prev => prev.map(item => item.id === editingGalleryItem.id ? updatedItem : item))
      setShowEditGalleryModal(false)
      setEditingGalleryItem(null)
      setGalleryForm({ story: '', image_url: '', folder_id: null })
      setGalleryImageFile(null)
      setGalleryImagePreview(null)

      window.dispatchEvent(new CustomEvent('galleryUpdated'))
    } catch (error) {
      console.error('Failed to update gallery item:', error)
      alert('Failed to update gallery item: ' + error.message)
    }
  }

  const handleDeleteGalleryItem = async (item) => {
    if (!item) return
    if (!window.confirm('Are you sure you want to delete this gallery item?')) return

    try {
      const imagePath = extractStoragePathFromUrl(item.image_url)

      if (imagePath) {
        try {
          await storageAPI.deleteFile('gallery-images', imagePath)
        } catch (storageError) {
          console.warn('Failed to delete gallery image from storage:', storageError)
        }
      }

      await galleryAPI.delete(item.id)
      setGalleryItems(prev => prev.filter(g => g.id !== item.id))

      window.dispatchEvent(new CustomEvent('galleryUpdated'))
    } catch (error) {
      console.error('Failed to delete gallery item:', error)
      alert('Failed to delete gallery item. Please try again.')
    }
  }

  const openFolderModal = (folder) => {
    if (folder) {
      setEditingFolder(folder)
      setFolderForm({
        name: folder.name || '',
        color: folder.color || '#5227FF'
      })
    } else {
      setEditingFolder(null)
      setFolderForm({ name: '', color: '#5227FF' })
    }
    setShowFolderModal(true)
  }

  const handleSaveFolder = async (e) => {
    e.preventDefault()
    if (!folderForm.name || !folderForm.name.trim()) {
      alert('Please enter folder name')
      return
    }

    try {
      if (editingFolder) {
        const updated = await galleryFoldersAPI.update(editingFolder.id, {
          ...editingFolder,
          name: folderForm.name.trim(),
          color: folderForm.color || '#5227FF',
          updated_at: new Date().toISOString()
        })
        setGalleryFolders(prev => prev.map(f => f.id === updated.id ? updated : f))
      } else {
        const created = await galleryFoldersAPI.create({
          name: folderForm.name.trim(),
          color: folderForm.color || '#5227FF',
          created_at: new Date().toISOString()
        })
        setGalleryFolders(prev => [...prev, created])
      }

      setShowFolderModal(false)
      setEditingFolder(null)
      setFolderForm({ name: '', color: '#5227FF' })
    } catch (error) {
      console.error('Failed to save folder:', error)
      alert('Failed to save folder: ' + error.message)
    }
  }

  const handleDeleteFolder = async (folder) => {
    if (!folder) return
    if (!window.confirm('Are you sure you want to delete this folder? Items inside will be unassigned from the folder.')) return

    try {
      await galleryAPI.clearFolder(folder.id)
      await galleryFoldersAPI.delete(folder.id)
      setGalleryFolders(prev => prev.filter(f => f.id !== folder.id))
      setGalleryItems(prev => prev.map(item => item.folder_id === folder.id ? { ...item, folder_id: null } : item))
    } catch (error) {
      console.error('Failed to delete folder:', error)
      alert('Failed to delete folder. Please try again.')
    }
  }

  // Feedback management functions
  const handleDeleteFeedback = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await feedbackAPI.delete(id)
        setFeedbackList(prev => prev.filter(f => f.id !== id))
        if (selectedFeedback && selectedFeedback.id === id) {
          setSelectedFeedback(null)
        }
        alert('Feedback deleted successfully!')
      } catch (error) {
        console.error('Failed to delete feedback:', error)
        alert('Failed to delete feedback. Please try again.')
      }
    }
  }

  const handleMarkFeedbackAsRead = async (feedback) => {
    try {
      const updatedFeedback = await feedbackAPI.markAsRead(feedback.id)
      setFeedbackList(prev => prev.map(f => f.id === feedback.id ? updatedFeedback : f))
      if (selectedFeedback && selectedFeedback.id === feedback.id) {
        setSelectedFeedback(updatedFeedback)
      }
    } catch (error) {
      console.error('Failed to mark feedback as read:', error)
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${
              star <= rating
                ? 'text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  // Comments management functions
  const handleDeleteComment = async (id) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentsAPI.delete(id)
        setCommentsList(prev => prev.filter(c => c.id !== id))
        if (selectedComment && selectedComment.id === id) {
          setSelectedComment(null)
        }
        alert('Comment deleted successfully!')
      } catch (error) {
        console.error('Failed to delete comment:', error)
        alert('Failed to delete comment. Please try again.')
      }
    }
  }

  const handleApproveComment = async (comment) => {
    try {
      const updatedComment = await commentsAPI.approve(comment.id)
      setCommentsList(prev => prev.map(c => c.id === comment.id ? updatedComment : c))
      if (selectedComment && selectedComment.id === comment.id) {
        setSelectedComment(updatedComment)
      }
    } catch (error) {
      console.error('Failed to approve comment:', error)
    }
  }

  const handleRejectComment = async (comment) => {
    try {
      const updatedComment = await commentsAPI.reject(comment.id)
      setCommentsList(prev => prev.map(c => c.id === comment.id ? updatedComment : c))
      if (selectedComment && selectedComment.id === comment.id) {
        setSelectedComment(updatedComment)
      }
    } catch (error) {
      console.error('Failed to reject comment:', error)
    }
  }

  // Toggle featured status
  const toggleProjectFeatured = async (project) => {
    try {
      await projectsAPI.update(project.id, { ...project, featured: !project.featured })
      // Update local state for immediate visibility
      setProjects(prev => prev.map(p => 
        p.id === project.id ? { ...p, featured: !p.featured } : p
      ))
    } catch (error) {
      console.error('Failed to update project:', error)
      alert('Failed to update project: ' + error.message)
    }
  }

  // Toggle current status
  const toggleExperienceCurrent = async (experience) => {
    try {
      await experienceAPI.update(experience.id, { ...experience, current: !experience.current })
      // Update local state for immediate visibility
      setExperiences(prev => prev.map(e => 
        e.id === experience.id ? { ...e, current: !e.current } : e
      ))
    } catch (error) {
      console.error('Failed to update experience:', error)
      alert('Failed to update experience: ' + error.message)
    }
  }

  // Statistics management functions
  const handleEditStatistic = async (statistic) => {
    try {
      await statisticsAPI.update(statistic.id, statistic)
      setStatistics(prev => prev.map(s => s.id === statistic.id ? statistic : s))
      setEditingStatistic(null)
      alert('Statistic updated successfully!')
    } catch (error) {
      console.error('Failed to update statistic:', error)
      alert('Failed to update statistic: ' + error.message)
    }
  }

  const handleDeleteStatistic = async (id) => {
    if (window.confirm('Are you sure you want to delete this statistic?')) {
      try {
        await statisticsAPI.delete(id)
        setStatistics(prev => prev.filter(s => s.id !== id))
        alert('Statistic deleted successfully!')
      } catch (error) {
        console.error('Failed to delete statistic:', error)
        alert('Failed to delete statistic: ' + error.message)
      }
    }
  }

  const handleCreateStatistic = async (e) => {
    e.preventDefault()
    try {
      const newStatistic = await statisticsAPI.create(statisticForm)
      
      setStatistics(prev => [...prev, newStatistic])
      setShowStatisticsModal(false)
      setStatisticForm({ number: '', label: '', order: 1 })
      alert('Statistic created successfully!')
    } catch (error) {
      console.error('Failed to create statistic:', error)
      alert('Failed to create statistic: ' + error.message)
    }
  }

  // Certifications & Awards management functions
  const generateRandomCredentialId = () => {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
    const timePart = Date.now().toString(36).toUpperCase()
    return `CERT-${timePart}-${randomPart}`
  }

  const handleSaveCertification = async (e) => {
    e.preventDefault()
    try {
      let payload = { ...certificationForm }

      if (!payload.credential_id || !payload.credential_id.trim()) {
        payload = {
          ...payload,
          credential_id: generateRandomCredentialId()
        }
      }

      if (editingCertification) {
        const updated = await achievementsAPI.update(editingCertification.id, {
          ...editingCertification,
          ...payload
        })
        setCertifications(prev => prev.map(c => c.id === updated.id ? updated : c))
        alert('Certification / award updated successfully!')
      } else {
        const newCertification = await achievementsAPI.create(payload)
        setCertifications(prev => [newCertification, ...prev])
        alert('Certification / award added successfully!')
      }

      setShowCertificationModal(false)
      setEditingCertification(null)
      setCertificationForm({ title: '', issuer: '', date: '', credential_id: '', url: '' })
    } catch (error) {
      console.error('Failed to save certification:', error)
      alert('Failed to save certification / award: ' + error.message)
    }
  }

  const handleEditCertification = (certification) => {
    setEditingCertification(certification)
    setCertificationForm({
      title: certification.title || '',
      issuer: certification.issuer || '',
      date: certification.date || '',
      credential_id: certification.credential_id || '',
      url: certification.url || ''
    })
    setShowCertificationModal(true)
  }

  const handleDeleteCertification = async (id) => {
    if (window.confirm('Are you sure you want to delete this certification / award?')) {
      try {
        await achievementsAPI.delete(id)
        setCertifications(prev => prev.filter(c => c.id !== id))
        alert('Certification / award deleted successfully!')
      } catch (error) {
        console.error('Failed to delete certification:', error)
        alert('Failed to delete certification / award. Please try again.')
      }
    }
  }

  // Resume management functions
  const handleResumeUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setSelectedResumeFile(file)
    setUploadingResume(true)

    try {
      const profile = activeResumeProfile || 'fullstack'
      const uploaded = await resumeAPI.uploadResume(file, profile)

      // Immediately update local state so the card and download button
      // show the real uploaded file name and URL for this profile
      setResumes((prev) => {
        const next = {
          ...prev,
          [uploaded.profile]: {
            resume_url: uploaded.resume_url,
            filename: uploaded.filename,
            description: uploaded.description || null
          }
        }

        // Notify other pages (Home, Experience) with the fresh data
        window.dispatchEvent(new CustomEvent('resumeUpdated', { detail: next }))
        return next
      })

      setSelectedResumeFile(null)

      alert(`Resume uploaded successfully for ${profile === 'uiux' ? 'UI/UX' : 'Full Stack'} profile! The new resume is now active and available for download on the site.`)
    } catch (error) {
      console.error('Failed to upload resume:', error)
      if (error.message.includes('resume_settings')) {
        alert('Database setup required!\n\nPlease run the SQL script in create_resume_table.sql in your Supabase dashboard to create the resume_settings table.')
      } else {
        alert('Failed to upload resume: ' + error.message)
      }
    } finally {
      setUploadingResume(false)
    }
  }

  const handleDeleteResume = async () => {
    if (window.confirm('Are you sure you want to delete the current custom resume for this profile?\n\nThis will:\n• Remove the uploaded resume file\n• Reset to the default resume for this profile\n• Update the download links on the site')) {
      try {
        const profile = activeResumeProfile || 'fullstack'
        await resumeAPI.deleteResume(profile)

        const allResumes = await resumeAPI.getAllResumes()
        setResumes(allResumes)
        
        // Trigger real-time update for all profiles
        window.dispatchEvent(new CustomEvent('resumeUpdated', { detail: allResumes }))
        
        alert(`Custom resume deleted successfully for ${profile === 'uiux' ? 'UI/UX' : 'Full Stack'} profile! Reverted to default resume.`)
      } catch (error) {
        console.error('Failed to delete resume:', error)
        alert('Failed to delete resume: ' + error.message)
      }
    }
  }


  const handleReplaceResume = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploadingResume(true)

    try {
      const profile = activeResumeProfile || 'fullstack'
      const uploaded = await resumeAPI.uploadResume(file, profile)

      // Immediately update local state so the card and download button
      // show the real uploaded file name and URL for this profile
      setResumes((prev) => {
        const next = {
          ...prev,
          [uploaded.profile]: {
            resume_url: uploaded.resume_url,
            filename: uploaded.filename,
            description: uploaded.description || null
          }
        }

        // Notify other pages (Home, Experience) with the fresh data
        window.dispatchEvent(new CustomEvent('resumeUpdated', { detail: next }))
        return next
      })

      alert(`Resume replaced successfully for ${profile === 'uiux' ? 'UI/UX' : 'Full Stack'} profile! The new resume is now active and live on the site.`)
    } catch (error) {
      console.error('Failed to replace resume:', error)
      if (error.message.includes('resume_settings')) {
        alert('Database setup required!\n\nPlease run the SQL script in create_resume_table.sql in your Supabase dashboard to create the resume_settings table.')
      } else {
        alert('Failed to replace resume: ' + error.message)
      }
    } finally {
      setUploadingResume(false)
    }
  }

  // Handle multiple category selection
  const handleCategoryChange = (category) => {
    const currentCategories = projectForm.category || []
    const isSelected = currentCategories.includes(category)
    
    if (isSelected) {
      // Remove category
      setProjectForm({
        ...projectForm,
        category: currentCategories.filter(cat => cat !== category)
      })
    } else {
      // Add category
      setProjectForm({
        ...projectForm,
        category: [...currentCategories, category]
      })
    }
  }

  // Handle technologies used for projects
  const handleTechnologyAdd = () => {
    const value = technologyInput.trim()
    if (!value) return

    const normalized = value.replace(/\s+/g, ' ').trim()
    const current = Array.isArray(projectForm.technologies) ? projectForm.technologies : []
    if (current.some(t => t.toLowerCase() === normalized.toLowerCase())) {
      setTechnologyInput('')
      return
    }

    setProjectForm({
      ...projectForm,
      technologies: [...current, normalized]
    })
    setTechnologyInput('')
  }

  const handleTechnologyRemove = (techToRemove) => {
    const current = Array.isArray(projectForm.technologies) ? projectForm.technologies : []
    setProjectForm({
      ...projectForm,
      technologies: current.filter(t => t !== techToRemove)
    })
  }

  // Handle key achievements for experience (work & education)
  const handleAchievementAdd = () => {
    const value = achievementInput.trim()
    if (!value) return

    const normalized = value.replace(/\s+/g, ' ').trim()
    const current = Array.isArray(experienceForm.achievements) ? experienceForm.achievements : []
    if (current.some(a => a.toLowerCase() === normalized.toLowerCase())) {
      setAchievementInput('')
      return
    }

    setExperienceForm({
      ...experienceForm,
      achievements: [...current, normalized]
    })
    setAchievementInput('')
  }

  const handleAchievementRemove = (achievementToRemove) => {
    const current = Array.isArray(experienceForm.achievements) ? experienceForm.achievements : []
    setExperienceForm({
      ...experienceForm,
      achievements: current.filter(a => a !== achievementToRemove)
    })
  }

  // Handle technologies / skills used for experiences (work & education)
  const handleExperienceTechnologyAdd = () => {
    const value = experienceTechInput.trim()
    if (!value) return

    const normalized = value.replace(/\s+/g, ' ').trim()
    const current = Array.isArray(experienceForm.technologies) ? experienceForm.technologies : []
    if (current.some(t => t.toLowerCase() === normalized.toLowerCase())) {
      setExperienceTechInput('')
      return
    }

    setExperienceForm({
      ...experienceForm,
      technologies: [...current, normalized]
    })
    setExperienceTechInput('')
  }

  const handleExperienceTechnologyRemove = (techToRemove) => {
    const current = Array.isArray(experienceForm.technologies) ? experienceForm.technologies : []
    setExperienceForm({
      ...experienceForm,
      technologies: current.filter(t => t !== techToRemove)
    })
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'experience', label: 'Experience', icon: Users },
    { id: 'certifications', label: 'Certificates & Awards', icon: Award },
    { id: 'statistics', label: 'Statistics', icon: FileText },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'feedback', label: 'Feedback', icon: MessageCircle },
    { id: 'comments', label: 'Comments', icon: MessageCircle },
    { id: 'resume', label: 'Resume', icon: File },
    { id: 'links', label: 'Links', icon: Link }
  ]

  const stats = [
    { label: 'Total Projects', value: projects.length, color: 'bg-blue-500' },
    { label: 'Work Experience', value: experiences.filter(e => e.type === 'work').length, color: 'bg-purple-500' },
    { label: 'Education', value: experiences.filter(e => e.type === 'education').length, color: 'bg-green-500' },
    { label: 'Certifications & Awards', value: certifications.length, color: 'bg-yellow-500' },
    { label: 'Messages Received', value: messages.length, color: 'bg-red-500' },
    { label: 'Feedback Received', value: feedbackList.length, color: 'bg-indigo-500' },
    { label: 'Comments Posted', value: commentsList.length, color: 'bg-pink-500' }
  ]

  const currentResumeProfileData = resumes[activeResumeProfile] || resumes.fullstack
  const activeResumeProfileLabel = activeResumeProfile === 'uiux' ? 'UI/UX' : 'Full Stack'

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {!isAuthenticated ? 'Authenticating admin user...' : 'Loading dashboard...'}
          </p>
        </div>
      </div>
    )
  }


  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Portfolio</title>
      </Helmet>

      <div className="h-screen w-screen bg-gray-50 dark:bg-dark-bg overflow-auto flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-6 py-4 sm:py-5">
            {/* Left side - Title and Welcome */}
            <div className="flex-1">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Briefcase size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">
                    Welcome back, Chirag. Manage your portfolio content in real-time.
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm">
                    <span className="text-gray-500 dark:text-gray-500">Current:</span>
                    <span className="font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                      {tabs.find(tab => tab.id === activeTab)?.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Controls */}
            <div className="flex items-center gap-2 sm:gap-3 self-stretch lg:self-auto">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-transparent text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 bg-transparent transition-colors duration-200 touch-target"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm sm:text-base touch-target"
              >
                <LogOut size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col px-2 sm:px-4 py-3 sm:py-4 gap-4">

          <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border shadow-sm p-3">
            <nav className="overflow-x-auto">
              <div className="flex flex-wrap gap-2 min-w-full">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border text-sm font-medium whitespace-nowrap touch-target transition-colors ${
                      activeTab === tab.id
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700'
                        : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card'
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-0">
            <div className="h-full w-full bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border shadow-sm p-3 lg:p-4 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-2 lg:space-y-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
                      Dashboard Overview
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                      {stats.map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border"
                        >
                          <div className="flex items-center">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                              <span className="text-white font-bold text-lg sm:text-xl">{stat.value}</span>
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Projects */}
                  <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Recent Projects
                    </h3>
                    <div className="space-y-3">
                      {projects.slice(0, 5).map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{project.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {Array.isArray(project.category) ? project.category.join(', ') : project.category}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {project.featured && (
                              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded">
                                Featured
                              </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(project.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'feedback' && (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Feedback Management
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Manage user feedback and reviews
                      </p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Feedback List */}
                    <div className="lg:col-span-1">
                      <div className="card">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                          Feedback List ({feedbackList.length})
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {feedbackList.length > 0 ? (
                            feedbackList.map((feedback) => (
                              <div
                                key={feedback.id}
                                onClick={() => setSelectedFeedback(feedback)}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                  selectedFeedback?.id === feedback.id
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                        {feedback.name}
                                      </h4>
                                      {feedback.status === 'new' && (
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                          New
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                      {renderStars(feedback.rating)}
                                      <span className="text-xs text-gray-500">
                                        {new Date(feedback.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                      {feedback.feedback_text}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                              <p>No feedback received yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Feedback Details */}
                    <div className="lg:col-span-2">
                      <div className="card">
                        {selectedFeedback ? (
                          <div>
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  Feedback Details
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  From {selectedFeedback.name}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {selectedFeedback.status === 'new' && (
                                  <button
                                    onClick={() => handleMarkFeedbackAsRead(selectedFeedback)}
                                    className="btn-secondary text-xs"
                                  >
                                    Mark as Read
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                                  className="btn-danger text-xs"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Name
                                  </label>
                                  <p className="text-gray-900 dark:text-gray-100">
                                    {selectedFeedback.name}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email
                                  </label>
                                  <p className="text-gray-900 dark:text-gray-100">
                                    {selectedFeedback.email || 'Not provided'}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Rating
                                  </label>
                                  <div className="flex items-center gap-2">
                                    {renderStars(selectedFeedback.rating)}
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      ({selectedFeedback.rating}/5)
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Date
                                  </label>
                                  <p className="text-gray-900 dark:text-gray-100">
                                    {new Date(selectedFeedback.created_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                  Feedback
                                </label>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                  <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                                    {selectedFeedback.feedback_text}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Status
                                </label>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  selectedFeedback.status === 'new'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : selectedFeedback.status === 'read'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                }`}>
                                  {selectedFeedback.status.charAt(0).toUpperCase() + selectedFeedback.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No Feedback Selected</h3>
                            <p>Select a feedback from the list to view details</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Comments Management
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Manage user comments and moderate content
                      </p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Comments List */}
                    <div className="lg:col-span-1">
                      <div className="card">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                          Comments List ({commentsList.length})
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {commentsList.length > 0 ? (
                            commentsList.map((comment) => (
                              <div
                                key={comment.id}
                                onClick={() => setSelectedComment(comment)}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                  selectedComment?.id === comment.id
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                        {comment.name}
                                      </h4>
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        comment.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                          : comment.status === 'approved'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                      }`}>
                                        {comment.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        ❤️ {comment.likes}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                      {comment.comment_text}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                              <p>No comments received yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Comment Details */}
                    <div className="lg:col-span-2">
                      <div className="card">
                        {selectedComment ? (
                          <div>
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  Comment Details
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  From {selectedComment.name}
                                </p>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                {selectedComment.status !== 'approved' && (
                                  <button
                                    onClick={() => handleApproveComment(selectedComment)}
                                    className="btn-secondary text-xs bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400"
                                  >
                                    Approve
                                  </button>
                                )}
                                {selectedComment.status !== 'rejected' && (
                                  <button
                                    onClick={() => handleRejectComment(selectedComment)}
                                    className="btn-secondary text-xs bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
                                  >
                                    Hide
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteComment(selectedComment.id)}
                                  className="btn-danger text-xs"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Name
                                  </label>
                                  <p className="text-gray-900 dark:text-gray-100">
                                    {selectedComment.name}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email
                                  </label>
                                  <p className="text-gray-900 dark:text-gray-100">
                                    {selectedComment.email || 'Not provided'}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Likes
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <span className="text-red-500">❤️</span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {selectedComment.likes} likes
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Date
                                  </label>
                                  <p className="text-gray-900 dark:text-gray-100">
                                    {new Date(selectedComment.created_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                  Comment
                                </label>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                  <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                                    {selectedComment.comment_text}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Status
                                </label>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  selectedComment.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : selectedComment.status === 'approved'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                  {selectedComment.status.charAt(0).toUpperCase() + selectedComment.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No Comment Selected</h3>
                            <p>Select a comment from the list to view details</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'links' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Contact & Social Links
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-3xl">
                      Update your contact details, WhatsApp info, Google Maps links, and social profiles without leaving the dashboard.
                      These values power the Contact page and any other components that consume the shared Links context.
                    </p>
                  </div>

                  <div className="card p-0 sm:p-2">
                    <LinksManager variant="embedded" />
                  </div>
                </div>
              )}

              {activeTab === 'gallery' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Gallery
                    </h2>
                    <button
                      onClick={() => setShowGalleryModal(true)}
                      className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <Plus size={18} className="sm:w-5 sm:h-5" />
                      <span>Add Gallery Item</span>
                    </button>
                  </div>

                  <div className="card mb-4 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Folders
                      </h3>
                      <button
                        type="button"
                        onClick={() => openFolderModal(null)}
                        className="btn-secondary w-full sm:w-auto"
                      >
                        Add Folder
                      </button>
                    </div>
                    {galleryFolders.length === 0 ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No folders yet. Create a folder to group gallery items.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {galleryFolders.map((folder) => (
                          <div
                            key={folder.id}
                            className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card text-xs sm:text-sm text-gray-800 dark:text-gray-200"
                          >
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: folder.color || '#5227FF' }}
                            />
                            <span>{folder.name}</span>
                            <button
                              type="button"
                              onClick={() => openFolderModal(folder)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              title="Edit folder"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFolder(folder)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              title="Delete folder"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="card overflow-hidden">
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50 dark:bg-dark-surface">
                          <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Image
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Story
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Folder
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                              Created
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                          {galleryItems.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-3 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center"
                              >
                                No gallery items yet. Use "Add Gallery Item" to create one.
                              </td>
                            </tr>
                          ) : (
                            galleryItems.map((item) => (
                              <tr key={item.id}>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {item.image_url ? (
                                    <img
                                      src={item.image_url}
                                      alt="Gallery item"
                                      className="w-12 h-8 sm:w-16 sm:h-10 object-cover rounded"
                                    />
                                  ) : (
                                    <span className="text-xs text-gray-400">No image</span>
                                  )}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 dark:text-gray-100">
                                  <div className="max-w-xs sm:max-w-md truncate">
                                    {item.story}
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  {getFolderNameById(item.folder_id)}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex gap-1 sm:gap-2">
                                    <button
                                      onClick={() => openEditGalleryModal(item)}
                                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded touch-target"
                                      title="Edit Gallery Item"
                                    >
                                      <Edit size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteGalleryItem(item)}
                                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded touch-target"
                                      title="Delete Gallery Item"
                                    >
                                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Projects
                    </h2>
                    <button
                      onClick={() => setShowProjectModal(true)}
                      className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <Plus size={18} className="sm:w-5 sm:h-5" />
                      <span>Add Project</span>
                    </button>
                  </div>

                  <div className="card overflow-hidden">
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50 dark:bg-dark-surface">
                          <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                              Category
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                              Image
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Featured
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                              Created
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                          {projects.map((project) => (
                            <tr key={project.id}>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                <div className="max-w-[150px] sm:max-w-none truncate">{project.title}</div>
                                <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {Array.isArray(project.category) ? project.category.join(', ') : project.category}
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                                <div className="flex flex-wrap gap-1">
                                  {Array.isArray(project.category) ? 
                                    project.category.map((cat) => (
                                      <span key={cat} className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full">
                                        {cat}
                                      </span>
                                    )) : 
                                    <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full">
                                      {project.category}
                                    </span>
                                  }
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                                {project.image_url ? (
                                  <ProjectImage src={project.image_url} alt={project.title} className="w-10 h-6 sm:w-12 sm:h-8 object-cover rounded" />
                                ) : (
                                  <span className="text-gray-400 text-xs">No image</span>
                                )}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <button
                                  onClick={() => toggleProjectFeatured(project)}
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors touch-target ${
                                    project.featured 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  <span className="hidden sm:inline">{project.featured ? 'Featured' : 'Not Featured'}</span>
                                  <span className="sm:hidden">{project.featured ? '★' : '☆'}</span>
                                </button>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                                {new Date(project.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-1 sm:gap-2">
                                  <button 
                                    onClick={() => openEditProjectModal(project)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded touch-target"
                                    title="Edit Project"
                                  >
                                    <Edit size={14} className="sm:w-4 sm:h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProject(project.id)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded touch-target"
                                    title="Delete Project"
                                  >
                                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'experience' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Experience & Education
                    </h2>
                    <button
                      onClick={() => setShowExperienceModal(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Add Experience
                    </button>
                  </div>

                  <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-dark-surface">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Company
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Current
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                          {experiences.map((experience) => (
                            <tr key={experience.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                {experience.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {experience.company}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  experience.type === 'work' 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                }`}>
                                  {experience.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => toggleExperienceCurrent(experience)}
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                                    experience.current 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  {experience.current ? 'Current' : 'Past'}
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => openEditExperienceModal(experience)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                    title="Edit Experience"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteExperience(experience.id)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'certifications' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Certificates & Awards
                    </h2>
                    <button
                      onClick={() => {
                        setEditingCertification(null)
                        setCertificationForm({ title: '', issuer: '', date: '', credential_id: '', url: '' })
                        setShowCertificationModal(true)
                      }}
                      className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <Plus size={18} className="sm:w-5 sm:h-5" />
                      <span>Add Certification/Award</span>
                    </button>
                  </div>

                  <div className="card overflow-hidden">
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50 dark:bg-dark-surface">
                          <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Issuer
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                              Date
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                              Credential ID
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                          {certifications.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-3 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center"
                              >
                                No certifications or awards yet. Use "Add Certification/Award" to create one.
                              </td>
                            </tr>
                          ) : (
                            certifications.map((certification) => (
                              <tr key={certification.id}>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                  <div className="max-w-[220px] truncate">
                                    {certification.title}
                                  </div>
                                  <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {certification.issuer}
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                                  {certification.issuer}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                                  {certification.date || '—'}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                                  {certification.credential_id || '—'}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex gap-1 sm:gap-2">
                                    <button
                                      onClick={() => handleEditCertification(certification)
                                      }
                                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded touch-target"
                                      title="Edit Certification"
                                    >
                                      <Edit size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCertification(certification.id)}
                                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded touch-target"
                                      title="Delete Certification"
                                    >
                                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'statistics' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Home Page Statistics
                    </h2>
                    <button
                      onClick={() => setShowStatisticsModal(true)}
                      className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <Plus size={18} className="sm:w-5 sm:h-5" />
                      <span>Add Statistic</span>
                    </button>
                  </div>

                  <div className="card overflow-hidden">
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <table className="w-full min-w-[500px]">
                        <thead className="bg-gray-50 dark:bg-dark-surface">
                          <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Number
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Label
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                              Order
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                          {statistics.map((statistic) => (
                            <tr key={statistic.id}>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {editingStatistic?.id === statistic.id ? (
                                  <input
                                    type="text"
                                    value={editingStatistic.number}
                                    onChange={(e) => setEditingStatistic({...editingStatistic, number: e.target.value})}
                                    className="w-20 px-2 py-1 text-sm border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100"
                                    onBlur={() => handleEditStatistic(editingStatistic)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleEditStatistic(editingStatistic)}
                                    autoFocus
                                  />
                                ) : (
                                  <span 
                                    onClick={() => setEditingStatistic(statistic)}
                                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                                  >
                                    {statistic.number}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400">
                                {editingStatistic?.id === statistic.id ? (
                                  <input
                                    type="text"
                                    value={editingStatistic.label}
                                    onChange={(e) => setEditingStatistic({...editingStatistic, label: e.target.value})}
                                    className="w-full px-2 py-1 text-sm border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100"
                                    onBlur={() => handleEditStatistic(editingStatistic)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleEditStatistic(editingStatistic)}
                                  />
                                ) : (
                                  <span 
                                    onClick={() => setEditingStatistic(statistic)}
                                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                                  >
                                    {statistic.label}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                                {editingStatistic?.id === statistic.id ? (
                                  <input
                                    type="number"
                                    value={editingStatistic.order}
                                    onChange={(e) => setEditingStatistic({...editingStatistic, order: parseInt(e.target.value)})}
                                    className="w-16 px-2 py-1 text-sm border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100"
                                    onBlur={() => handleEditStatistic(editingStatistic)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleEditStatistic(editingStatistic)}
                                  />
                                ) : (
                                  <span 
                                    onClick={() => setEditingStatistic(statistic)}
                                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                                  >
                                    {statistic.order}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-1 sm:gap-2">
                                  <button 
                                    onClick={() => setEditingStatistic(statistic)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded touch-target"
                                    title="Edit Statistic"
                                  >
                                    <Edit size={14} className="sm:w-4 sm:h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteStatistic(statistic.id)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded touch-target"
                                    title="Delete Statistic"
                                  >
                                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="mt-8 card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                      Live Preview - How it appears on Home page
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6 text-center p-4 lg:p-6 bg-gray-50 dark:bg-dark-surface rounded-lg">
                      {statistics.map((stat, index) => (
                        <div key={stat.id} className="space-y-2">
                          <h3 className="text-3xl md:text-4xl font-bold text-gradient dark:text-gradient-dark">
                            {stat.number}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 font-medium">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Contact Messages
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage messages submitted through the Contact page
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleRefreshMessages}
                        disabled={messagesRefreshing}
                        className="btn-secondary flex items-center gap-2 disabled:opacity-60 min-w-[110px] justify-center"
                      >
                        {messagesRefreshing ? 'Refreshing...' : 'Refresh'}
                      </button>
                      <div className="px-4 py-2 bg-gray-100 dark:bg-dark-card rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-dark-border/70">
                        Total: {messages.length}
                      </div>
                    </div>
                  </div>

                  {messages.length === 0 ? (
                    <div className="card text-center py-12">
                      <p className="text-gray-600 dark:text-gray-400">
                        No messages yet. Once someone submits the contact form, their message will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-5 items-stretch">
                      <div className="card flex flex-col gap-4 p-4 border border-gray-200 dark:border-dark-border/70">
                        <div className="hidden lg:block overflow-x-auto">
                          <table className="w-full min-w-[500px] rounded-xl overflow-hidden">
                            <thead className="bg-gray-50 dark:bg-dark-surface">
                              <tr>
                                <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sender</th>
                                <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                                <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Received</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                              {messages.map((message) => (
                                <tr
                                  key={message.id}
                                  className={`cursor-pointer transition-colors ${
                                    selectedMessage?.id === message.id
                                      ? 'bg-red-50 dark:bg-red-900/10'
                                      : 'hover:bg-gray-50 dark:hover:bg-dark-card'
                                  }`}
                                  onClick={() => setSelectedMessage(message)}
                                >
                                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    <div className="font-medium truncate max-w-[200px]">
                                      {message.name || 'Unknown'}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate max-w-[220px]">
                                      {message.email}
                                    </p>
                                  </td>
                                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="truncate max-w-[260px]">{message.subject || '—'}</div>
                                  </td>
                                  <td className="px-3 sm:px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    {formatDateTime(message.created_at)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="lg:hidden space-y-3 flex-1">
                          {messages.map((message) => {
                            const isActive = selectedMessage?.id === message.id
                            return (
                              <button
                                key={message.id}
                                type="button"
                                onClick={() => setSelectedMessage(message)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${
                                  isActive
                                    ? 'border-primary-500 bg-primary-50 dark:bg-emerald-900/20'
                                    : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{message.name || 'Unknown'}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{message.email}</p>
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDateTime(message.created_at)}</span>
                                </div>
                                {message.subject && (
                                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{message.subject}</p>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="card h-full flex flex-col p-4 border border-gray-200 dark:border-dark-border/70">
                        {selectedMessage ? (
                          <div className="space-y-5 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">From</p>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedMessage.name}</h3>
                                <a
                                  href={`mailto:${selectedMessage.email}`}
                                  className="text-sm text-primary-600 dark:text-emerald-400 break-all"
                                >
                                  {selectedMessage.email}
                                </a>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:justify-end">
                                <a
                                  href={buildGmailComposeLink(selectedMessage)}
                                  className="btn-primary text-center text-sm"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Reply in Gmail
                                </a>
                                <a
                                  href={buildOutlookComposeLink(selectedMessage)}
                                  className="btn-secondary text-center text-sm"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Reply in Outlook
                                </a>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border">
                                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Subject</p>
                                <p className="text-sm text-gray-900 dark:text-gray-100">{selectedMessage.subject || '—'}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border">
                                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Received</p>
                                <p className="text-sm text-gray-900 dark:text-gray-100">{formatDateTime(selectedMessage.created_at)}</p>
                              </div>
                            </div>

                            <div className="flex-1">
                              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Message</p>
                              <div className="p-4 bg-gray-50 dark:bg-dark-card rounded-2xl text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm min-h-[140px] h-full border border-gray-100 dark:border-dark-border">
                                {selectedMessage.message}
                              </div>
                            </div>

                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-600 dark:text-gray-400 flex-1 flex items-center justify-center">
                            Select a message to view details
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'resume' && (
                <div className="space-y-4">
                  <div className="flex flex-col mb-4 sm:mb-6 gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Resume Management
                    </h2>
                    <div className="border-b border-gray-200 dark:border-gray-700">
                      <nav className="-mb-px flex space-x-4" aria-label="Resume profiles">
                        <button
                          type="button"
                          onClick={() => setActiveResumeProfile('fullstack')}
                          className={`whitespace-nowrap border-b-2 px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                            activeResumeProfile === 'fullstack'
                              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'
                          }`}
                        >
                          Full Stack Resume
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveResumeProfile('uiux')}
                          className={`whitespace-nowrap border-b-2 px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                            activeResumeProfile === 'uiux'
                              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'
                          }`}
                        >
                          UI/UX Resume
                        </button>
                      </nav>
                    </div>
                  </div>

                  <div className="card mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Current Resume – {activeResumeProfileLabel} Profile
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <File size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {currentResumeProfileData.filename}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {currentResumeProfileData.resume_url === '/resume.pdf' ? 'Default resume' : 'Custom uploaded resume'}
                            </p>
                            {currentResumeProfileData.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {currentResumeProfileData.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <a
                          href={currentResumeProfileData.resume_url}
                          download={currentResumeProfileData.filename}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary flex items-center gap-2"
                          onClick={(e) => {
                            // Force download instead of opening in browser
                            e.preventDefault()
                            resumeAPI.forceDownload(currentResumeProfileData.resume_url, currentResumeProfileData.filename)
                          }}
                        >
                          <Download size={16} />
                          Download
                        </a>
                        
                        <label className="btn-secondary flex items-center gap-2 cursor-pointer">
                          <Upload size={16} />
                          {uploadingResume ? 'Replacing...' : 'Replace File'}
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleReplaceResume}
                            disabled={uploadingResume}
                            className="hidden"
                          />
                        </label>

                        {currentResumeProfileData.resume_url !== '/resume.pdf' && (
                          <button
                            onClick={handleDeleteResume}
                            className="btn-danger flex items-center gap-2"
                            title="Delete custom resume and revert to default"
                            disabled={uploadingResume}
                          >
                            <Trash2 size={16} />
                            Remove Custom
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upload New Resume */}
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                      Upload New Resume
                    </h3>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <Upload size={32} className="text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                              Upload Resume File
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                              Supported formats: PDF, DOC, DOCX (Max 5MB)
                            </p>
                            <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
                              <Upload size={16} />
                              {uploadingResume ? 'Uploading...' : 'Choose File'}
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeUpload}
                                disabled={uploadingResume}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {selectedResumeFile && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <div className="flex items-center gap-3">
                            <File size={20} className="text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="font-medium text-blue-900 dark:text-blue-100">
                                {selectedResumeFile.name}
                              </p>
                              <p className="text-sm text-blue-600 dark:text-blue-400">
                                {(selectedResumeFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {uploadingResume && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                            <p className="text-yellow-800 dark:text-yellow-200">
                              Uploading resume... Please wait.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mx-2 sm:mx-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      📋 Instructions
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• <strong>Edit Details:</strong> Click "Edit" to modify filename and description</li>
                      <li>• <strong>Replace File:</strong> Use "Replace File" to upload a new version</li>
                      <li>• <strong>Upload New:</strong> Drag & drop or click to upload first-time resume</li>
                      <li>• <strong>Real-time Updates:</strong> All changes reflect immediately on Home page</li>
                      <li>• <strong>Remove Custom:</strong> Delete uploaded resume to revert to default</li>
                      <li>• <strong>Supported Formats:</strong> PDF, DOC, DOCX (max 5MB)</li>
                    </ul>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Certifications Modal */}
      {showCertificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {editingCertification ? 'Edit Certification / Award' : 'Add Certification / Award'}
            </h3>
            <form onSubmit={handleSaveCertification} className="space-y-4">
              <input
                type="text"
                placeholder="Title (e.g., Full-Stack Web Development Bootcamp)"
                value={certificationForm.title}
                onChange={(e) => setCertificationForm({ ...certificationForm, title: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <input
                type="text"
                placeholder="Issuer (e.g., Udemy, University, Organization)"
                value={certificationForm.issuer}
                onChange={(e) => setCertificationForm({ ...certificationForm, issuer: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <input
                type="date"
                placeholder="Date"
                value={certificationForm.date}
                onChange={(e) => setCertificationForm({ ...certificationForm, date: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <input
                type="text"
                placeholder="Credential ID or Note (optional)"
                value={certificationForm.credential_id}
                onChange={(e) => setCertificationForm({ ...certificationForm, credential_id: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <input
                type="url"
                placeholder="Certificate URL (optional)"
                value={certificationForm.url}
                onChange={(e) => setCertificationForm({ ...certificationForm, url: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingCertification ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCertificationModal(false)
                    setEditingCertification(null)
                    setCertificationForm({ title: '', issuer: '', date: '', credential_id: '', url: '' })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Add New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <input
                type="text"
                placeholder="Project Title"
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <textarea
                placeholder="Description"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows="3"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Type
                </label>
                <select
                  value={projectForm.project_type || 'fullstack'}
                  onChange={(e) => setProjectForm({ ...projectForm, project_type: e.target.value })}
                  className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="fullstack">Full Stack (Development)</option>
                  <option value="uiux">UI/UX Design</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categories (Select multiple)
                </label>
                <div className="space-y-2">
                  {['Full Stack', 'Frontend', 'Backend', 'Mobile', 'AI/ML', 'DevOps'].map((category) => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={projectForm.category.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 dark:text-emerald-600 focus:ring-primary-500 dark:focus:ring-emerald-500"
                      />
                      <span className="text-gray-900 dark:text-gray-100">{category}</span>
                    </label>
                  ))}
                </div>
                {projectForm.category.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {projectForm.category.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-emerald-900/20 text-primary-800 dark:text-emerald-200 text-xs rounded-full"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => handleCategoryChange(cat)}
                          className="hover:text-primary-600 dark:hover:text-emerald-400"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Technologies Used
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={technologyInput}
                    onChange={(e) => setTechnologyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleTechnologyAdd()
                      }
                    }}
                    placeholder="e.g., React, Node.js, Supabase"
                    className="flex-1 input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleTechnologyAdd}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Add Tech
                  </button>
                </div>
                {Array.isArray(projectForm.technologies) && projectForm.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {projectForm.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-emerald-900/20 text-primary-800 dark:text-emerald-200 text-xs rounded-full"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleTechnologyRemove(tech)}
                          className="text-primary-600 dark:text-emerald-400 hover:text-primary-800"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="url"
                placeholder="GitHub URL"
                value={projectForm.github_url}
                onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <input
                type="url"
                placeholder="Demo URL"
                value={projectForm.demo_url}
                onChange={(e) => setProjectForm({ ...projectForm, demo_url: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="w-full p-2 border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <input
                  type="checkbox"
                  checked={projectForm.featured}
                  onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                />
                Featured Project
              </label>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProjectModal(false)
                    setProjectForm(getEmptyProjectForm())
                    setSelectedImage(null)
                    setImagePreview(null)
                    setTechnologyInput('')
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Edit Project</h3>
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <input
                type="text"
                placeholder="Project Title"
                value={projectForm.title}
                onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <textarea
                placeholder="Description"
                value={projectForm.description}
                onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows="3"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Type
                </label>
                <select
                  value={projectForm.project_type || 'fullstack'}
                  onChange={(e) => setProjectForm({ ...projectForm, project_type: e.target.value })}
                  className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="fullstack">Full Stack (Development)</option>
                  <option value="uiux">UI/UX Design</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categories (Select multiple)
                </label>
                <div className="space-y-2">
                  {['Full Stack', 'Frontend', 'Backend', 'Mobile', 'AI/ML', 'DevOps'].map((category) => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={projectForm.category.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 dark:text-emerald-600 focus:ring-primary-500 dark:focus:ring-emerald-500"
                      />
                      <span className="text-gray-900 dark:text-gray-100">{category}</span>
                    </label>
                  ))}
                </div>
                {projectForm.category.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {projectForm.category.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-emerald-900/20 text-primary-800 dark:text-emerald-200 text-xs rounded-full"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => handleCategoryChange(cat)}
                          className="hover:text-primary-600 dark:hover:text-emerald-400"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Technologies Used
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={technologyInput}
                    onChange={(e) => setTechnologyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleTechnologyAdd()
                      }
                    }}
                    placeholder="e.g., React, Node.js, Supabase"
                    className="flex-1 input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleTechnologyAdd}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Add Tech
                  </button>
                </div>
                {Array.isArray(projectForm.technologies) && projectForm.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {projectForm.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-emerald-900/20 text-primary-800 dark:text-emerald-200 text-xs rounded-full"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleTechnologyRemove(tech)}
                          className="text-primary-600 dark:text-emerald-400 hover:text-primary-800"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="url"
                placeholder="GitHub URL"
                value={projectForm.github_url}
                onChange={(e) => setProjectForm({...projectForm, github_url: e.target.value})}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <input
                type="url"
                placeholder="Demo URL"
                value={projectForm.demo_url}
                onChange={(e) => setProjectForm({...projectForm, demo_url: e.target.value})}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <input
                type="url"
                placeholder="Image URL"
                value={projectForm.image_url}
                onChange={(e) => setProjectForm({...projectForm, image_url: e.target.value})}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <label className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <input
                  type="checkbox"
                  checked={projectForm.featured}
                  onChange={(e) => setProjectForm({...projectForm, featured: e.target.checked})}
                />
                Featured Project
              </label>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Update Project</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditProjectModal(false)
                    setEditingProject(null)
                    setProjectForm(getEmptyProjectForm())
                    setTechnologyInput('')
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Create Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Add Gallery Item</h3>
            <form onSubmit={handleCreateGalleryItem} className="space-y-4">
              <textarea
                placeholder="Story text"
                value={galleryForm.story}
                onChange={(e) => setGalleryForm({ ...galleryForm, story: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows="4"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryImageSelect}
                  className="w-full p-2 border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {galleryImagePreview && (
                  <div className="mt-3">
                    <img
                      src={galleryImagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              {galleryFolders.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Folder (optional)
                  </label>
                  <select
                    value={galleryForm.folder_id || ''}
                    onChange={(e) =>
                      setGalleryForm({
                        ...galleryForm,
                        folder_id: e.target.value || null
                      })
                    }
                    className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">No folder</option>
                    {galleryFolders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Create Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGalleryModal(false)
                    setGalleryForm({ story: '', image_url: '', folder_id: null })
                    setGalleryImageFile(null)
                    setGalleryImagePreview(null)
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Edit Modal */}
      {showEditGalleryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Edit Gallery Item</h3>
            <form onSubmit={handleUpdateGalleryItem} className="space-y-4">
              <textarea
                placeholder="Story text"
                value={galleryForm.story}
                onChange={(e) => setGalleryForm({ ...galleryForm, story: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows="4"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryImageSelect}
                  className="w-full p-2 border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {(galleryImagePreview || galleryForm.image_url) && (
                  <div className="mt-3">
                    <img
                      src={galleryImagePreview || galleryForm.image_url}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              {galleryFolders.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Folder (optional)
                  </label>
                  <select
                    value={galleryForm.folder_id || ''}
                    onChange={(e) =>
                      setGalleryForm({
                        ...galleryForm,
                        folder_id: e.target.value || null
                      })
                    }
                    className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">No folder</option>
                    {galleryFolders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Update Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditGalleryModal(false)
                    setEditingGalleryItem(null)
                    setGalleryForm({ story: '', image_url: '', folder_id: null })
                    setGalleryImageFile(null)
                    setGalleryImagePreview(null)
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {editingFolder ? 'Edit Folder' : 'Add Folder'}
            </h3>
            <form onSubmit={handleSaveFolder} className="space-y-4">
              <input
                type="text"
                placeholder="Folder name"
                value={folderForm.name}
                onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={folderForm.color}
                  onChange={(e) => setFolderForm({ ...folderForm, color: e.target.value })}
                  className="w-16 h-10 p-1 bg-transparent border rounded cursor-pointer"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingFolder ? 'Update Folder' : 'Create Folder'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFolderModal(false)
                    setEditingFolder(null)
                    setFolderForm({ name: '', color: '#5227FF' })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {showExperienceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Add New Experience</h3>
            <form onSubmit={handleCreateExperience} className="space-y-4">
              <input
                type="text"
                placeholder="Job Title / Degree"
                value={experienceForm.title}
                onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <input
                type="text"
                placeholder="Company / Institution"
                value={experienceForm.company}
                onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={experienceForm.location}
                onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus-border-primary-500"
              />
              <select
                value={experienceForm.type}
                onChange={(e) => setExperienceForm({ ...experienceForm, type: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="work">Work Experience</option>
                <option value="education">Education</option>
              </select>
              <textarea
                placeholder="Description"
                value={experienceForm.description}
                onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows="3"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Achievements (optional)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={achievementInput}
                    onChange={(e) => setAchievementInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAchievementAdd()
                      }
                    }}
                    placeholder="e.g., Increased sales by 20%, Built internal tooling"
                    className="flex-1 input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAchievementAdd}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Add Achievement
                  </button>
                </div>
                {Array.isArray(experienceForm.achievements) && experienceForm.achievements.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {experienceForm.achievements.map((ach) => (
                      <span
                        key={ach}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-emerald-900/20 text-primary-800 dark:text-emerald-200 text-xs rounded-full"
                      >
                        {ach}
                        <button
                          type="button"
                          onClick={() => handleAchievementRemove(ach)}
                          className="text-primary-600 dark:text-emerald-400 hover:text-primary-800"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Technologies / Skills Used
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={experienceTechInput}
                    onChange={(e) => setExperienceTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleExperienceTechnologyAdd()
                      }
                    }}
                    placeholder="e.g., Java, React, SQL, Data Structures"
                    className="flex-1 input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleExperienceTechnologyAdd}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Add Skill
                  </button>
                </div>
                {Array.isArray(experienceForm.technologies) && experienceForm.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {experienceForm.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-emerald-900/20 text-primary-800 dark:text-emerald-200 text-xs rounded-full"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleExperienceTechnologyRemove(tech)}
                          className="text-primary-600 dark:text-emerald-400 hover:text-primary-800"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  placeholder="Start Date"
                  value={experienceForm.start_date}
                  onChange={(e) => setExperienceForm({ ...experienceForm, start_date: e.target.value })}
                  className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={experienceForm.end_date}
                  onChange={(e) => setExperienceForm({ ...experienceForm, end_date: e.target.value })}
                  className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={experienceForm.current}
                />
              </div>
              <label className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <input
                  type="checkbox"
                  checked={experienceForm.current}
                  onChange={(e) =>
                    setExperienceForm({
                      ...experienceForm,
                      current: e.target.checked,
                      end_date: e.target.checked ? '' : experienceForm.end_date
                    })
                  }
                />
                Currently Working/Studying Here
              </label>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Create Experience
                </button>
                <button
                  type="button"
                  onClick={() => setShowExperienceModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Experience Modal */}
      {showEditExperienceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Edit Experience</h3>
            <form onSubmit={handleUpdateExperience} className="space-y-4">
              <input
                type="text"
                placeholder="Job Title / Degree"
                value={experienceForm.title}
                onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <input
                type="text"
                placeholder="Company / Institution"
                value={experienceForm.company}
                onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={experienceForm.location}
                onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <select
                value={experienceForm.type}
                onChange={(e) => setExperienceForm({ ...experienceForm, type: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="work">Work Experience</option>
                <option value="education">Education</option>
              </select>
              <textarea
                placeholder="Description"
                value={experienceForm.description}
                onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows="3"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Achievements (optional)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={achievementInput}
                    onChange={(e) => setAchievementInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAchievementAdd()
                      }
                    }}
                    placeholder="e.g., Increased sales by 20%, Built internal tooling"
                    className="flex-1 input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAchievementAdd}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Add Achievement
                  </button>
                </div>
                {Array.isArray(experienceForm.achievements) && experienceForm.achievements.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {experienceForm.achievements.map((ach) => (
                      <span
                        key={ach}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-emerald-900/20 text-primary-800 dark:text-emerald-200 text-xs rounded-full"
                      >
                        {ach}
                        <button
                          type="button"
                          onClick={() => handleAchievementRemove(ach)}
                          className="text-primary-600 dark:text-emerald-400 hover:text-primary-800"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Technologies / Skills Used
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={experienceTechInput}
                    onChange={(e) => setExperienceTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleExperienceTechnologyAdd()
                      }
                    }}
                    placeholder="e.g., Java, React, SQL, Data Structures"
                    className="flex-1 input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleExperienceTechnologyAdd}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Add Skill
                  </button>
                </div>
                {Array.isArray(experienceForm.technologies) && experienceForm.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {experienceForm.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-emerald-900/20 text-primary-800 dark:text-emerald-200 text-xs rounded-full"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleExperienceTechnologyRemove(tech)}
                          className="text-primary-600 dark:text-emerald-400 hover:text-primary-800"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  placeholder="Start Date"
                  value={experienceForm.start_date}
                  onChange={(e) => setExperienceForm({ ...experienceForm, start_date: e.target.value })}
                  className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={experienceForm.end_date}
                  onChange={(e) => setExperienceForm({ ...experienceForm, end_date: e.target.value })}
                  className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={experienceForm.current}
                />
              </div>
              <label className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <input
                  type="checkbox"
                  checked={experienceForm.current}
                  onChange={(e) =>
                    setExperienceForm({
                      ...experienceForm,
                      current: e.target.checked,
                      end_date: e.target.checked ? '' : experienceForm.end_date
                    })
                  }
                />
                Currently Active
              </label>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Update Experience
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditExperienceModal(false)
                    setEditingExperience(null)
                    setExperienceForm({
                      title: '',
                      company: '',
                      location: '',
                      type: 'work',
                      description: '',
                      achievements: [],
                      technologies: [],
                      start_date: '',
                      end_date: '',
                      current: false
                    })
                    setAchievementInput('')
                    setExperienceTechInput('')
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatisticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Add New Statistic</h3>
            <form onSubmit={handleCreateStatistic} className="space-y-4">
              <input
                type="text"
                placeholder="Number (e.g., 5+, 100, 2.5K)"
                value={statisticForm.number}
                onChange={(e) => setStatisticForm({...statisticForm, number: e.target.value})}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <input
                type="text"
                placeholder="Label (e.g., Projects Completed)"
                value={statisticForm.label}
                onChange={(e) => setStatisticForm({...statisticForm, label: e.target.value})}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <input
                type="number"
                placeholder="Display Order"
                value={statisticForm.order}
                onChange={(e) => setStatisticForm({...statisticForm, order: parseInt(e.target.value)})}
                className="input-responsive border rounded dark:bg-dark-card dark:border-dark-border dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                min="1"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Create Statistic</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowStatisticsModal(false)
                    setStatisticForm({ number: '', label: '', order: 1 })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminDashboard

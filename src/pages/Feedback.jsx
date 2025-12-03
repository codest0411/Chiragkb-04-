import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Star, Send, X, User, Mail, MessageSquare, Smile, Heart, MessageCircle } from 'lucide-react'
import { feedbackAPI, commentsAPI } from '../utils/supabase'
import GitHubStarButton from '../components/GitHubStarButton'

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback_text: '',
    rating: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [joke, setJoke] = useState('')
  const [comments, setComments] = useState([])
  const [commentForm, setCommentForm] = useState({ name: '', email: '', comment_text: '' })
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [userLikes, setUserLikes] = useState([])
  const [userIdentifier, setUserIdentifier] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateUserIdentifier()
  }, [])

  useEffect(() => {
    if (userIdentifier) {
      loadComments()
    }
  }, [userIdentifier])

  const generateUserIdentifier = () => {
    // Generate a unique identifier for the user session
    let identifier = localStorage.getItem('userIdentifier')
    if (!identifier) {
      identifier = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('userIdentifier', identifier)
    }
    setUserIdentifier(identifier)
  }

  const loadComments = async () => {
    try {
      const data = await commentsAPI.getApproved()
      const approvedComments = (data || []).filter(comment => comment.status === 'approved')
      setComments(approvedComments)
      
      // Load user likes
      if (userIdentifier) {
        const likes = await commentsAPI.getUserLikes(userIdentifier)
        setUserLikes(likes)
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
      setComments([]) // Show empty state instead of fallback data
    } finally {
      setLoading(false)
    }
  }

  const fetchJoke = async () => {
    try {
      const response = await fetch('https://official-joke-api.appspot.com/random_joke')
      const jokeData = await response.json()
      setJoke(`${jokeData.setup} - ${jokeData.punchline}`)
    } catch (error) {
      console.error('Failed to fetch joke:', error)
      setJoke("Why don't scientists trust atoms? Because they make up everything! 😄")
    }
  }

  const validateName = (name) => {
    const bannedNames = ['anonymous', 'anon', 'guest', 'user', 'unknown', 'test', 'admin']
    const cleanName = name.toLowerCase().trim()
    
    if (cleanName.length < 2) {
      return 'Name must be at least 2 characters long'
    }
    
    if (bannedNames.includes(cleanName)) {
      return 'Please enter your real name'
    }
    
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return 'Name should only contain letters and spaces'
    }
    
    return null
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCommentInputChange = (e) => {
    const { name, value } = e.target
    setCommentForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const nameError = validateName(formData.name)
    if (nameError) {
      alert(nameError)
      return
    }
    
    if (!formData.feedback_text.trim() || formData.rating === 0) {
      alert('Please fill in all required fields and provide a rating')
      return
    }

    setIsSubmitting(true)

    try {
      const newFeedback = await feedbackAPI.create({
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        feedback_text: formData.feedback_text.trim(),
        rating: formData.rating
      })

      // Feedback is now only stored in admin, not displayed publicly

      // Reset form
      setFormData({
        name: '',
        email: '',
        feedback_text: '',
        rating: 0
      })

      // Fetch joke and show success modal
      await fetchJoke()
      setShowSuccessModal(true)

    } catch (error) {
      console.error('Failed to submit feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    
    const nameError = validateName(commentForm.name)
    if (nameError) {
      alert(nameError)
      return
    }

    if (!commentForm.comment_text.trim()) {
      alert('Please enter your comment')
      return
    }

    setIsSubmittingComment(true)

    try {
      const newComment = await commentsAPI.create({
        name: commentForm.name.trim(),
        email: commentForm.email.trim() || null,
        comment_text: commentForm.comment_text.trim()
      })

      // Reset form
      setCommentForm({ name: '', email: '', comment_text: '' })
      
      // Show success message
      alert('Comment submitted successfully! It will appear after admin approval.')
      
    } catch (error) {
      console.error('Failed to submit comment:', error)
      alert('Failed to submit comment. Please try again.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleLikeComment = async (commentId) => {
    if (!userIdentifier) return
    
    try {
      const result = await commentsAPI.likeComment(commentId, userIdentifier)
      
      // Update local state
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes: result.liked ? comment.likes + 1 : comment.likes - 1 }
          : comment
      ))
      
      // Update user likes
      setUserLikes(prev => 
        result.liked 
          ? [...prev, commentId]
          : prev.filter(id => id !== commentId)
      )
      
    } catch (error) {
      console.error('Failed to like comment:', error)
    }
  }


  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Recently'
    }
  }

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onStarClick(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            disabled={!interactive}
          >
            <Star
              size={interactive ? 24 : 16}
              className={`${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Feedback - Portfolio</title>
        <meta name="description" content="Share your feedback about my portfolio and projects" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-gray-900 pt-6 pb-12">
        <div className="container-custom section-padding">
          {/* GitHub Star Button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <GitHubStarButton />
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Share Your <span className="text-gradient">Feedback</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Your thoughts and suggestions help me improve. I'd love to hear what you think about my work!
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Feedback Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-green-900/20 rounded-2xl shadow-xl p-4 border-2 border-green-200 dark:border-green-800"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <MessageSquare className="text-green-600 dark:text-green-400" />
                  Leave Feedback
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Your feedback helps me improve! Share your thoughts about my portfolio.
                </p>

                <form onSubmit={handleSubmit} className="space-y-2">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name * (Real name required)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={(e) => {
                          const error = validateName(e.target.value)
                          if (error) {
                            e.target.setCustomValidity(error)
                          } else {
                            e.target.setCustomValidity('')
                          }
                        }}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-green-300 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 dark:bg-gray-800/50 dark:text-gray-100 transition-colors"
                        placeholder="Your real name (no anonymous names)"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-green-300 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 dark:bg-gray-800/50 dark:text-gray-100 transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rating *
                    </label>
                    <div className="flex items-center gap-2">
                      {renderStars(formData.rating, true, handleRatingClick)}
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        {formData.rating > 0 ? `${formData.rating}/5` : 'Select rating'}
                      </span>
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div>
                    <label htmlFor="feedback_text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Feedback *
                    </label>
                    <textarea
                      id="feedback_text"
                      name="feedback_text"
                      value={formData.feedback_text}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-green-300 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 dark:bg-gray-800/50 dark:text-gray-100 transition-colors resize-none"
                      placeholder="Share your thoughts about my portfolio, projects, or any suggestions for improvement..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white font-semibold py-2 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </form>
              </motion.div>

              {/* Comment Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900/20 rounded-2xl shadow-xl p-6 border-2 border-purple-200 dark:border-purple-800"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <MessageCircle className="text-purple-600 dark:text-purple-400" />
                  Leave a Comment
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Comments are reviewed by admin before appearing publicly.
                </p>

                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="comment-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name * (Real name required)
                      </label>
                      <input
                        type="text"
                        id="comment-name"
                        name="name"
                        value={commentForm.name}
                        onChange={handleCommentInputChange}
                        onBlur={(e) => {
                          const error = validateName(e.target.value)
                          if (error) {
                            e.target.setCustomValidity(error)
                          } else {
                            e.target.setCustomValidity('')
                          }
                        }}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-surface dark:text-gray-100 transition-colors"
                        placeholder="Your real name"
                      />
                    </div>
                    <div>
                      <label htmlFor="comment-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        id="comment-email"
                        name="email"
                        value={commentForm.email}
                        onChange={handleCommentInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-surface dark:text-gray-100 transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="comment-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comment *
                    </label>
                    <textarea
                      id="comment-text"
                      name="comment_text"
                      value={commentForm.comment_text}
                      onChange={handleCommentInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-surface dark:text-gray-100 transition-colors resize-none"
                      placeholder="Share your thoughts..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingComment}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 dark:from-emerald-500 dark:to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 dark:hover:from-emerald-600 dark:hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmittingComment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Post Comment
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Visible Comments List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/90 dark:bg-gray-800/60 rounded-2xl shadow-xl p-6 border border-purple-200 dark:border-purple-800"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <MessageCircle className="text-purple-600 dark:text-purple-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Comments ({comments.length})
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Approved comments from the community
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                      className="bg-white/90 dark:bg-gray-700/50 rounded-lg p-4 border border-purple-200 dark:border-purple-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {comment.name}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleLikeComment(comment.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                            userLikes.includes(comment.id)
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <Heart 
                            size={12} 
                            className={userLikes.includes(comment.id) ? 'fill-current' : ''} 
                          />
                          {comment.likes}
                        </motion.button>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {comment.comment_text}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Modal with Joke */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                  <Smile className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Thank you for your feedback!
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your feedback has been submitted successfully.
                </p>

                {joke && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                      Here's a little joke for you:
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300 mt-2 italic">
                      {joke}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 dark:from-emerald-500 dark:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-primary-700 hover:to-primary-800 dark:hover:from-emerald-600 dark:hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Feedback

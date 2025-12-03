import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, MessageCircle, Github, Linkedin, Instagram, RefreshCw, Save } from 'lucide-react'
import { useLinks } from '../contexts/LinksContext'

export const LinksManager = ({ variant = 'full' }) => {
  const compact = variant === 'embedded'
  const { links, updateContactLinks, updateSocialLinks, resetLinks } = useLinks()
  const [contactForm, setContactForm] = useState(links.contact)
  const [socialForm, setSocialForm] = useState(links.social)
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState(null)

  useEffect(() => {
    setContactForm(links.contact)
    setSocialForm(links.social)
  }, [links])

  const handleContactChange = (field) => (event) => {
    setContactForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSocialChange = (field) => (event) => {
    setSocialForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setStatusMessage(null)

    try {
      updateContactLinks(contactForm)
      updateSocialLinks(socialForm)
      setStatusMessage({ type: 'success', text: 'Links updated successfully! The site now uses the latest data.' })
    } catch (error) {
      console.error('Failed to update links', error)
      setStatusMessage({ type: 'error', text: 'Failed to update links. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('Reset all saved contact & social links to their default values?')) {
      resetLinks()
      setStatusMessage({ type: 'success', text: 'Links reset to defaults.' })
    }
  }

  return (
    <div className={`space-y-8 ${compact ? '' : 'animate-in fade-in zoom-in'}`}>
      {statusMessage && (
        <div
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
            statusMessage.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? <Save size={16} /> : <RefreshCw size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-10">
        <section className={`card ${compact ? 'p-4 sm:p-6' : 'p-6 md:p-8'} space-y-6`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Contact Details</h2>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-dark-border dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <RefreshCw size={14} />
                  Reset
                </button>
          </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Mail size={16} /> Email
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={handleContactChange('email')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Phone size={16} /> Phone
                  </label>
                  <input
                    type="text"
                    value={contactForm.phone}
                    onChange={handleContactChange('phone')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MessageCircle size={16} /> WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={contactForm.whatsappNumber}
                    onChange={handleContactChange('whatsappNumber')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Instagram size={16} /> Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={contactForm.instagramHandle}
                    onChange={handleContactChange('instagramHandle')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:focus:ring-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MapPin size={16} /> Location Text
                  </label>
                  <input
                    type="text"
                    value={contactForm.location}
                    onChange={handleContactChange('location')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:focus:ring-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Google Maps Link</label>
                  <input
                    type="text"
                    value={contactForm.locationMapUrl}
                    onChange={handleContactChange('locationMapUrl')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:focus:ring-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Directions Link</label>
                  <input
                    type="text"
                    value={contactForm.locationDirectionsUrl}
                    onChange={handleContactChange('locationDirectionsUrl')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:focus:ring-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Map Embed URL</label>
                  <input
                    type="text"
                    value={contactForm.locationEmbedUrl}
                    onChange={handleContactChange('locationEmbedUrl')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:focus:ring-emerald-500"
                  />
                </div>
              </div>
            </section>

        <section className={`card ${compact ? 'p-4 sm:p-6' : 'p-6 md:p-8'} space-y-6`}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Social Profiles</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Github size={16} /> GitHub
                  </label>
                  <input
                    type="text"
                    value={socialForm.github}
                    onChange={handleSocialChange('github')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Linkedin size={16} /> LinkedIn
                  </label>
                  <input
                    type="text"
                    value={socialForm.linkedin}
                    onChange={handleSocialChange('linkedin')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Mail size={16} /> Email Link (mailto)
                  </label>
                  <input
                    type="text"
                    value={socialForm.email}
                    onChange={handleSocialChange('email')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Instagram size={16} /> Instagram URL
                  </label>
                  <input
                    type="text"
                    value={socialForm.instagram}
                    onChange={handleSocialChange('instagram')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:focus:ring-emerald-500"
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-dark-border dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <RefreshCw size={16} />
                Reset
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Links
                  </>
                )}
              </button>
            </div>
          </form>
    </div>
  )
}

const LinksAdmin = () => (
  <>
    <Helmet>
      <title>Manage Links - Admin</title>
    </Helmet>

    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container-custom max-w-5xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Manage Links</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
            Update the contact details and social profiles displayed across your portfolio. Changes are stored locally
            and reflected on the Contact page instantly.
          </p>
        </motion.div>

        <LinksManager />
      </div>
    </div>
  </>
)

export default LinksAdmin

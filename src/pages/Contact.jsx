import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { Mail, Phone, MapPin, Send, Github, Linkedin, Instagram, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react'
import { messagesAPI } from '../utils/supabase'
import { useLinks } from '../contexts/LinksContext'

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { links } = useLinks()
  const { contact: contactLinks, social: socialLinksData } = links

  const formattedPhoneForHref = contactLinks?.phone?.replace(/[^+\d]/g, '') || ''
  const whatsappNumber = contactLinks?.whatsappNumber || formattedPhoneForHref.replace(/\D/g, '')
  const instagramHandle = contactLinks?.instagramHandle || socialLinksData?.instagram?.split('.com/')[1] || ''

  const contactInfo = useMemo(() => (
    [
      {
        icon: Mail,
        label: 'Email',
        value: contactLinks.email,
        href: `mailto:${contactLinks.email}`
      },
      {
        icon: Phone,
        label: 'Phone',
        value: contactLinks.phone,
        href: `tel:${formattedPhoneForHref}`
      },
      {
        icon: MapPin,
        label: 'Location',
        value: contactLinks.location,
        href: contactLinks.locationMapUrl
      }
    ]
  ), [contactLinks, formattedPhoneForHref])

  const handleWhatsAppClick = () => {
    if (typeof window === 'undefined') return

    const message = encodeURIComponent("Hi Chirag, I'm reaching out from your portfolio site.")
    const mobileDeepLink = `whatsapp://send?phone=${whatsappNumber}&text=${message}`
    const desktopLink = `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`
    const fallbackLink = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`

    const userAgent = navigator.userAgent || ''
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || (navigator.maxTouchPoints > 2 && /Macintosh/i.test(userAgent))

    if (isMobile) {
      let fallbackTimeout = setTimeout(() => {
        window.location.href = fallbackLink
      }, 1200)

      window.location.href = mobileDeepLink

      window.addEventListener(
        'blur',
        () => {
          clearTimeout(fallbackTimeout)
          fallbackTimeout = null
        },
        { once: true }
      )
    } else {
      window.open(desktopLink, '_blank', 'noopener,noreferrer')
    }
  }

  const handleInstagramClick = () => {
    if (typeof window === 'undefined') return

    const username = instagramHandle
    const appLink = `instagram://user?username=${username}`
    const webLink = `https://www.instagram.com/${username}`

    const userAgent = navigator.userAgent || ''
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || (navigator.maxTouchPoints > 2 && /Macintosh/i.test(userAgent))

    if (isMobile) {
      let fallbackTimeout = setTimeout(() => {
        window.location.href = webLink
      }, 1200)

      window.location.href = appLink

      window.addEventListener(
        'blur',
        () => {
          clearTimeout(fallbackTimeout)
          fallbackTimeout = null
        },
        { once: true }
      )
    } else {
      window.open(webLink, '_blank', 'noopener,noreferrer')
    }
  }

  const socialLinks = useMemo(() => ([
    { icon: Github, href: socialLinksData.github, label: 'GitHub' },
    { icon: Linkedin, href: socialLinksData.linkedin, label: 'LinkedIn' },
    { icon: Mail, href: socialLinksData.email, label: 'Email' },
    { icon: Instagram, label: 'Instagram', onClick: handleInstagramClick }
  ]), [socialLinksData, handleInstagramClick])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      await messagesAPI.create({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message
      })

      setSubmitStatus('success')
      reset()
    } catch (error) {
      console.error('Error storing message:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact Me - Portfolio</title>
        <meta name="description" content="Get in touch with me for collaborations, opportunities, or just to say hello." />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="section-padding py-20 hero-bg">
          <div className="container-custom">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center max-w-4xl mx-auto"
            >
              <motion.h1
                variants={itemVariants}
                className="text-4xl md:text-6xl font-bold mb-6"
              >
                Let's <span className="text-gradient dark:text-gradient-dark">Connect</span>
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed"
              >
                Have a project in mind or just want to chat? I'd love to hear from you!
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="section-padding py-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Get in Touch</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                    I'm always open to discussing new opportunities, creative projects, or potential collaborations.
                    Whether you have a question or just want to say hi, I'll try my best to get back to you!
                  </p>
                </div>

                <div className="space-y-6">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWhatsAppClick}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/30 transition-colors">
                      <MessageCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500 dark:text-gray-500">WhatsApp</p>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">Chat on {contactLinks.phone}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Opens WhatsApp app or Web based on your device</p>
                    </div>
                  </motion.button>
                  {contactInfo.map((info) => {
                    const isExternal = info.href?.startsWith('http')

                    const content = (
                      <div className="w-full flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:shadow-lg transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-emerald-900/20 flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-emerald-800/30 transition-colors">
                          <info.icon size={24} className="text-primary-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-500">{info.label}</p>
                          <p className="text-gray-900 dark:text-gray-100 font-medium">{info.value}</p>
                          {info.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{info.description}</p>
                          )}
                        </div>
                      </div>
                    )

                    return (
                      <motion.div key={info.label} whileHover={{ scale: 1.02 }}>
                        {info.onClick ? (
                          <button type="button" onClick={info.onClick} className="w-full text-left">
                            {content}
                          </button>
                        ) : (
                          <a
                            href={info.href}
                            target={isExternal ? '_blank' : undefined}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                            className="block"
                          >
                            {content}
                          </a>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Follow Me</h3>
                  <div className="flex gap-4">
                    {socialLinks.map(({ icon: Icon, href, label, onClick }) => {
                      const commonProps = {
                        key: label,
                        whileHover: { scale: 1.1, y: -2 },
                        whileTap: { scale: 0.95 },
                        className: 'p-3 rounded-full bg-white dark:bg-dark-card shadow-lg border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-emerald-400 hover:shadow-xl transition-all duration-300',
                        'aria-label': label
                      }

                      if (onClick) {
                        return (
                          <motion.button
                            {...commonProps}
                            type="button"
                            onClick={onClick}
                          >
                            <Icon size={24} />
                          </motion.button>
                        )
                      }

                      return (
                        <motion.a
                          {...commonProps}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Icon size={24} />
                        </motion.a>
                      )
                    })}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="card p-8"
              >
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Send me a message</h3>

                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
                  >
                    <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                    <p className="text-green-700 dark:text-green-300">Message sent successfully! I'll get back to you soon.</p>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3"
                  >
                    <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                    <p className="text-red-700 dark:text-red-300">Failed to send message. Please try again or contact me directly.</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register('name', { required: 'Name is required' })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 transition-colors"
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 transition-colors"
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      {...register('subject', { required: 'Subject is required' })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 transition-colors"
                      placeholder="What's this about?"
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      {...register('message', { required: 'Message is required' })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 transition-colors resize-none"
                      placeholder="Tell me about your project or just say hello!"
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section (Optional) */}
        <section className="section-padding py-20 bg-gray-50 dark:bg-dark-surface">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">
                <span className="text-gradient dark:text-gradient-dark">Find Me Here</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Based in {contactLinks.location}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden shadow-lg"
            >
              {/* Google Maps Embed */}
              <div className="w-full h-96 relative">
                <iframe
                  src={contactLinks.locationEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ugar Khurd, Belagavi, Karnataka Location"
                  className="rounded-2xl"
                />
                
                {/* Map overlay with location info */}
                <div className="absolute top-4 right-4 bg-white dark:bg-dark-card shadow-lg rounded-lg p-4 max-w-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-emerald-900/20 flex items-center justify-center">
                      <MapPin size={20} className="text-primary-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">My Location</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{contactLinks.location}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Tap to open maps for directions</p>
                    </div>
                  </div>
                </div>

                {/* Quick action buttons */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <a
                    href={contactLinks.locationMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-white dark:bg-dark-card shadow-lg rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Open in Maps
                  </a>
                  <a
                    href={contactLinks.locationDirectionsUrl || contactLinks.locationMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-primary-600 dark:bg-emerald-600 text-white shadow-lg rounded-lg text-sm font-medium hover:bg-primary-700 dark:hover:bg-emerald-700 transition-colors"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Contact

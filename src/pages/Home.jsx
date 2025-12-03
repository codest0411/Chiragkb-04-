import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Download, Github, Linkedin, Mail, Code2, PenTool, Instagram } from 'lucide-react'
import { Link } from 'react-router-dom'
import { statisticsAPI, resumeAPI, skillsAPI } from '../utils/supabase'
import * as SiIcons from 'react-icons/si'
import * as FaIcons from 'react-icons/fa'
import { useLinks } from '../contexts/LinksContext'
import DecryptedText from '../components/DecryptedText'
import TextType from '../components/TextType'

const fallbackSkillGroups = [
  {
    category: 'Frontend',
    technologies: ['React.js', 'HTML5', 'CSS3', 'JavaScript', 'Tailwind CSS'],
  },
  {
    category: 'Backend',
    technologies: ['Node.js', 'Express.js', 'MongoDB', 'Supabase', 'MySQL', 'PostgreSQL', 'PHP', 'phpMyAdmin'],
  },
  {
    category: 'Languages & Tools',
    technologies: ['Java', 'JavaScript', 'Python', 'PHP', 'SQL', 'Git', 'GitHub', 'VS Code'],
  },
]

const fallbackTechnologies = Array.from(
  new Set(fallbackSkillGroups.flatMap((group) => group.technologies))
)

const uiuxTechnologies = [
  'Figma',
  'Adobe XD',
  'Adobe Illustrator',
  'Framer',
  'Canva',
]

const designToolsSet = new Set(uiuxTechnologies)

const techIconMap = {
  'React.js': SiIcons.SiReact,
  React: SiIcons.SiReact,
  HTML5: SiIcons.SiHtml5,
  CSS3: SiIcons.SiCss3,
  JavaScript: SiIcons.SiJavascript,
  'Tailwind CSS': SiIcons.SiTailwindcss,
  TailwindCSS: SiIcons.SiTailwindcss,
  'Node.js': SiIcons.SiNodedotjs,
  'Express.js': SiIcons.SiExpress,
  MongoDB: SiIcons.SiMongodb,
  Supabase: SiIcons.SiSupabase,
  MySQL: SiIcons.SiMysql,
  PostgreSQL: SiIcons.SiPostgresql,
  PHP: SiIcons.SiPhp,
  Java: FaIcons.FaJava || SiIcons.SiOpenjdk,
  Python: SiIcons.SiPython,
  SQL: SiIcons.SiMysql,
  Git: SiIcons.SiGit,
  GitHub: SiIcons.SiGithub,
  Docker: SiIcons.SiDocker,
  'VS Code': SiIcons.SiVisualstudiocode,
  VSCode: SiIcons.SiVisualstudiocode,
  'Visual Studio Code': SiIcons.SiVisualstudiocode,
  'Next.js': SiIcons.SiNextdotjs,
  NextJS: SiIcons.SiNextdotjs,
  Nextjs: SiIcons.SiNextdotjs,
  'Next JS': SiIcons.SiNextdotjs,
  Postman: SiIcons.SiPostman,
  phpMyAdmin: SiIcons.SiPhpmyadmin,
  phpmyadmin: SiIcons.SiPhpmyadmin,
  'php myadmin': SiIcons.SiPhpmyadmin,
  'php myadin': SiIcons.SiPhpmyadmin,
  PhpMyAdmin: SiIcons.SiPhpmyadmin,
  Figma: SiIcons.SiFigma,
  'Adobe XD': SiIcons.SiAdobexd,
  'Adobe Illustrator': SiIcons.SiAdobeillustrator,
  Framer: SiIcons.SiFramer,
  Canva: SiIcons.SiCanva,
}

const Home = () => {
  const [statistics, setStatistics] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [resumes, setResumes] = useState({
    fullstack: { resume_url: '/resume.pdf', filename: 'resume.pdf' },
    uiux: { resume_url: '/resume.pdf', filename: 'resume.pdf' }
  })
  const [technologies, setTechnologies] = useState(fallbackTechnologies)
  const [activeProfile, setActiveProfile] = useState('fullstack')
  const { links } = useLinks()
  const { social: socialLinksData = {} } = links || {}

  useEffect(() => {
    loadStatistics()
    loadResumes()
    loadTechnologies()

    // Listen for real-time resume updates from admin
    const handleResumeUpdate = (event) => {
      const updatedResumes = event.detail
      // Expect an object like { fullstack: {...}, uiux: {...} }
      if (updatedResumes && (updatedResumes.fullstack || updatedResumes.uiux)) {
        setResumes(prev => ({
          ...prev,
          ...updatedResumes
        }))
      }
    }

    window.addEventListener('resumeUpdated', handleResumeUpdate)
    
    return () => {
      window.removeEventListener('resumeUpdated', handleResumeUpdate)
    }
  }, [])

  const loadStatistics = async () => {
    try {
      const stats = await statisticsAPI.getAll()
      setStatistics(stats)
    } catch (error) {
      console.error('Failed to load statistics:', error)
      // Show error message to user
      console.warn('Please ensure your Supabase database is properly configured with a statistics table')
      // Fallback to default statistics
      setStatistics([
        { id: 1, number: '5+', label: 'Projects Completed', order: 1 },
        { id: 2, number: '1+', label: 'Years Experience', order: 2 },
        { id: 3, number: '8+', label: 'Students Helped', order: 3 },
        { id: 4, number: '10+', label: 'Technologies', order: 4 }
      ])
    } finally {
      setLoadingStats(false)
    }
  }

  const loadResumes = async () => {
    try {
      const allResumes = await resumeAPI.getAllResumes()
      setResumes(allResumes || resumes)
    } catch (error) {
      console.error('Failed to load resumes:', error)
      // Keep default values
    }
  }

  const loadTechnologies = async () => {
    try {
      const skillsData = await skillsAPI.getByCategory()
      if (skillsData && skillsData.length > 0) {
        const allTech = Array.from(
          new Set(skillsData.flatMap((group) => group.technologies))
        )
        setTechnologies(allTech)
      } else {
        setTechnologies(fallbackTechnologies)
      }
    } catch (error) {
      console.error('Failed to load technologies:', error)
      setTechnologies(fallbackTechnologies)
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

  const socialLinks = useMemo(() => (
    [
      { icon: Github, href: socialLinksData.github || 'https://github.com/codest0411', label: 'GitHub' },
      { icon: Linkedin, href: socialLinksData.linkedin || 'http://www.linkedin.com/in/chiragkb04', label: 'LinkedIn' },
      { icon: Instagram, href: socialLinksData.instagram || 'https://www.instagram.com/gurub04', label: 'Instagram' },
      { icon: Mail, href: socialLinksData.email || 'mailto:chiragbhandarkar780@gmail.com', label: 'Email' }
    ]
  ), [socialLinksData])

  const fullstackTechnologies = technologies.filter((tech) => !designToolsSet.has(tech))
  const currentTechnologies = activeProfile === 'fullstack' ? fullstackTechnologies : uiuxTechnologies

  // Use strictly per-profile resumes so UI/UX never falls back to Full Stack and
  // Full Stack never falls back to UI/UX. If a profile has no custom resume yet,
  // it uses its own default placeholder.
  const defaultResume = { resume_url: '/resume.pdf', filename: 'resume.pdf' }
  const currentResume = activeProfile === 'uiux'
    ? (resumes.uiux || defaultResume)
    : (resumes.fullstack || defaultResume)

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-black via-[#050816] to-black overflow-x-hidden">
      {/* Hero Section */}
      <section className="section-padding flex items-center justify-center min-h-[80vh] w-full">
        <div className="container-custom">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative mx-auto max-w-5xl rounded-3xl bg-white/5 dark:bg-[#050816] px-6 py-10 sm:px-10 sm:py-12 shadow-[0_24px_80px_rgba(0,0,0,0.75)] border border-white/10 backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),_transparent_55%)]" />
            <div className="relative z-10 flex flex-col items-center text-center gap-8">
            {/* Greeting */}
            <motion.p
              variants={itemVariants}
              className="text-sm font-medium tracking-[0.2em] uppercase text-gray-300/70"
            >
              Hello, I'm
            </motion.p>

            {/* Name with animated text */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white"
            >
              <span className="bg-gradient-to-r from-white via-gray-100 to-slate-300 bg-clip-text text-transparent">
                Chirag Bhandarkar
              </span>
            </motion.h1>

            <motion.div
              variants={itemVariants}
              className="relative inline-flex items-center mt-6 rounded-full bg-white/5 border border-white/10 p-1 overflow-hidden min-w-[260px] max-w-full"
            >
              <button
                type="button"
                onClick={() => setActiveProfile('fullstack')}
                className={`relative z-10 flex-1 px-4 py-1 text-[11px] sm:text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeProfile === 'fullstack'
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {activeProfile === 'fullstack' && (
                  <motion.div
                    layoutId="profileToggleBg"
                    className="absolute inset-0 rounded-full bg-primary-600/90 dark:bg-emerald-500/80 shadow-lg"
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  />
                )}
                <span className="relative flex items-center justify-center gap-1.5">
                  <Code2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Full Stack</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveProfile('uiux')}
                className={`relative z-10 flex-1 px-4 py-1 text-[11px] sm:text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeProfile === 'uiux'
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {activeProfile === 'uiux' && (
                  <motion.div
                    layoutId="profileToggleBg"
                    className="absolute inset-0 rounded-full bg-primary-600/90 dark:bg-emerald-500/80 shadow-lg"
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  />
                )}
                <span className="relative flex items-center justify-center gap-1.5">
                  <PenTool className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>UI/UX Designer</span>
                </span>
              </button>
            </motion.div>

            {/* Role/Title */}
            <motion.h2
              variants={itemVariants}
              className="mt-8 text-xl sm:text-2xl md:text-3xl font-medium text-gray-200"
            >
              {activeProfile === 'fullstack' ? (
                <DecryptedText
                  text="Full Stack Web Developer"
                  animateOn="both"
                  speed={140}
                  maxIterations={40}
                  characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"
                  className=""
                  encryptedClassName="text-emerald-400 tracking-widest"
                />
              ) : (
                <span className="inline-flex items-center justify-center gap-3">
                  <span className="flex flex-col gap-1 text-[#4ad2ff]">
                    <span className="w-4 md:w-5 h-[2px] md:h-[3px] bg-[#4ad2ff] rounded-full" />
                    <span className="w-6 md:w-8 h-[2px] md:h-[3px] bg-[#4ad2ff] rounded-full" />
                  </span>
                  <TextType
                    as="span"
                    text={["UI/UX Designer"]}
                    typingSpeed={75}
                    pauseDuration={1500}
                    showCursor={true}
                    cursorCharacter="|"
                    className="font-gabarito text-3xl md:text-4xl text-[#ff6b1a] tracking-wide"
                  />
                </span>
              )}
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="mt-4 text-base sm:text-lg text-gray-300/80 max-w-2xl mx-auto leading-relaxed"
            >
              {activeProfile === 'fullstack' ? (
                <>
                  Motivated BCA graduate and Full-Stack Web Developer with expertise in MERN stack development. 
                  Skilled in building responsive web applications, integrating APIs, and developing scalable backend systems. 
                  Experienced in Agile workflows, client-side projects, and collaborative coding, seeking to contribute to innovative web development teams.
                </>
              ) : (
                <>
                  Passionate UI/UX Designer focused on creating clean, modern interfaces and intuitive user journeys. 
                  Skilled in crafting wireframes, prototypes, and high-fidelity designs using tools like Figma. 
                  Dedicated to balancing visual aesthetics with usability, accessibility, and responsive design to deliver engaging digital experiences.
                </>
              )}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/contact"
                className="btn-primary flex items-center gap-2 group"
              >
                {activeProfile === 'fullstack' ? 'Hire for Full Stack' : 'Hire for UI/UX Design'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <a
                href={currentResume.resume_url}
                download={currentResume.filename}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2"
                onClick={(e) => {
                  // Force download instead of opening in browser
                  e.preventDefault()
                  resumeAPI.forceDownload(currentResume.resume_url, currentResume.filename)
                }}
              >
                <Download size={20} />
                Download Resume
              </a>
            </motion.div>

            {/* Social Links */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex justify-center space-x-4 sm:space-x-6"
            >
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-200"
                  aria-label={label}
                >
                  <Icon size={24} />
                </motion.a>
              ))}
            </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-8 bg-[#050816]">
        <div className="container-custom section-padding">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {loadingStats ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </motion.div>
              ))
            ) : (
              statistics.map((stat, index) => (
                <motion.div
                  key={stat.id || stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="space-y-1 rounded-2xl bg-white/5 border border-white/10 px-4 py-5 text-center text-gray-100"
                >
                  <h3 className="text-2xl md:text-3xl font-semibold">
                    {stat.number}
                  </h3>
                  <p className="text-sm md:text-base text-gray-300/80">
                    {stat.label}
                  </p>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Skills Preview */}
      <section className="pt-8 pb-12 bg-black">
        <div className="container-custom section-padding">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient dark:text-gradient-dark">
                Technologies I Love
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {activeProfile === 'fullstack'
                ? 'Here are some of the technologies and tools I use for full-stack web development.'
                : 'Here are some of the design tools I use to craft clean, user-friendly UI/UX experiences.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-stretch justify-items-center"
          >
            {currentTechnologies.map((tech, index) => {
              const Icon = techIconMap[tech]
              return (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="w-full max-w-[120px] rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center px-4 py-4 text-center text-gray-100 transition-colors duration-200 hover:bg-white/10 cursor-pointer"
                >
                  {Icon ? (
                    <Icon className="text-2xl md:text-3xl text-primary-600 dark:text-emerald-400" />
                  ) : (
                    <FaIcons.FaCode className="text-2xl md:text-3xl text-primary-600 dark:text-emerald-400" />
                  )}
                  <span className="mt-2 text-[10px] md:text-xs font-medium text-gray-700 dark:text-gray-300 text-center px-2">
                    {tech}
                  </span>
                </motion.div>
              )
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              to="/about"
              className="btn-secondary inline-flex items-center gap-2 group"
            >
              Learn More About Me
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home

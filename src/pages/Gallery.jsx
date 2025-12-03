import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { X } from 'lucide-react'
import { galleryAPI, galleryFoldersAPI } from '../utils/supabase'
import Folder from '../components/Folder'
import ImageTrail from '../components/ImageTrail'
const Gallery = () => {
  const [items, setItems] = useState([])
  const [folders, setFolders] = useState([])
  const [activeFolderId, setActiveFolderId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [folderModalFolder, setFolderModalFolder] = useState(null)

  const loadGallery = async () => {
    setLoading(true)
    try {
      const [itemsData, foldersData] = await Promise.all([
        galleryAPI.getAll(),
        galleryFoldersAPI.getAll(),
      ])
      setItems(itemsData || [])
      setFolders(foldersData || [])
    } catch (error) {
      console.error('Failed to load gallery items:', error)
      setItems([])
      setFolders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGallery()

    const handleUpdate = () => {
      loadGallery()
    }

    window.addEventListener('galleryUpdated', handleUpdate)
    return () => window.removeEventListener('galleryUpdated', handleUpdate)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  const filteredItems = activeFolderId
    ? items.filter((item) => item.folder_id === activeFolderId)
    : items

  const folderModalItems = folderModalFolder
    ? items.filter((item) => item.folder_id === folderModalFolder.id)
    : []

  const trailItems = items
    .filter((item) => item.image_url)
    .map((item) => item.image_url)

  return (
    <>
      <Helmet>
        <title>Gallery - Portfolio</title>
        <meta
          name="description"
          content="Stories and images from my journey."
        />
      </Helmet>

      <div
        className="min-h-screen"
        onContextMenu={(e) => e.preventDefault()}
      >
        <section className="section-padding py-12 sm:py-16 md:py-20 hero-bg">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-responsive-3xl font-bold mb-4 sm:mb-6">
                My <span className="text-gradient dark:text-gradient-dark">Gallery</span>
              </h1>
              <p className="text-responsive-base text-gray-600 dark:text-gray-400 leading-relaxed">
                A collection of memorable moments, each with a story to remember.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding py-12 sm:py-16 md:py-20">
          <div className="container-custom">
            {folders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Folders
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-6 items-start">
                  <div className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveFolderId(null)}
                      className={`px-3 py-1 rounded-full text-xs sm:text-sm border transition-colors ${
                        activeFolderId === null
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-transparent text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-dark-card'
                      }`}
                    >
                      All
                    </button>
                  </div>
                  {folders.map((folder) => {
                    const folderItems = items.filter((item) => item.folder_id === folder.id)
                    const previewItems = folderItems.slice(0, 3).map((folderItem) => (
                      <div
                        key={folderItem.id}
                        className="w-full h-full overflow-hidden rounded-md bg-black/5 dark:bg-white/5 flex items-center justify-center"
                      >
                        {folderItem.image_url ? (
                          <img
                            src={folderItem.image_url}
                            alt={folderItem.story}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="px-2 text-[10px] sm:text-xs text-gray-700 dark:text-gray-200 text-center line-clamp-3">
                            {folderItem.story}
                          </span>
                        )}
                      </div>
                    ))

                    return (
                      <div
                        key={folder.id}
                        className="flex flex-col items-center gap-3 cursor-pointer"
                      >
                        <Folder
                          size={1.1}
                          color={folder.color || '#5227FF'}
                          className={`transition-transform ${
                            activeFolderId === folder.id ? 'scale-110' : ''
                          }`}
                          items={previewItems}
                          onItemClick={() => {
                            setActiveFolderId(folder.id)
                            setFolderModalFolder(folder)
                          }}
                        />
                        <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                          {folder.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {trailItems.length > 0 && (
              <div className="card mb-8 p-0 overflow-hidden bg-[#05010d] dark:bg-black border border-gray-800/60">
                <div className="relative h-[320px] sm:h-[380px] md:h-[440px] overflow-hidden">
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[5]">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#3d3455]">
                      Hover Me.
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-[#5c5275]">
                      Move your mouse here to see all gallery pictures
                    </p>
                  </div>
                  <ImageTrail items={trailItems} variant={1} />
                </div>
              </div>
            )}
            {loading ? (
              <div className="grid grid-responsive-3 gap-4 sm:gap-6 md:gap-8">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="card h-64 sm:h-72 animate-pulse flex items-center justify-center"
                  >
                    <div className="w-3/4 h-3/4 bg-gray-200 dark:bg-dark-surface rounded-xl" />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="card p-8 sm:p-10 text-center max-w-xl mx-auto">
                <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg">
                  No gallery items yet.
                </p>
              </div>
            ) : null}
          </div>
        </section>

        {folderModalFolder && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-surface rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-border px-4 sm:px-6 py-3 sm:py-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {folderModalFolder.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {folderModalItems.length} item{folderModalItems.length === 1 ? '' : 's'} in this folder
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFolderModalFolder(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-dark-card text-gray-600 dark:text-gray-300"
                  aria-label="Close folder"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {folderModalItems.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    No items in this folder yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {folderModalItems.map((item) => (
                      <div
                        key={item.id}
                        className="card overflow-hidden relative group flex items-center justify-center bg-black/40"
                      >
                        <div className="max-h-72 w-full flex items-center justify-center">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.story}
                              className="max-h-72 w-auto max-w-full object-contain select-none pointer-events-none"
                              draggable="false"
                            />
                          ) : (
                            <div className="w-full h-40 bg-gradient-to-br from-primary-600 to-navy-600 flex flex-col items-center justify-center">
                              <span className="text-white text-sm sm:text-base font-semibold mb-1">
                                Story
                              </span>
                              <span className="text-white/80 text-xs sm:text-sm text-center px-4">
                                Hover to read the story
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-95 text-white p-3 sm:p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap mb-2">
                            {item.story}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Gallery

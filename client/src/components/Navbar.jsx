import React, { useState } from 'react'
import { assets, menuLinks } from '../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const Navbar = () => {
  const { setShowLogin, user, logout, isOwner, axios, setIsOwner } = useAppContext()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const changeRole = async () => {
    try {
      const { data } = await axios.post('/api/owner/change-role')
      if (data.success) {
        setIsOwner(true)
        toast.success(data.message)
      } else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 
      text-gray-600 border-b border-borderColor relative transition-all 
      ${location.pathname === '/' && 'bg-light'}`}
    >
      {/* LOGO */}
      <Link to="/">
        <motion.img whileHover={{ scale: 1.05 }} src={assets.logo} alt="logo" className="h-8" />
      </Link>

      {/* LINKS */}
      <div
        className={`
        max-sm:fixed max-sm:top-0 max-sm:left-0 max-sm:w-full max-sm:h-screen 
        max-sm:bg-white max-sm:z-40 max-sm:p-6
        flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8
        transition-transform duration-300
        ${open ? 'max-sm:translate-x-0' : 'max-sm:translate-x-full'}
        `}
      >
        {/* MOBILE HEADER */}
        <div className="sm:hidden flex items-center justify-between mb-6">
          <img src={assets.logo} className="h-7" />
          <button onClick={() => setOpen(false)}>
            <img src={assets.close_icon} />
          </button>
        </div>

        {menuLinks.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            onClick={() => setOpen(false)}
            className="text-lg sm:text-sm border-b sm:border-none pb-3 sm:pb-0"
          >
            {link.name}
          </Link>
        ))}

        {/* MOBILE ACTIONS */}
        <div className="sm:hidden mt-8 flex flex-col gap-3">
          <button
            onClick={() => {
              setOpen(false)
              isOwner ? navigate('/owner') : changeRole()
            }}
            className="w-full border border-borderColor py-2 rounded-md"
          >
            {isOwner ? 'Dashboard' : 'List cars'}
          </button>

          <button
            onClick={() => {
              setOpen(false)
              user ? logout() : setShowLogin(true)
            }}
            className="w-full bg-primary text-white py-2 rounded-md"
          >
            {user ? 'Logout' : 'Login'}
          </button>
        </div>
      </div>

      {/* SEARCH (UNCHANGED) */}
      <div className="hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56">
        <input
          type="text"
          className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
          placeholder="search products"
        />
        <img src={assets.search_icon} alt="search" />
      </div>

      {/* DESKTOP ACTIONS (UNCHANGED) */}
      <div className="hidden sm:flex items-center gap-6">
        <button onClick={() => (isOwner ? navigate('/owner') : changeRole())}>
          {isOwner ? 'Dashboard' : 'List cars'}
        </button>
        <button
          onClick={() => (user ? logout() : setShowLogin(true))}
          className="bg-primary text-white px-8 py-2 rounded-lg"
        >
          {user ? 'Logout' : 'Login'}
        </button>
      </div>

      {/* MOBILE MENU BUTTON */}
      <button className="sm:hidden" onClick={() => setOpen(!open)}>
        <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
      </button>
    </motion.div>
  )
}

export default Navbar

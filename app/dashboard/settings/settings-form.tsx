"use client"

import type React from "react"

import { useState, useRef } from "react"
import { BrutalCard } from "@/components/brutal-card"
import { updateUserSettings, changePassword, uploadProfilePicture } from "./actions"
import { useRouter } from "next/navigation"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

type User = {
  id: string
  full_name: string
  display_name: string | null
  email: string
  profile_picture_url: string | null
}

export function SettingsForm({ user }: { user: User }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  })
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  async function handleProfileUpdate(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(null)

    const result = await updateUserSettings(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Profile updated successfully!")
      router.refresh()
    }

    setLoading(false)
  }

  async function handlePasswordChange(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(null)

    const result = await changePassword(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Password changed successfully!")
      // Reset form
      const form = document.getElementById("password-form") as HTMLFormElement
      form?.reset()
    }

    setLoading(false)
  }

  async function handleCroppedImageUpload() {
    if (!imgRef.current || !completedCrop) return

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create canvas with cropped image
      const canvas = document.createElement("canvas")
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height

      canvas.width = completedCrop.width * scaleX
      canvas.height = completedCrop.height * scaleY

      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("No 2d context")

      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height,
      )

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.95)
      })

      const formData = new FormData()
      formData.append("file", blob, "profile-picture.jpg")

      const result = await uploadProfilePicture(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess("Profile picture updated!")
        setImageSrc(null)
        router.refresh()
      }
    } catch (err) {
      setError("Failed to process image")
    }

    setUploading(false)
  }

  // Added function to handle image selection
  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-brutal-red text-white px-6 py-4 border-6 border-black shadow-brutal font-black text-lg">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="bg-brutal-green text-black px-6 py-4 border-6 border-black shadow-brutal font-black text-lg">
          ✅ {success}
        </div>
      )}

      {imageSrc && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <BrutalCard className="bg-white max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-8">
              <h2 className="font-display text-3xl font-black mb-6">CROP YOUR IMAGE</h2>
              <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)} aspect={1}>
                <img ref={imgRef} src={imageSrc || "/placeholder.svg"} alt="Crop preview" className="max-w-full" />
              </ReactCrop>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCroppedImageUpload}
                  disabled={uploading || !completedCrop}
                  className="bg-brutal-green text-black px-6 py-3 font-black border-4 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                >
                  {uploading ? "UPLOADING..." : "UPLOAD"}
                </button>
                <button
                  onClick={() => setImageSrc(null)}
                  disabled={uploading}
                  className="bg-white text-black px-6 py-3 font-black border-4 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </BrutalCard>
        </div>
      )}

      {/* Profile Picture */}
      <BrutalCard className="bg-white">
        <div className="p-8">
          <h2 className="font-display text-3xl font-black mb-6">PROFILE PICTURE</h2>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 bg-brutal-yellow border-6 border-black flex items-center justify-center text-6xl overflow-hidden">
              {user.profile_picture_url ? (
                <img
                  src={user.profile_picture_url || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                "👤"
              )}
            </div>
            <div>
              <label
                htmlFor="profile-picture"
                className={`inline-block bg-brutal-pink text-black px-6 py-3 font-black border-4 border-black shadow-brutal cursor-pointer hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? "UPLOADING..." : "UPLOAD NEW PHOTO"}
              </label>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={uploading}
                className="hidden"
              />
              <p className="text-sm font-bold mt-2">Max 5MB, JPG/PNG/GIF</p>
            </div>
          </div>
        </div>
      </BrutalCard>

      {/* Profile Info */}
      <BrutalCard className="bg-white">
        <div className="p-8">
          <h2 className="font-display text-3xl font-black mb-6">PROFILE INFORMATION</h2>
          <form action={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block font-black text-lg mb-2">FULL NAME</label>
              <input
                type="text"
                name="full_name"
                defaultValue={user.full_name}
                required
                className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-brutal-yellow"
              />
            </div>

            <div>
              <label className="block font-black text-lg mb-2">DISPLAY NAME (optional)</label>
              <input
                type="text"
                name="display_name"
                defaultValue={user.display_name || ""}
                placeholder="How others see you"
                className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-brutal-yellow"
              />
            </div>

            <div>
              <label className="block font-black text-lg mb-2">EMAIL</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 border-4 border-black font-bold text-lg bg-gray-100 cursor-not-allowed"
              />
              <p className="text-sm font-bold mt-1 text-gray-600">Email cannot be changed</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-brutal-green text-black px-8 py-4 text-xl font-black border-6 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </form>
        </div>
      </BrutalCard>

      {/* Change Password */}
      <BrutalCard className="bg-white">
        <div className="p-8">
          <h2 className="font-display text-3xl font-black mb-6">CHANGE PASSWORD</h2>
          <form id="password-form" action={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block font-black text-lg mb-2">CURRENT PASSWORD</label>
              <input
                type="password"
                name="current_password"
                required
                className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-brutal-yellow"
              />
            </div>

            <div>
              <label className="block font-black text-lg mb-2">NEW PASSWORD</label>
              <input
                type="password"
                name="new_password"
                required
                minLength={8}
                className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-brutal-yellow"
              />
              <p className="text-sm font-bold mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block font-black text-lg mb-2">CONFIRM NEW PASSWORD</label>
              <input
                type="password"
                name="confirm_password"
                required
                minLength={8}
                className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-brutal-yellow"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-brutal-red text-black px-8 py-4 text-xl font-black border-6 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "UPDATING..." : "UPDATE PASSWORD"}
            </button>
          </form>
        </div>
      </BrutalCard>
    </div>
  )
}

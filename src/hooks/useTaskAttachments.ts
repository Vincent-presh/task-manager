import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { TaskAttachment } from '../types/task'

export function useTaskAttachments(taskId: string) {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchAttachments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', taskId)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setAttachments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attachments')
    } finally {
      setLoading(false)
    }
  }

  const uploadAttachment = async (file: File) => {
    try {
      setUploading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${taskId}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(fileName)

      // Save attachment record
      const { data, error } = await supabase
        .from('task_attachments')
        .insert([{
          task_id: taskId,
          filename: file.name,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type
        }])
        .select()
        .single()

      if (error) throw error
      setAttachments(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload attachment')
      throw err
    } finally {
      setUploading(false)
    }
  }

  const deleteAttachment = async (attachmentId: string, fileUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/')
      const filePath = urlParts.slice(-2).join('/')

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('task-attachments')
        .remove([filePath])

      if (deleteError) throw deleteError

      // Delete record
      const { error } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId)

      if (error) throw error
      setAttachments(prev => prev.filter(attachment => attachment.id !== attachmentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete attachment')
      throw err
    }
  }

  useEffect(() => {
    if (taskId) {
      fetchAttachments()
    }
  }, [taskId]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    attachments,
    loading,
    error,
    uploading,
    uploadAttachment,
    deleteAttachment,
    refetch: fetchAttachments
  }
}
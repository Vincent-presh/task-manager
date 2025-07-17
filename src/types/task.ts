export interface TaskComment {
  id: string
  task_id: string
  user_id: string
  content: string
  inserted_at: string
}

export interface TaskAttachment {
  id: string
  task_id: string
  filename: string
  file_url: string
  file_size: number
  file_type: string
  uploaded_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'done'
  extras?: {
    tags?: string[]
    due_date?: string
    priority?: 'low' | 'medium' | 'high'
  }
  inserted_at: string
  comments?: TaskComment[]
  attachments?: TaskAttachment[]
}

export interface CreateTaskData {
  title: string
  description?: string
  status?: 'pending' | 'in-progress' | 'done'
  extras?: {
    tags?: string[]
    due_date?: string
    priority?: 'low' | 'medium' | 'high'
  }
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: 'pending' | 'in-progress' | 'done'
  extras?: {
    tags?: string[]
    due_date?: string
    priority?: 'low' | 'medium' | 'high'
  }
}
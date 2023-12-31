import { useEffect, useState } from 'react'
import { ContentsDTO, CreateContentDTO } from '../types/dto'
import axios from 'axios'

const usePosts = () => {
  const token = localStorage.getItem('token')
  const [contents, setContents] = useState<ContentsDTO | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isPosting, setPosting] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const res = await axios.get<ContentsDTO>('http://localhost:8080/content')

        console.log(res.data)
        setContents(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const createPost = async (newUrl: string, newComment: string, newRating: number) => {
    const newPost: CreateContentDTO = {
      videoUrl: newUrl,
      comment: newComment,
      rating: newRating,
    }

    setPosting(true)
    try {
      const res = await axios.post<CreateContentDTO>('http://localhost:8080/content', newPost, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setPosting(false)
    }
  }

  return { contents, isLoading, isPosting, createPost }
}

export default usePosts

"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SupabaseExample() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newProfile, setNewProfile] = useState({ email: '', full_name: '' })

  // 프로필 목록 가져오기
  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  // 새 프로필 추가
  const addProfile = async () => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('profiles')
        .insert([newProfile])

      if (error) throw error
      
      setNewProfile({ email: '', full_name: '' })
      fetchProfiles() // 목록 새로고침
    } catch (error) {
      console.error('Error adding profile:', error)
    } finally {
      setLoading(false)
    }
  }

  // 프로필 삭제
  const deleteProfile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchProfiles() // 목록 새로고침
    } catch (error) {
      console.error('Error deleting profile:', error)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase 예시 - 프로필 관리</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 새 프로필 추가 폼 */}
        <div className="flex gap-2">
          <Input
            placeholder="이메일"
            value={newProfile.email}
            onChange={(e) => setNewProfile(prev => ({ ...prev, email: e.target.value }))}
          />
          <Input
            placeholder="이름"
            value={newProfile.full_name}
            onChange={(e) => setNewProfile(prev => ({ ...prev, full_name: e.target.value }))}
          />
          <Button onClick={addProfile} disabled={loading}>
            추가
          </Button>
        </div>

        {/* 프로필 목록 */}
        <div className="space-y-2">
          <h3 className="font-medium">프로필 목록</h3>
          {loading ? (
            <p className="text-muted-foreground">로딩 중...</p>
          ) : profiles.length === 0 ? (
            <p className="text-muted-foreground">프로필이 없습니다.</p>
          ) : (
            profiles.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{profile.full_name}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteProfile(profile.id)}
                  disabled={loading}
                >
                  삭제
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

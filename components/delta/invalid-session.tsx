'use client'

import { Card, CardContent } from '@/components/ui/card'

export function InvalidSession() {
  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-stone-900 mb-2">Session Not Found</h1>
          <p className="text-stone-500">
            This session link is invalid or the session has ended.
            Ask your facilitator for a new link.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

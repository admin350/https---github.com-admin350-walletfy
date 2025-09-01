import { LoginForm } from '@/components/auth/login-form'
import { Rocket } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-2 text-3xl font-bold text-primary">
            <Rocket className="h-8 w-8" />
            <h1 className="font-headline">FA Vision</h1>
          </div>
          <p className="text-muted-foreground">Your Personal Power BI for Finance</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

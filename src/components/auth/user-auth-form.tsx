
'use client';
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const { login, signup, error } = useAuth();

  const handleLogin = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    setIsLoading(true)
    await login(email, password)
    setIsLoading(false)
  }

  const handleSignup = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    setIsLoading(true)
    await signup(email, password)
    setIsLoading(false)
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="nombre@ejemplo.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              Contraseña
            </Label>
            <Input
              id="password"
              placeholder="Contraseña"
              type="password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button disabled={isLoading} onClick={handleLogin}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Iniciar Sesión
            </Button>
             <Button disabled={isLoading} onClick={handleSignup} variant="outline">
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Registrarse
            </Button>
          </div>
           {error && <p className="text-center text-sm text-destructive">{error}</p>}
        </div>
      </form>
    </div>
  )
}

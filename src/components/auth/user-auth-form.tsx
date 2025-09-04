
'use client';
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.62-4.55 1.62-3.87 0-7-3.13-7-7s3.13-7 7-7c1.93 0 3.57.72 4.92 2.02l2.3-2.3C18.16 3.73 15.66 2.69 12.48 2.69c-5.25 0-9.52 4.27-9.52 9.52s4.27 9.52 9.52 9.52c5.64 0 9.2-3.82 9.2-9.2 0-.75-.08-1.36-.2-1.93h-9.02z" />
    </svg>
);


export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const { login, signup, loginWithGoogle, error } = useAuth();

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
  
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    await loginWithGoogle();
    setIsGoogleLoading(false);
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
              disabled={isLoading || isGoogleLoading}
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
              disabled={isLoading || isGoogleLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button disabled={isLoading || isGoogleLoading} onClick={handleLogin}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Iniciar Sesión
            </Button>
             <Button disabled={isLoading || isGoogleLoading} onClick={handleSignup} variant="outline">
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Registrarse
            </Button>
          </div>
           {error && <p className="text-center text-sm text-destructive">{error}</p>}
        </div>
      </form>
       <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            O continúa con
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={isLoading || isGoogleLoading} onClick={handleGoogleLogin}>
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="mr-2 h-4 w-4" />
        )}{" "}
        Google
      </Button>
    </div>
  )
}

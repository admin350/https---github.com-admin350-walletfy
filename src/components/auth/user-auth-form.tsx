
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
  const [authAction, setAuthAction] = React.useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const { login, signup, error: authError } = useAuth();
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authError === 'auth/email-already-in-use') {
        setAuthAction('login');
        setFormError("Ya existe una cuenta con este correo. Por favor, inicia sesión.");
    } else {
        setFormError(authError);
    }
  }, [authError]);

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    if (!email || !password) {
        setFormError("Por favor, completa todos los campos.");
        return;
    }
    setFormError(null);
    setIsLoading(true)
    if (authAction === 'login') {
        await login(email, password)
    } else {
        await signup(email, password)
    }
    setIsLoading(false)
  }
  
  const toggleAuthAction = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setAuthAction(authAction === 'login' ? 'signup' : 'login');
      setFormError(null);
  }
  
  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
                {authAction === 'login' ? 'Inicia Sesión' : 'Crea una cuenta'}
            </h1>
            <p className="text-sm text-muted-foreground">
                Ingresa tu correo y contraseña para continuar
            </p>
      </div>

      <form onSubmit={handleSubmit}>
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
          <Button disabled={isLoading} type="submit">
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {authAction === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </Button>
           {formError && <p className="text-center text-sm text-destructive">{formError}</p>}
        </div>
      </form>

        <p className="text-center text-sm text-muted-foreground">
            {authAction === 'login' ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}
            <Button variant="link" onClick={toggleAuthAction} className="p-0 h-auto">
                 {authAction === 'login' ? 'Regístrate' : 'Inicia Sesión'}
            </Button>
        </p>
    </div>
  )
}

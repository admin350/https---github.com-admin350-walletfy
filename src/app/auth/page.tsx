
import { UserAuthForm } from "@/components/auth/user-auth-form"
import { Wallet } from "lucide-react"

export default function AuthenticationPage() {
  return (
    <>
      <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
          <div className="relative z-20 flex items-center text-3xl font-bold text-primary">
            <Wallet className="h-8 w-8 mr-2" />
            FA WALLET
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Toma el control de tus finanzas con una claridad y poder sin precedentes. Tu futuro financiero comienza hoy.&rdquo;
              </p>
              <footer className="text-sm">FA Vision Team</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8 h-full flex items-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Crea o accede a tu cuenta
              </h1>
              <p className="text-sm text-muted-foreground">
                Ingresa tu correo para continuar
              </p>
            </div>
            <UserAuthForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              Al hacer clic en continuar, aceptas nuestros{" "}
              <a
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Términos de Servicio
              </a>{" "}
              y{" "}
              <a
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Política de Privacidad
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

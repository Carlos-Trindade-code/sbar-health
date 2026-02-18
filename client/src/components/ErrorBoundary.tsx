import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, ArrowLeft, Home } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4 text-foreground">Ocorreu um erro inesperado.</h2>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Algo deu errado ao carregar esta página. Tente voltar ou recarregar.
            </p>

            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6 max-h-48">
              <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                {this.state.error?.message}
              </pre>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => window.history.back()}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-muted text-foreground border border-border",
                  "hover:bg-accent cursor-pointer"
                )}
              >
                <ArrowLeft size={16} />
                Voltar
              </button>

              <button
                onClick={() => { window.location.href = "/dashboard"; }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-muted text-foreground border border-border",
                  "hover:bg-accent cursor-pointer"
                )}
              >
                <Home size={16} />
                Início
              </button>

              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-primary text-primary-foreground",
                  "hover:opacity-90 cursor-pointer"
                )}
              >
                <RotateCcw size={16} />
                Recarregar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

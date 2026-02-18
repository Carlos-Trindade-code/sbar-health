import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionSectionProps {
  title: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function AccordionSection({
  title,
  icon,
  badge,
  badgeColor = "bg-primary",
  defaultOpen = false,
  children,
  className
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="font-medium">{title}</span>
          {badge !== undefined && (
            <span className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full text-white",
              badgeColor
            )}>
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 border-t bg-background">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Multi-accordion that allows only one section open at a time
interface AccordionGroupProps {
  children: React.ReactNode;
  className?: string;
}

interface AccordionItemProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  children: React.ReactNode;
}

export function AccordionGroup({ children, className }: AccordionGroupProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={cn("space-y-2", className)}>
      {Array.isArray(children) ? children.map((child: any) => {
        if (!child?.props?.id) return child;
        
        const isOpen = openId === child.props.id;
        
        return (
          <div key={child.props.id} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenId(isOpen ? null : child.props.id)}
              className="w-full flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {child.props.icon && <span className="text-muted-foreground">{child.props.icon}</span>}
                <span className="font-medium">{child.props.title}</span>
                {child.props.badge !== undefined && (
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full text-white",
                    child.props.badgeColor || "bg-primary"
                  )}>
                    {child.props.badge}
                  </span>
                )}
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </button>
            
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 border-t bg-background">
                    {child.props.children}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      }) : children}
    </div>
  );
}

export function AccordionItem({ children }: AccordionItemProps) {
  return <>{children}</>;
}
